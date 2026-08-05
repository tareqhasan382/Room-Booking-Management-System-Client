import Stripe from "stripe";

/**
 * Payment gateway abstraction.
 *
 * When STRIPE_SECRET_KEY is present the live/test Stripe checkout flow is
 * used (cards are handled by Stripe's hosted checkout — PCI-compliant, no
 * card data ever touches this server). Otherwise a built-in sandbox gateway
 * "processes" payments locally so the full lifecycle still works offline.
 */

export const GATEWAY =
  process.env.PAYMENT_GATEWAY || (process.env.STRIPE_SECRET_KEY ? "stripe" : "sandbox");

const stripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";

/** Simple Luhn check used by the sandbox gateway to validate card numbers. */
export function luhnCheck(num) {
  const digits = String(num).replace(/\D/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

const VALID_TEST_CARDS = {
  "4242424242424242": "Visa",
  "5555555555554444": "Mastercard",
  "4000056655665556": "Visa",
  "5105105105105100": "Mastercard",
  "378282246310005": "Amex",
  "6011111111111117": "Discover",
};

function detectBrand(number) {
  const n = String(number).replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  return "Card";
}

/**
 * Sandbox gateway — validates and "processes" a card locally.
 * 4000000000000002 is hard-coded to decline so the failure path can be demoed.
 */
export async function chargePayment({ amount, currency = "USD", card = {} }) {
  const number = String(card.number || "").replace(/\s/g, "");
  const expiry = String(card.expiry || "");
  const cvc = String(card.cvc || "");
  const name = String(card.name || "").trim();

  if (name.length < 2) return { success: false, message: "Cardholder name is required" };
  if (!/^\d{13,19}$/.test(number) || !luhnCheck(number)) {
    return { success: false, message: "Card number is invalid" };
  }
  if (!/^\d{3,4}$/.test(cvc)) {
    return { success: false, message: "CVC is invalid" };
  }

  const m = /^(\d{2})\s*\/\s*(\d{2,4})$/.exec(expiry);
  if (!m) return { success: false, message: "Expiry must be in MM/YY format" };
  const month = Number(m[1]);
  let year = Number(m[2]);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return { success: false, message: "Expiry month is invalid" };

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  if (year < nowYear || (year === nowYear && month < nowMonth)) {
    return { success: false, message: "Card has expired" };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: "Invalid payment amount" };
  }

  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 600));

  const brand = detectBrand(number);
  if (number === "4000000000000002") {
    return { success: false, message: "The card was declined by the processor" };
  }

  const transactionId = `sbx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const cardLast4 = number.slice(-4);

  console.log(
    `[payments:sandbox] charged $${amount.toFixed(2)} ${currency} ` +
      `txn=${transactionId} card=${brand} •••• ${cardLast4}`
  );

  return {
    success: true,
    transactionId,
    cardLast4,
    cardBrand: VALID_TEST_CARDS[number] || brand,
    amount,
    currency,
  };
}

/**
 * Stripe gateway — creates a hosted Checkout Session for a booking.
 * The user is redirected to the returned url to enter card details with Stripe.
 */
export async function createStripeCheckoutSession({ booking, guest }) {
  const amount = Math.round((booking.totalAmount || 0) * 100);
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: `${booking.roomId?.title || "Room"} — ${booking.nights || 1} night(s)`,
            description:
              `Check-in ${new Date(booking.checkInDate).toLocaleDateString()} · ` +
              `Check-out ${new Date(booking.checkOutDate).toLocaleDateString()}`,
          },
        },
      },
    ],
    customer_email: guest.email || undefined,
    metadata: { bookingId: String(booking._id), userId: String(guest._id || guest.userId) },
    success_url: `${SITE_URL}/order?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/order?checkout=cancelled`,
  });
  return session;
}

/**
 * Verifies a Stripe Checkout Session server-side and returns the payment
 * details when it has been paid.
 */
export async function verifyStripeSession(sessionId) {
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return { success: false, status: session.payment_status };
  }
  const paymentIntent = session.payment_intent
    ? await stripe().paymentIntents.retrieve(session.payment_intent)
    : null;
  return {
    success: true,
    transactionId: session.payment_intent || session.id,
    cardLast4: paymentIntent?.charges?.data?.[0]?.payment_method_details?.card?.last4 || "••••",
    cardBrand: paymentIntent?.charges?.data?.[0]?.payment_method_details?.card?.brand || "Card",
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || "usd",
    bookingId: session.metadata?.bookingId,
  };
}

export function getPaymentProvider() {
  return GATEWAY;
}
