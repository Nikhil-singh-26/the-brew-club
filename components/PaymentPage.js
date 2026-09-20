"use client";

import React, { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { fetchuser, fetchpayments, initiate } from "@/actions/useractions";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "./Toast";

const PaymentPage = ({ username }) => {
  const [paymentform, setPaymentform] = useState({
    name: "",
    message: "",
    amount: "100",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const user = await fetchuser(username);
      setCurrentUser(user);

      const dbpayments = await fetchpayments(username);
      setPayments(dbpayments || []);
    } catch (error) {
      console.error("Failed to load creator data:", error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const paymentStatus = searchParams.get("paymentdone");
    if (paymentStatus === "true") {
      toast.success("Thank you for supporting this creator! ☕");
      loadData();
      router.replace(`/${username}`);
    } else if (paymentStatus === "failed") {
      toast.error("Payment verification could not be completed.");
      router.replace(`/${username}`);
    }
  }, [searchParams, router, username, toast, loadData]);

  const handleChange = (e) => {
    setPaymentform((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePay = async (e) => {
    if (e) e.preventDefault();

    const numericAmount = parseFloat(paymentform.amount);
    if (isNaN(numericAmount) || numericAmount < 1) {
      toast.error("Please enter a valid amount (minimum ₹1).");
      return;
    }

    if (!paymentform.name.trim() || paymentform.name.trim().length < 2) {
      toast.error("Please enter your name (at least 2 characters).");
      return;
    }

    if (!currentUser?.razorpayid) {
      toast.error(
        "This creator has not configured their Razorpay payment gateway yet."
      );
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error(
        "Payment gateway is loading. Please check your connection and try again."
      );
      return;
    }

    setPaying(true);

    try {
      const amountInPaise = Math.round(numericAmount * 100);
      const order = await initiate(amountInPaise, username, paymentform);

      if (order?.error) {
        toast.error(order.error);
        setPaying(false);
        return;
      }

      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/razorpay`
          : `${process.env.NEXT_PUBLIC_URL || ""}/api/razorpay`;

      const options = {
        key: currentUser.razorpayid,
        amount: order.amount,
        currency: "INR",
        name: "The Brew Club",
        description: `Supporting @${username}`,
        image: currentUser.profilepic || "",
        order_id: order.id,
        callback_url: callbackUrl,
        prefill: {
          name: paymentform.name,
        },
        notes: {
          creator: username,
          message: paymentform.message || "",
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        toast.error("Payment was cancelled or failed.");
        setPaying(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Something went wrong while initiating the payment.");
    } finally {
      setPaying(false);
    }
  };

  const totalRaised = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-sm text-gray-500">Loading creator page...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold">Creator Not Found</h1>
          <p className="mt-2 text-sm text-gray-400">
            The creator @{username} doesn't seem to exist on The Brew Club yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <main className="min-h-screen bg-[#0b0b0f] text-white pb-20">
        {/* Creator Cover Banner */}
        <section className="relative">
          <div className="h-56 w-full overflow-hidden bg-linear-to-b from-[#1c1710] via-[#141217] to-[#0b0b0f] md:h-80">
            {currentUser.coverpic ? (
              <img
                src={currentUser.coverpic}
                alt={`${username}'s banner`}
                className="h-full w-full object-cover opacity-80"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-[#0b0b0f] via-transparent to-black/20" />
          </div>

          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="rounded-full border-4 border-[#0b0b0f] bg-[#15151b] p-1 shadow-2xl">
              {currentUser.profilepic ? (
                <img
                  src={currentUser.profilepic}
                  alt={currentUser.name || username}
                  className="h-28 w-28 rounded-full object-cover md:h-32 md:w-32"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-4xl font-bold text-black md:h-32 md:w-32">
                  {username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Creator Header Info */}
        <section className="px-5 pb-10 pt-24 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Creator Profile
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-white">
              {currentUser.name || username}
            </h1>

            <p className="mt-1 text-sm text-gray-400">@{username}</p>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-300 md:text-base">
              Support the work, projects, and creative journey. Every contribution
              helps fuel independent creators.
            </p>

            {/* Stats Bar */}
            <div className="mt-8 inline-flex items-center gap-8 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4">
              <div>
                <p className="text-2xl font-bold text-white">
                  {payments.length}
                </p>
                <p className="text-xs uppercase tracking-wider text-gray-400 mt-0.5">
                  Supporters
                </p>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <p className="text-2xl font-bold text-amber-400">
                  ₹{totalRaised.toLocaleString("en-IN")}
                </p>
                <p className="text-xs uppercase tracking-wider text-gray-400 mt-0.5">
                  Total Raised
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid: Supporters & Contribution Card */}
        <section className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-2 md:px-8">
          {/* Supporters List */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col">
            <div className="border-b border-white/10 px-6 py-6 md:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
                Community Backing
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Recent Supporters
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                People who believe in @{username}'s vision.
              </p>
            </div>

            <div className="flex-1 max-h-120 overflow-y-auto px-6 py-6 md:px-8">
              {payments.length === 0 ? (
                <div className="flex min-h-60 flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-xl">
                    ☕
                  </div>
                  <p className="mt-4 text-sm font-semibold text-gray-200">
                    Be the first supporter of @{username}
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-gray-400">
                    Your contribution directly helps them build their next great project.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment, index) => (
                    <div
                      key={payment._id || index}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-sm font-semibold text-amber-400">
                            {(payment.name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {payment.name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {payment.createdAt
                                ? new Date(payment.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "Supporter"}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-lg bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-400 shrink-0">
                          ₹{payment.amount}
                        </span>
                      </div>

                      {payment.message && (
                        <p className="mt-3 rounded-xl bg-black/30 px-3 py-2 text-xs text-gray-300 leading-relaxed italic">
                          "{payment.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Support Form Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="border-b border-white/10 px-6 py-6 md:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
                Support The Creator
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Contribute to @{username}
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Select an amount and leave an encouraging note.
              </p>
            </div>

            <form onSubmit={handlePay} className="p-6 md:p-8">
              {!currentUser.razorpayid && (
                <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                  ⚠️ This creator has not linked their Razorpay gateway credentials yet.
                  Payments will be available once configured in their dashboard.
                </div>
              )}

              {/* Supporter Name */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Your Name or Handle
                </label>
                <input
                  id="name"
                  onChange={handleChange}
                  value={paymentform.name}
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>

              {/* Supporter Message */}
              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Note of Encouragement (Optional)
                </label>
                <textarea
                  id="message"
                  onChange={handleChange}
                  value={paymentform.message}
                  name="message"
                  rows={3}
                  placeholder="Keep building amazing things!..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>

              {/* Amount Selection */}
              <div className="mb-4">
                <label
                  htmlFor="amount"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-300"
                >
                  Contribution Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    ₹
                  </span>
                  <input
                    id="amount"
                    onChange={handleChange}
                    value={paymentform.amount}
                    name="amount"
                    type="number"
                    min="1"
                    required
                    placeholder="100"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-8 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mb-6">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  Quick Amount Presets
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setPaymentform((prev) => ({
                          ...prev,
                          amount: String(preset),
                        }))
                      }
                      className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                        paymentform.amount === String(preset)
                          ? "border-amber-400 bg-amber-400/15 text-amber-400"
                          : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={
                  paying ||
                  !currentUser.razorpayid ||
                  !paymentform.name.trim() ||
                  !paymentform.amount ||
                  Number(paymentform.amount) < 1
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-sm font-bold text-black transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {paying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Opening Razorpay Gateway...
                  </>
                ) : (
                  <>
                    Support @{username}{" "}
                    {paymentform.amount &&
                      Number(paymentform.amount) > 0 &&
                      ` · ₹${Number(paymentform.amount).toLocaleString("en-IN")}`}
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
                <span>🔒</span> Direct payments secured by Razorpay
              </p>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

export default PaymentPage;