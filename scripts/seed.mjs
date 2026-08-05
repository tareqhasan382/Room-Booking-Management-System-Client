/**
 * Seeds the MongoDB database used by the Next.js app.
 * Usage: npm run seed
 * Reads DATABASE_URL from .env.local and inserts an admin user, a demo user,
 * sample rooms and sample bookings when they do not already exist.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const DATABASE_URL = process.env.DATABASE_URL;
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

if (!DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    image: String,
    phone: String,
    address: String,
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema(
  {
    title: String,
    rent: Number,
    facilities: [String],
    picture: String,
    unavailableDates: [Date],
    category: { type: String, enum: ["Basic", "Luxury", "Suite"], default: "Basic" },
    description: String,
    capacity: Number,
    size: Number,
    beds: String,
    rating: Number,
    reviews: Number,
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    checkInDate: Date,
    checkOutDate: Date,
    checkInTime: String,
    checkOutTime: String,
    guests: Number,
    contactName: String,
    contactEmail: String,
    contactPhone: String,
    specialRequests: String,
    nights: Number,
    subtotal: Number,
    tax: Number,
    totalAmount: Number,
    paymentStatus: { type: String, enum: ["UNPAID", "PAID", "REFUNDED"], default: "UNPAID" },
    status: { type: String, enum: ["CONFIRMED", "PENDING", "CANCELLED", "COMPLETED"], default: "CONFIRMED" },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    title: String,
    comment: String,
    verified: Boolean,
  },
  { timestamps: true }
);
reviewSchema.index({ roomId: 1, userId: 1 }, { unique: true });

const nightReservationSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    nightDate: Date,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true }
);
nightReservationSchema.index({ roomId: 1, nightDate: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
const NightReservation =
  mongoose.models.NightReservation ||
  mongoose.model("NightReservation", nightReservationSchema);

const getNightDates = (checkIn, checkOut) => {
  const dates = [];
  const start = new Date(checkIn);
  start.setHours(0, 0, 0, 0);
  const endDay = new Date(checkOut);
  endDay.setHours(0, 0, 0, 0);
  let cur = new Date(start);
  while (cur < endDay) {
    dates.push(new Date(cur));
    cur = new Date(cur.getTime() + 86400000);
  }
  return dates;
};

const rebuildUnavailableDates = async (roomId) => {
  const bookings = await Booking.find({
    roomId,
    status: { $ne: "CANCELLED" },
  }).select("checkInDate checkOutDate");
  const set = new Set();
  for (const b of bookings) {
    for (const d of getNightDates(b.checkInDate, b.checkOutDate)) {
      set.add(new Date(d).setHours(0, 0, 0, 0));
    }
  }
  await Room.updateOne(
    { _id: roomId },
    { $set: { unavailableDates: [...set].map((t) => new Date(t)) } }
  );
};

const img = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const rooms = [
  ["Classic Queen Room", "Basic", 50, ["Free WiFi", "Air Conditioning", "Queen Bed", "Work Desk", "TV"], img("photo-1566665797739-1674de7a421a"), 2, 220, "1 Queen", 4.5, 128],
  ["Comfort Twin Room", "Basic", 65, ["Free WiFi", "Air Conditioning", "2 Twin Beds", "Breakfast", "Balcony"], img("photo-1590490360182-c33d57733427"), 2, 240, "2 Twin", 4.3, 94],
  ["Garden View Double", "Basic", 72, ["Free WiFi", "Air Conditioning", "Double Bed", "Garden View", "Coffee Station"], img("photo-1595576508898-0ad5c879a061"), 2, 260, "1 Double", 4.6, 76],
  ["Deluxe King Room", "Luxury", 120, ["Free WiFi", "King Bed", "Minibar", "City View", "Room Service", "Smart TV"], img("photo-1611892440504-42a792e24d32"), 3, 320, "1 King", 4.8, 214],
  ["Executive Luxury Room", "Luxury", 145, ["Free WiFi", "King Bed", "Espresso Machine", "Executive Lounge", "Work Desk", "Bathtub"], img("photo-1582719478250-c89cae4dc85b"), 3, 350, "1 King", 4.9, 167],
  ["Skyline Panorama Room", "Luxury", 160, ["Free WiFi", "King Bed", "Rain Shower", "Skyline View", "Turndown Service", "Balcony"], img("photo-1615874959474-d609969a20ed"), 2, 330, "1 King", 4.7, 143],
  ["Royal Suite", "Suite", 220, ["Free WiFi", "King Bed", "Living Room", "Dining Area", "Bathtub", "Butler Service", "Panoramic View"], img("photo-1631049307264-da0ec9d70304"), 4, 520, "1 King + Sofa Bed", 4.9, 98],
  ["Family Terrace Suite", "Suite", 250, ["Free WiFi", "2 Queen Beds", "Private Terrace", "Kids Corner", "Kitchenette", "Smart TV"], img("photo-1522708323590-d24dbb6b0267"), 5, 600, "2 Queen", 4.6, 87],
  ["Couple's Romance Suite", "Luxury", 175, ["Free WiFi", "King Bed", "Private Balcony", "Bathtub", "Champagne", "Candlelight Setup"], img("photo-1505693416388-ac5ce068fe85"), 2, 300, "1 King", 4.9, 132],
  ["Panorama Penthouse", "Suite", 450, ["Free WiFi", "King Bed", "Wrap-Around Terrace", "Hot Tub", "Outdoor Dining", "Butler Service"], img("photo-1600607687939-ce8a6c25118c"), 4, 900, "1 King + Sofa Bed", 5.0, 41],
];

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    image: "https://picsum.photos/seed/john/200/200",
    phone: "+1 555 0100",
    address: "123 Main Street, New York",
    role: "USER",
  },
  {
    name: "Admin",
    email: "admin@roombook.com",
    password: "admin123",
    image: "https://picsum.photos/seed/admin/200/200",
    phone: "+1 555 0199",
    address: "1 Hotel Plaza, Dhaka",
    role: "ADMIN",
  },
];

async function main() {
  await mongoose.connect(DATABASE_URL);
  console.log("Connected to database");

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User ${u.email} already exists, skipping`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, SALT_ROUNDS);
    await User.create({ ...u, password: hashed });
    console.log(`Created user ${u.email} (${u.role})`);
  }

  const hotelRoomExists = await Room.countDocuments({ title: "Classic Queen Room" });
  if (hotelRoomExists === 0) {
    for (const [title, category, rent, facilities, picture, capacity, size, beds, rating, reviews] of rooms) {
      await Room.create({
        title,
        category,
        rent,
        facilities,
        picture,
        capacity,
        size,
        beds,
        rating,
        reviews,
        description: `A beautifully appointed ${category.toLowerCase()} room — ${title.toLowerCase()}.`,
      });
    }
    console.log(`Created ${rooms.length} hotel rooms`);
  } else {
    console.log("Hotel rooms already exist, skipping");
  }

  const bookingCount = await Booking.countDocuments();
  if (bookingCount === 0) {
    const john = await User.findOne({ email: "john@example.com" });
    const deluxe = await Room.findOne({ title: "Deluxe King Room" });
    const queen = await Room.findOne({ title: "Classic Queen Room" });
    if (john && deluxe && queen) {
      const in1 = new Date(Date.now() + 10 * 86400000);
      const out1 = new Date(Date.now() + 13 * 86400000);
      const in2 = new Date(Date.now() + 20 * 86400000);
      const out2 = new Date(Date.now() + 22 * 86400000);
      const nights1 = 3;
      const nights2 = 2;
      const subtotal1 = Math.round(deluxe.rent * nights1 * 100) / 100;
      const subtotal2 = Math.round(queen.rent * nights2 * 100) / 100;
      await Booking.create([
        {
          userId: john._id,
          roomId: deluxe._id,
          checkInDate: in1,
          checkOutDate: out1,
          checkInTime: "14:00",
          checkOutTime: "11:00",
          guests: 2,
          contactName: "John Doe",
          contactEmail: "john@example.com",
          contactPhone: "+1 555 0100",
          specialRequests: "Quiet room, early check-in",
          nights: nights1,
          subtotal: subtotal1,
          tax: Math.round(subtotal1 * 0.08 * 100) / 100,
          totalAmount: subtotal1 * 1.08,
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
        {
          userId: john._id,
          roomId: queen._id,
          checkInDate: in2,
          checkOutDate: out2,
          checkInTime: "15:00",
          checkOutTime: "12:00",
          guests: 1,
          contactName: "John Doe",
          contactEmail: "john@example.com",
          contactPhone: "+1 555 0100",
          nights: nights2,
          subtotal: subtotal2,
          tax: Math.round(subtotal2 * 0.08 * 100) / 100,
          totalAmount: subtotal2 * 1.08,
          paymentStatus: "UNPAID",
          status: "PENDING",
        },
      ]);
      console.log("Created 2 sample bookings for john@example.com");
    }
  } else {
    console.log("Bookings already exist, skipping");
  }

  const activeBookings = await Booking.find({ status: { $ne: "CANCELLED" } });
  if (activeBookings.length > 0) {
    const datesByRoom = {};
    for (const b of activeBookings) {
      const nights = getNightDates(b.checkInDate, b.checkOutDate);
      for (const nightDate of nights) {
        datesByRoom[String(b.roomId)] = datesByRoom[String(b.roomId)] || [];
        datesByRoom[String(b.roomId)].push({
          roomId: b.roomId,
          nightDate,
          bookingId: b._id,
        });
      }
    }
    for (const [roomIdStr, entries] of Object.entries(datesByRoom)) {
      try {
        await NightReservation.insertMany(entries, { ordered: false });
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
      await rebuildUnavailableDates(roomIdStr);
    }
    console.log(`Backfilled night reservations for ${activeBookings.length} booking(s)`);
  }

  const seededReviews = [
    {
      roomTitle: "Deluxe King Room",
      rating: 5,
      title: "Absolutely worth it",
      comment: "Spotless room, incredible city view and the bed was super comfy. Would stay again.",
    },
    {
      roomTitle: "Classic Queen Room",
      rating: 4,
      title: "Great value",
      comment: "Clean, quiet and well located. AC worked perfectly. Breakfast could be better.",
    },
  ];
  const john = await User.findOne({ email: "john@example.com" });
  for (const r of seededReviews) {
    const room = await Room.findOne({ title: r.roomTitle });
    if (!john || !room) continue;
    await Review.updateOne(
      { roomId: room._id, userId: john._id },
      {
        $set: {
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          verified: true,
        },
      },
      { upsert: true }
    );
  }
  for (const r of seededReviews) {
    const room = await Room.findOne({ title: r.roomTitle });
    if (!room) continue;
    const agg = await Review.aggregate([
      { $match: { roomId: room._id } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const row = agg[0];
    await Room.updateOne(
      { _id: room._id },
      { $set: { rating: row ? Math.round(row.avg * 10) / 10 : 0, reviews: row ? row.count : 0 } }
    );
  }
  console.log("Seeded reviews and recomputed room ratings");

  await mongoose.disconnect();
  console.log("Seed complete");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
