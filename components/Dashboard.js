"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchuser, updateProfile } from "@/actions/useractions";
import { useToast } from "./Toast";

const Dashboard = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    profilepic: "",
    coverpic: "",
    razorpayid: "",
    razorpaysecret: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.name) {
      const getData = async () => {
        try {
          const user = await fetchuser(session.user.name);
          if (user) {
            setForm({
              name: user.name || "",
              email: session.user.email || user.email || "",
              username: user.username || session.user.name || "",
              profilepic: user.profilepic || "",
              coverpic: user.coverpic || "",
              razorpayid: user.razorpayid || "",
              razorpaysecret: user.razorpaysecret || "",
            });
          }
        } catch (error) {
          console.error("Failed to load profile:", error);
          toast.error("Could not load your profile details.");
        } finally {
          setLoading(false);
        }
      };

      getData();
    }
  }, [session, status, router, toast]);

  const handleChange = (e) => {
    if (e.target.name === "profilepic") {
      setImgError(false);
    }
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.name) {
      toast.error("You must be logged in to save changes.");
      return;
    }

    setSaving(true);

    try {
      const res = await updateProfile(form, session.user.name);

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success(res.message || "Profile updated successfully!");

        if (res.user) {
          setForm((prev) => ({
            ...prev,
            name: res.user.name,
            username: res.user.username,
            profilepic: res.user.profilepic,
            coverpic: res.user.coverpic,
            razorpayid: res.user.razorpayid,
          }));
        }

        if (typeof update === "function") {
          await update();
        }

        router.refresh();
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-sm text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-amber-400">
              Creator Dashboard
            </p>

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Welcome back,{" "}
              <span className="text-amber-400">
                {form.name || form.username || "Creator"}
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
              Keep your profile and payment keys up to date so your community can
              discover and support your creative work.
            </p>
          </div>

          {form.username && (
            <a
              href={`/${form.username}`}
              className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-400/20 transition"
            >
              <span>☕</span> View Public Page
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile Card */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
            {/* Card Header */}
            <div className="border-b border-white/10 px-6 py-6 md:px-8">
              <div className="flex items-center gap-4">
                {/* Profile Image Preview */}
                {form.profilepic && !imgError ? (
                  <img
                    src={form.profilepic}
                    alt={form.name || "Profile"}
                    onError={() => setImgError(true)}
                    className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-2xl font-bold text-black">
                    {(form.name || form.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Public Profile Information
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    This information represents you on your public creator page.
                  </p>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Display Name
                </label>
                <input
                  value={form.name}
                  onChange={handleChange}
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Your full or creator name"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>

              {/* Email (read-only for security) */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Account Email <span className="text-xs text-gray-500">(Verified)</span>
                </label>
                <input
                  value={form.email}
                  disabled
                  type="email"
                  name="email"
                  id="email"
                  className="w-full rounded-xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-gray-400 cursor-not-allowed outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    @
                  </span>
                  <input
                    value={form.username}
                    onChange={handleChange}
                    type="text"
                    name="username"
                    id="username"
                    placeholder="yourusername"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-8 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Your public page URL: <span className="text-amber-400/90">/{form.username || "username"}</span>
                </p>
              </div>

              {/* Profile Picture */}
              <div>
                <label
                  htmlFor="profilepic"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Profile Picture URL
                </label>
                <input
                  value={form.profilepic}
                  onChange={handleChange}
                  type="url"
                  name="profilepic"
                  id="profilepic"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Direct image URL for your avatar.
                </p>
              </div>

              {/* Cover Picture */}
              <div className="md:col-span-2">
                <label
                  htmlFor="coverpic"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Cover Banner URL
                </label>
                <input
                  value={form.coverpic}
                  onChange={handleChange}
                  type="url"
                  name="coverpic"
                  id="coverpic"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                />
                <p className="mt-2 text-xs text-gray-500">
                  A high-resolution banner image shown at the top of your creator page.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/3">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-6 md:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    viewBox="0 0 24 24"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Razorpay Payment Gateway
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-gray-400">
                    Connect your Razorpay Key ID and Key Secret to receive direct
                    supporter contributions into your bank account.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Fields */}
            <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
              {/* Razorpay Key ID */}
              <div>
                <label
                  htmlFor="razorpayid"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Razorpay Key ID
                </label>
                <input
                  value={form.razorpayid}
                  onChange={handleChange}
                  type="text"
                  name="razorpayid"
                  id="razorpayid"
                  placeholder="rzp_live_... or rzp_test_..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Public Razorpay API key identifier.
                </p>
              </div>

              {/* Razorpay Key Secret */}
              <div>
                <label
                  htmlFor="razorpaysecret"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Razorpay Key Secret
                </label>
                <input
                  value={form.razorpaysecret}
                  onChange={handleChange}
                  type="password"
                  name="razorpaysecret"
                  id="razorpaysecret"
                  placeholder="••••••••••••••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                />
                <p className="mt-2 text-xs text-amber-400/70">
                  Your secret is encrypted and strictly hidden from public pages.
                </p>
              </div>
            </div>
          </section>

          {/* Save Action */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/2 p-6 sm:flex-row">
            <div>
              <p className="text-sm font-medium text-gray-200">
                Ready to save your profile changes?
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Changes will immediately update your public creator page.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex min-w-40 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Saving changes...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Dashboard;
