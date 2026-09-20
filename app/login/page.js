"use client";
import React, { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const Login = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.title = "Join The Brew Club";

    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const providers = [
    {
      name: "Google",
      id: "google",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
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
    {
      name: "GitHub",
      id: "github",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.41 7.86 10.94.57.1.78-.25.78-.55v-2.13c-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      id: "linkedin",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.68H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.28 2.38 4.28 5.48v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V8.99h3.56v11.46zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      id: "twitter",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2zm-1.1 17.92h1.73L8.27 3.98H6.42L17.8 19.92z" />
        </svg>
      ),
    },
    {
      name: "Apple",
      id: "apple",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.71 19.5c-.98 1.42-2 2.83-3.62 2.86-1.59.03-2.12-.93-3.95-.93-1.84 0-2.43.9-3.94.96-1.58.06-2.77-1.54-3.76-2.95-2.04-2.9-3.6-8.18-1.5-11.75a5.78 5.78 0 0 1 4.9-2.95c1.53-.03 2.97 1.03 3.95 1.03.94 0 2.69-1.27 4.53-1.08.77.03 2.94.31 4.33 2.47-3.56 2.18-2.99 6.97.57 9.15-.65 1.56-1.5 3.1-2.51 4.49zM15.06 3.43c.83-1.01 1.39-2.43 1.24-3.84-1.2.05-2.65.8-3.51 1.8-.76.88-1.42 2.32-1.24 3.69 1.34.1 2.68-.68 3.51-1.65z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#0b0b0f] text-white relative overflow-hidden">

      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-orange-500/6 blur-[120px]" />

      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-5 py-14">

        <div className="w-full max-w-md">

          <div className="text-center mb-8">

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/10 mb-5 text-3xl">
              ☕
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Welcome to The Brew Club
            </h1>

            <p className="mt-3 text-gray-400 leading-relaxed max-w-sm mx-auto">
              A place for creators and the people who believe in what they do.
            </p>

          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.035] p-6 sm:p-8 shadow-2xl">

            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Join the club
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose how you'd like to continue.
              </p>
            </div>

            <div className="space-y-3">

              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => signIn(provider.id)}
                  className="group w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-white/9 bg-white/4 text-sm font-medium text-gray-200 transition-all duration-200 hover:bg-white/8 hover:border-white/16 hover:-translate-y-px active:translate-y-0"
                >
                  <span className="flex items-center justify-center w-5 h-5 text-gray-200">
                    {provider.icon}
                  </span>

                  <span>
                    Continue with {provider.name}
                  </span>
                </button>
              ))}

            </div>


            
            <div className="flex items-center gap-4 my-7">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-xs text-gray-600">
                YOUR SPACE AWAITS
              </span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <p className="text-center text-xs text-gray-500 leading-relaxed">
              By continuing, you’re joining a community built around
              creativity, support, and good work.
            </p>

          </div>

          <div className="text-center mt-7">
            <p className="text-sm text-gray-500">
              Make something you care about.
            </p>
            <p className="text-sm text-orange-400/80 mt-1">
              We’ll save you a seat. ☕
            </p>
          </div>

        </div>

      </div>
    </main>
  );
};

export default Login;
