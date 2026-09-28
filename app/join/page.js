"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/useractions";
import { useToast } from "@/components/Toast";

const JoinPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. yourname@gmail.com).");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const regRes = await registerUser({
        email: trimmedEmail,
        password: password,
      });

      if (!regRes.success) {
        setErrorMessage(regRes.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Automatically sign in the newly registered user
      const loginRes = await signIn("credentials", {
        email: trimmedEmail,
        password: password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (loginRes?.ok) {
        toast.success("Welcome to The Brew Club! ☕");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.success("Account created successfully! Please sign in.");
        router.push("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#0b0b0f] text-white relative overflow-hidden flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-black text-2xl font-bold shadow-lg shadow-orange-500/20 mb-4">
            ☕
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Join The Brew Club
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-gray-400">
            Create your account to start your creator page, receive supporter contributions,
            or back your favorite creators.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/3 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 flex items-start gap-2.5"
            >
              <span className="text-rose-400 text-base leading-none">⚠️</span>
              <span className="flex-1 font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="join-email"
                className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Email
              </label>
              <input
                id="join-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="yourname@gmail.com"
                className="w-full h-11 px-3.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 transition focus:border-amber-400/50 focus:bg-white/8 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="join-password"
                  className="block text-xs font-semibold text-gray-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <span className="text-[11px] text-gray-500">Min 6 characters</span>
              </div>

              <div className="relative">
                <input
                  id="join-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-3.5 pr-11 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 transition focus:border-amber-400/50 focus:bg-white/8 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center rounded-xl bg-linear-to-r from-amber-400 to-orange-500 text-sm font-bold text-black transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-orange-500/20 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#121217] px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              OR
            </span>
          </div>

          {/* Social OAuth buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#24292e] hover:bg-[#2f363d] text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.41 7.86 10.94.57.1.78-.25.78-.55v-2.13c-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.2 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.7 15.9 18.9 12 24 12c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.2 6.1 29.3 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.7 35.1 27 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.7 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.4 5.5-6.3 7.1l6.3 5.2C39 36.6 44 31 44 24c0-1.3-.1-2.4-.4-3.5z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Log in Link */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-semibold transition underline underline-offset-2"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default JoinPage;
