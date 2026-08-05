"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { signIn } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Hooks/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { demoCredentials } from "@/lib/staticData";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  Clock,
  Star,
  Hotel,
  ArrowRight,
  KeyRound,
} from "lucide-react";

const inputClass =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all";

const SignIn = () => {
  const { login, token } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [state, setState] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      router.push("/");
    }
  }, [token, router]);

  const inputHandle = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await signIn(state);
      if (data.success) {
        login(data.token, data.data);
        toast.success(`Welcome back, ${data.data.name}!`);
        router.push("/");
      } else {
        toast.error(data.message || "Invalid email or password.");
      }
    } catch (error) {
      toast.error(`Error during login ${error}`);
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
              Your dream stay
              <br />
              is one login away
            </h2>
            <p className="mt-4 text-sky-100 leading-relaxed">
              Sign in to manage your bookings, view invoices and unlock member-only
              rates.
            </p>
          </div>

          <div className="relative flex flex-col gap-3 mt-10">
            {[
              { icon: ShieldCheck, text: "Secure & encrypted payments" },
              { icon: Clock, text: "24/7 concierge support" },
              { icon: Star, text: "Rated 4.8/5 by 1,200+ guests" },
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
        </div>

        {/* Form panel */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <span className="inline-flex md:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 text-xs font-bold mb-6 self-start">
            <Hotel className="w-3.5 h-3.5" /> Room Booking
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Please sign in to continue to your account.
          </p>

          {/* Demo credentials */}
          <div className="mt-6 mb-6 flex flex-col gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Try a demo account:
            </p>
            <div className="flex flex-wrap gap-2">
              {demoCredentials.map((cred) => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() =>
                    setState({ email: cred.email, password: cred.password })
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900 transition-colors"
                >
                  {cred.label}: {cred.email}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                placeholder="Password"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/30 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-sky-500 hover:text-sky-600 hover:underline"
            >
              Register
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <KeyRound className="w-3.5 h-3.5" />
            Demo user: john@example.com / password123
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
