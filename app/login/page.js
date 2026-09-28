"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";

const LoginPage = () => {
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
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: trimmedEmail,
        password: password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        setErrorMessage(
          res.error === "CredentialsSignin"
            ? "Invalid email or password."
            : res.error
        );
        setLoading(false);
      } else if (res?.ok) {
        toast.success("Welcome back.");
        router.push("/dashboard");
        router.refresh();
      } else {
        setErrorMessage("Sign in failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#171613] text-[#F4F0E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 w-10 rounded-[8px] bg-[#201F1B] border border-[#34322C] text-[#C96F43] font-bold text-base mb-4 hover:border-[#77736B]/40 transition-colors"
          >
            ☕
          </Link>

          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#F4F0E8]">
            Sign in to The Brew Club
          </h1>

          <p className="mt-1.5 text-xs text-[#AAA59A]">
            Access your creator workspace or manage contributions.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 shadow-sm">
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 rounded-[6px] border border-[#C85C52]/30 bg-[#C85C52]/10 px-3 py-2 text-xs text-[#C85C52]"
            >
              {errorMessage}
            </div>
          )}

          {/* Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-[#AAA59A] mb-1"
              >
                Email
              </label>
              <input
                id="login-email"
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
                className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] placeholder-[#77736B] outline-none transition focus:border-[#C96F43] focus:ring-1 focus:ring-[#C96F43]/40"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-[#AAA59A]"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="••••••••••••"
                  className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] py-2 pl-3 pr-9 text-xs text-[#F4F0E8] placeholder-[#77736B] outline-none transition focus:border-[#C96F43] focus:ring-1 focus:ring-[#C96F43]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#77736B] hover:text-[#AAA59A] text-xs transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] active:bg-[#C96F43] px-4 py-2.5 text-xs font-medium text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full border-t border-[#34322C]" />
            <span className="absolute bg-[#201F1B] px-2 text-[11px] text-[#77736B]">
              OR
            </span>
          </div>

          {/* Social OAuth buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] hover:bg-[#282721] px-4 py-2 text-xs font-medium text-[#F4F0E8] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.41 7.86 10.94.57.1.78-.25.78-.55v-2.13c-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] hover:bg-[#282721] px-4 py-2 text-xs font-medium text-[#F4F0E8] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
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

          {/* Switch to Join */}
          <div className="mt-5 pt-4 border-t border-[#34322C] text-center">
            <p className="text-xs text-[#AAA59A]">
              Don&apos;t have an account?{" "}
              <Link
                href="/join"
                className="text-[#C96F43] hover:text-[#D98255] font-medium transition-colors"
              >
                Join the club
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
