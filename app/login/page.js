"use client";

import React, { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const Login = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const providers = [
    {
      name: "GitHub",
      id: "github",
      color: "bg-[#24292e] hover:bg-[#2f363d] text-white border-white/10",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.41 7.86 10.94.57.1.78-.25.78-.55v-2.13c-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
        </svg>
      ),
    },
    {
      name: "Google",
      id: "google",
      color: "bg-white/5 hover:bg-white/10 text-white border-white/10",
      icon: (
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
      ),
    },
  ];

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#0b0b0f] text-white relative overflow-hidden flex items-center justify-center px-6 py-12">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-black text-2xl font-bold shadow-lg shadow-orange-500/20 mb-4">
            ☕
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to The Brew Club
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-gray-400">
            Sign in to manage your creator profile, track supporter contributions,
            or customize your payment gateway.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/3 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 text-center">
            Continue with your account
          </h2>

          <div className="space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
                className={`w-full h-12 flex items-center justify-center gap-3 rounded-xl border text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${provider.color}`}
              >
                <span>{provider.icon}</span>
                <span>Continue with {provider.name}</span>
              </button>
            ))}
          </div>

          <div className="my-6 border-t border-white/10" />

          <p className="text-center text-[11px] text-gray-500 leading-relaxed">
            By continuing, you agree to The Brew Club terms of community and support.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
