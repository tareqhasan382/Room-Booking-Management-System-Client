"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { createCheckoutSession, payBooking } from "@/lib/api";
import {
  X,
  CreditCard,
  Lock,
  Loader2,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const TEST_CARDS = [
  { label: "Visa (approved)", value: "4242 4242 4242 4242" },
  { label: "Mastercard (approved)", value: "5555 5555 5555 4444" },
  { label: "Visa (declined)", value: "4000 0000 0000 0002" },
];

const inputCls =
  "w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-shadow";

const PaymentModal = ({ booking, token, onSuccess, onClose }) => {
  const toast = useToast();
  const [gateway, setGateway] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
  });

  useEffect(() => {
    let mounted = true;
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/payments/checkout", { cache: "no-store" });
        const json = await res.json();
        if (mounted) setGateway(json?.data?.gateway || "sandbox");
      } catch {
        if (mounted) setGateway("sandbox");
      }
    };
    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      const res = await createCheckoutSession(booking._id, token);
      if (res?.success && res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      if (res?.data?.gateway === "sandbox") {
        setShowCardForm(true);
        setLoading(false);
        return;
      }
      toast.error(res?.message || "Failed to start checkout");
      setLoading(false);
    } catch (err) {
      toast.error(err?.message || "Failed to start checkout");
      setLoading(false);
    }
  };

  const handleSandboxPay = async () => {
    if (!card.name.trim() || !card.number.trim() || !card.expiry.trim() || !card.cvc.trim()) {
      toast.error("Please fill in all card details.");
      return;
    }
    setLoading(true);
    try {
      const res = await payBooking(booking._id, { card }, token);
      if (res?.success) {
        toast.success("Payment successful!");
        onSuccess?.(res.data);
      } else {
        toast.error(res?.message || "Payment failed");
      }
      setLoading(false);
    } catch (err) {
      toast.error(err?.message || "Payment failed");
      setLoading(false);
    }
  };

  const renderStripe = () => (
    <div className="space-y-4">
      <button
        onClick={handleStripeCheckout}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-sky-500/25"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" /> Pay securely with Stripe
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock className="w-3.5 h-3.5" /> You&apos;ll be redirected to Stripe&apos;s secure
        hosted checkout. Card details never touch our servers.
      </p>
    </div>
  );

  const renderSandbox = () => (
    <div className="space-y-3">
      <div className="rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-100 dark:border-sky-900 p-3 text-xs text-sky-700 dark:text-sky-200">
        <p className="font-semibold mb-1">Sandbox gateway — no real money is charged</p>
        <p>Use any of the test cards below:</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {TEST_CARDS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCard((prev) => ({ ...prev, number: c.value }))}
              className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-sky-200 dark:border-sky-800 text-[11px] hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Cardholder name
        <input
          type="text"
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e.target.value })}
          placeholder="John Doe"
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Card number
        <input
          type="text"
          inputMode="numeric"
          value={card.number}
          onChange={(e) => setCard({ ...card, number: e.target.value })}
          placeholder="4242 4242 4242 4242"
          className={inputCls}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Expiry
          <input
            type="text"
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: e.target.value })}
            placeholder="MM/YY"
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          CVC
          <input
            type="text"
            inputMode="numeric"
            value={card.cvc}
            onChange={(e) => setCard({ ...card, cvc: e.target.value })}
            placeholder="123"
            className={inputCls}
          />
        </label>
      </div>

      <button
        onClick={handleSandboxPay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" /> Pay ${(booking.totalAmount ?? 0).toFixed(2)}
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[95] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-sky-500 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Complete Payment
            </h2>
            <p className="text-xs opacity-80">#{booking._id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {booking.roomId?.title || "Room"} · {booking.nights || 1} night(s)
            </p>
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Amount due</p>
                <p className="text-3xl font-bold text-sky-500">
                  ${(booking.totalAmount ?? 0).toFixed(2)}
                </p>
              </div>
              {gateway === "stripe" && (
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Powered by Stripe
                </span>
              )}
            </div>
          </div>

          {gateway === null ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading payment methods...
            </div>
          ) : gateway === "stripe" && !showCardForm ? (
            renderStripe()
          ) : (
            renderSandbox()
          )}

          {gateway === "stripe" && (
            <button
              onClick={() => setShowCardForm(true)}
              className="mt-3 w-full text-center text-xs text-gray-400 hover:text-sky-500 transition-colors"
            >
              {showCardForm ? "← Back to Stripe" : "Use sandbox card form instead"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
