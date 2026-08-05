"use client";
import Image from "next/image";
import { useAuth } from "@/Hooks/AuthProvider";
import { useBookings } from "@/Hooks/useBookings";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { changePassword, updateProfile } from "@/lib/api";
import ImageUploader from "@/components/ui/ImageUploader";
import { CalendarCheck, MapPin, Mail, Phone, PenLine, KeyRound, CalendarClock } from "lucide-react";

const inputCls =
  "w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-shadow";

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { data: bookings = [] } = useBookings(token);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", image: "" });

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        image: user.image || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  if (!user) return null;

  const activeBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(
        {
          name: form.name,
          phone: form.phone,
          address: form.address,
          image: form.image,
        },
        token
      );
      if (res?.success) {
        updateUser({ ...user, ...res.data });
        setEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (pwd.newPassword !== pwd.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPwd(true);
    try {
      const res = await changePassword(
        { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword },
        token
      );
      if (res?.success) {
        toast.success("Password changed successfully");
        setPwd({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to change password");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: avatar + identity */}
        <div className="md:col-span-1">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-sky-400 mb-4 shadow-lg">
              {user.image ? (
                <Image
                  width={112}
                  height={112}
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 text-4xl font-bold text-white">
                  {user.name?.[0] || "U"}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <span
              className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                user.role === "ADMIN"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                  : "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200"
              }`}
            >
              {user.role}
            </span>
            {memberSince && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" /> Member since {memberSince}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow p-3 text-center">
              <p className="text-2xl font-bold text-sky-500">{bookings.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow p-3 text-center">
              <p className="text-2xl font-bold text-green-500">{activeBookings}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow p-3 text-center">
              <p className="text-2xl font-bold text-amber-500">{pendingBookings}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Account Details</h3>
              <button
                onClick={() => setEditing((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
              >
                <PenLine className="w-4 h-4" /> {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Name
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Email
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className={`${inputCls} opacity-60 cursor-not-allowed`}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Phone
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Address
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <ImageUploader
                      value={form.image}
                      onChange={(url) => setForm({ ...form, image: url })}
                      folder="rbm/avatars"
                      label="Profile image"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p>{user.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p>{user.address || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Account type</p>
                    <p className="capitalize">{user.role?.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change password */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-500" /> Change Password
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Use a strong password you don&apos;t use elsewhere.
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Current password
                <input
                  type="password"
                  value={pwd.currentPassword}
                  onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                  className={inputCls}
                  required
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  New password
                  <input
                    type="password"
                    value={pwd.newPassword}
                    onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                    className={inputCls}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Confirm new password
                  <input
                    type="password"
                    value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                    className={inputCls}
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={changingPwd}
                className="px-6 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {changingPwd ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
