"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signUp } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  ShieldCheck,
  Clock,
  Star,
  Hotel,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const inputClass =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all";

const SignUp = () => {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputHandle = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (state.password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await signUp(state);
      if (data.success) {
        toast.success("Account created! Please sign in.");
        router.push("/sign-in");
      } else {
        toast.error(data.message || "Sign up failed. Please try again.");
      }
    } catch (error) {
      toast.error(`Error during signup ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl shadow-sky-900/10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800">
        {/* Brand panel */}
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-sky-600 via-sky-500 to-blue-600 text-white overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-amber-300/20 blur-2xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur text-sm font-bold">
              <Hotel className="w-4 h-4" /> Room Booking &amp; Management
            </span>
            <h2 className="mt-8 text-4xl font-extrabold leading-tight">
              Join us &amp;
              <br />
              book with ease
            </h2>
            <p className="mt-4 text-sky-100 leading-relaxed">
              Create a free account to unlock instant bookings, online check-in
              and exclusive member pricing.
            </p>
          </div>

          <div className="relative flex flex-col gap-3 mt-10">
            {[
              { icon: CheckCircle2, text: "Free to join — no hidden fees" },
              { icon: Clock, text: "Instant booking confirmation" },
              { icon: Star, text: "Member-only rates & rewards" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm font-medium text-sky-50"
              >
                <span className="p-2 rounded-xl bg-white/15">
                  <Icon className="w-4 h-4" />
                </span>
                {text}
              </div>
            ))}
          </div>

          <div className="relative flex items-center gap-3 text-sky-50 text-sm font-medium">
            <ShieldCheck className="w-5 h-5" />
            Your data is protected &amp; secure
          </div>
        </div>

        {/* Form panel */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <span className="inline-flex md:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 text-xs font-bold mb-6 self-start">
            <Hotel className="w-3.5 h-3.5" /> Room Booking
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            It takes less than a minute.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={state.name}
                onChange={inputHandle}
                placeholder="Full name"
                className={inputClass}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={state.email}
                onChange={inputHandle}
                placeholder="Email address"
                className={inputClass}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={state.password}
                onChange={inputHandle}
                placeholder="Password (min 6 characters)"
                className={`${inputClass} pr-11`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className={`${inputClass} pr-11`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Toggle confirm password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/30 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-bold text-sky-500 hover:text-sky-600 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
