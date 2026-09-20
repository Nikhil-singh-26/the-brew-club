"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./Toast";

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
