"use client"

import React, { useEffect, useState } from "react"
import Script from "next/script"
import { fetchuser, fetchpayments, initiate } from "@/actions/useractions"
import { useSearchParams, useRouter } from "next/navigation"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const PaymentPage = ({ username }) => {
  const [paymentform, setPaymentform] = useState({
    name: "",
    message: "",
    amount: "",
  })

  const [currentUser, setCurrentUser] = useState({})
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (searchParams.get("paymentdone") === "true") {
      toast.success("Thanks for supporting the creator!", {
        position: "top-right",
        autoClose: 4000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      })

      // Remove paymentdone from the URL
      router.replace(`/${username}`)
    }
  }, [searchParams, router, username])

  const handleChange = (e) => {
    setPaymentform({
      ...paymentform,
      [e.target.name]: e.target.value,
    })
  }

  const getData = async () => {
    try {
      const user = await fetchuser(username)
      setCurrentUser(user)

      const dbpayments = await fetchpayments(username)
      setPayments(dbpayments)
    } catch (error) {
      console.error("Failed to load payment page:", error)
    } finally {
      setLoading(false)
    }
  }

  const pay = async (amount) => {
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount.", {
        theme: "dark",
      })
      return
    }

    if (paymentform.name.trim().length < 3) {
      toast.error("Please enter your name.", {
        theme: "dark",
      })
      return
    }

    if (paymentform.message.trim().length < 4) {
      toast.error("Please add a short message.", {
        theme: "dark",
      })
      return
    }

    setPaying(true)

    try {
      // Create Razorpay order
      const order = await initiate(amount, username, paymentform)

      const options = {
        key: currentUser.razorpayid,
        amount: amount,
        currency: "INR",

        name: "The Brew Club",
        description: `Supporting @${username}`,

        image: currentUser.profilepic || "",

        order_id: order.id,

        callback_url: `${process.env.NEXT_PUBLIC_URL}/api/razorpay`,

        prefill: {
          name: paymentform.name,
        },

        notes: {
          creator: username,
          message: paymentform.message,
        },

        theme: {
          color: "#f59e0b",
        },
      }

      const rzp = new Razorpay(options)

      rzp.open()

      rzp.on("payment.failed", function () {
        toast.error("Payment could not be completed.", {
          theme: "dark",
        })
      })
    } catch (error) {
      console.error("Payment failed:", error)

      toast.error("Something went wrong. Please try again.", {
        theme: "dark",
      })
    } finally {
      setPaying(false)
    }
  }

  const totalRaised = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />

            <p className="text-sm text-gray-500">
              Loading creator page...
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <ToastContainer />

      {/* Razorpay */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-[#0b0b0f] text-white">

        {/* Creator Cover */}
        <section className="relative">

          <div className="h-56 w-full overflow-hidden bg-linear-to-br from-[#1c1710] via-[#17141a] to-[#0b0b0f] md:h-80">

            {currentUser.coverpic ? (
              <img
                src={currentUser.coverpic}
                alt={`${username}'s cover`}
                className="h-full w-full object-cover opacity-80"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.16),transparent_40%)]" />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-[#0b0b0f] via-transparent to-black/10" />
          </div>

          {/* Profile Image */}
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

        {/* Creator Info */}
        <section className="px-5 pb-10 pt-24 text-center">

          <div className="mx-auto max-w-2xl">

            <p className="text-sm font-medium text-amber-400">
              Creator
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {currentUser.name || username}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              @{username}
            </p>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-gray-400 md:text-base">
              Support the work, ideas, and projects that matter to you.
              Every contribution helps keep the creative process moving.
            </p>

            {/* Stats */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm">

              <div>
                <p className="text-xl font-semibold text-white">
                  {payments.length}
                </p>

                <p className="mt-1 text-gray-500">
                  Supporters
                </p>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <p className="text-xl font-semibold text-white">
                  ₹{totalRaised.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-gray-500">
                  Raised
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 md:grid-cols-2 md:px-8">

          {/* Supporters */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035]">

            <div className="border-b border-white/10 px-6 py-6 md:px-8">

              <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-400">
                Community
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                People backing {username}
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                A little support can go a long way.
              </p>

            </div>

            <div className="max-h-130 overflow-y-auto px-6 py-5 md:px-8">

              {payments.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-xl">
                    ☕
                  </div>

                  <p className="mt-4 text-sm font-medium text-gray-300">
                    Be the first to support {username}
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-gray-600">
                    Your contribution could be the first step in someone's
                    next project.
                  </p>

                </div>
              ) : (
                <div className="space-y-5">

                  {payments.map((payment, index) => (
                    <div
                      key={index}
                      className="flex gap-3"
                    >

                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-sm font-medium text-gray-300">
                        {(payment.name || "A")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-1.5 text-sm">
                          <span className="font-medium text-white">
                            {payment.name}
                          </span>

                          <span className="text-gray-600">
                            supported with
                          </span>

                          <span className="font-semibold text-amber-400">
                            ₹{payment.amount}
                          </span>
                        </div>

                        {payment.message && (
                          <div className="mt-2 rounded-xl bg-white/[0.035] px-3 py-2.5 text-xs leading-5 text-gray-500">
                            “{payment.message}”
                          </div>
                        )}

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>
          </div>

          {/* Payment Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.035]">

            <div className="border-b border-white/10 px-6 py-6 md:px-8">

              <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-400">
                Support {username}
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Want to back their work?
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Choose an amount or enter your own. Add a message if you'd
                like.
              </p>

            </div>

            <div className="p-6 md:p-8">

              {/* Name */}
              <div className="mb-4">

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Your name
                </label>

                <input
                  id="name"
                  onChange={handleChange}
                  value={paymentform.name}
                  name="name"
                  type="text"
                  placeholder="How should they know you?"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                />

              </div>

              {/* Message */}
              <div className="mb-4">

                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  A message
                </label>

                <textarea
                  id="message"
                  onChange={handleChange}
                  value={paymentform.message}
                  name="message"
                  rows={3}
                  placeholder="Leave a little encouragement..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                />

              </div>

              {/* Amount */}
              <div className="mb-5">

                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Amount
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>

                  <input
                    id="amount"
                    onChange={handleChange}
                    value={paymentform.amount}
                    name="amount"
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                  />

                </div>

              </div>

              {/* Quick Amounts */}
              <div className="mb-6">

                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-600">
                  Quick support
                </p>

                <div className="grid grid-cols-3 gap-2">

                  {[1000, 2000, 3000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setPaymentform({
                          ...paymentform,
                          amount: String(amount / 100),
                        })
                      }}
                      className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-sm font-medium text-gray-300 transition hover:border-amber-400/30 hover:bg-amber-400/5 hover:text-amber-400"
                    >
                      ₹{amount / 100}
                    </button>
                  ))}

                </div>

              </div>

              {/* Pay */}
              <button
                onClick={() =>
                  pay(Number.parseInt(paymentform.amount) * 100)
                }
                type="button"
                disabled={
                  paying ||
                  paymentform.name.trim().length < 3 ||
                  paymentform.message.trim().length < 4 ||
                  !paymentform.amount ||
                  Number(paymentform.amount) <= 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/10 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500 disabled:shadow-none"
              >
                {paying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Opening payment...
                  </>
                ) : (
                  <>
                    Support {username}
                    {paymentform.amount &&
                      Number(paymentform.amount) > 0 &&
                      ` · ₹${Number(paymentform.amount).toLocaleString("en-IN")}`}
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[11px] leading-5 text-gray-600">
                Payments are securely processed through Razorpay.
              </p>

            </div>
          </div>

        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-4xl px-5 pb-20 text-center">

          <div className="rounded-3xl border border-white/10 bg-linear-to-b from-white/4.5 to-transparent px-6 py-10 md:px-10">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-lg">
              ☕
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              Small support. Real impact.
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
              The Brew Club is about helping creators keep making the things
              they care about — one supporter at a time.
            </p>

          </div>

        </section>

      </main>
    </>
  )
}

export default PaymentPage