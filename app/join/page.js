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
      setErrorMessage("Please enter a valid email address.");
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
        toast.success("Account created successfully. Please log in.");
        router.push("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#F7F4EE] text-[#1E1D1A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 w-12 rounded-[10px] bg-[#FFFFFF] border border-[#DED8CE] shadow-xs text-[#C86B3C] text-xl font-bold mb-4 hover:border-[#C5BDB0] transition"
          >
            ☕
          </Link>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1D1A]">
            Join The Brew Club
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#6F6A60]">
            Create your creator page or back independent builders.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[12px] border border-[#DED8CE] bg-[#FFFFFF] p-6 sm:p-8 shadow-sm">
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-[7px] border border-[#B8544B]/30 bg-[#B8544B]/10 px-4 py-3 text-xs text-[#B8544B] font-medium"
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="join-email"
                className="block text-xs font-semibold text-[#1E1D1A] uppercase tracking-wider mb-1.5"
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
                className="w-full h-11 px-3.5 rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] text-sm text-[#1E1D1A] placeholder-[#918B80] transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="join-password"
                  className="block text-xs font-semibold text-[#1E1D1A] uppercase tracking-wider"
                >
                  Password
                </label>
                <span className="text-[11px] text-[#918B80]">Min 6 chars</span>
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
                  className="w-full h-11 pl-3.5 pr-11 rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] text-sm text-[#1E1D1A] placeholder-[#918B80] transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6F6A60] hover:text-[#1E1D1A] font-medium transition cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] active:bg-[#C86B3C] text-sm font-medium text-white shadow-xs hover:shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-[#DED8CE]" />
            <span className="absolute bg-[#FFFFFF] px-3 text-xs font-semibold text-[#918B80]">
              OR
            </span>
          </div>

          {/* Social OAuth buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-[7px] bg-[#24211D] hover:bg-[#1E1D1A] text-white text-sm font-medium shadow-xs transition cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.41 7.86 10.94.57.1.78-.25.78-.55v-2.13c-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] hover:bg-[#F0ECE4] text-[#1E1D1A] text-sm font-medium shadow-xs transition cursor-pointer"
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

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-[#DED8CE] text-center">
            <p className="text-xs text-[#6F6A60]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#C86B3C] hover:text-[#A9552F] font-semibold transition underline underline-offset-2"
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
