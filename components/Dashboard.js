"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { fetchuser, updateProfile } from "@/actions/useractions"

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Dashboard = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const getData = async () => {
      try {
        const user = await fetchuser(session.user?.name)
        setForm(user)
      } catch (error) {
        console.error("Failed to load profile:", error)
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [session, router])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!session?.user?.name) return

    setSaving(true)

    try {
      await updateProfile(e, session.user.name)

      toast.success("Profile updated successfully", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      })
    } catch (error) {
      console.error("Profile update failed:", error)

      toast.error("Something went wrong while saving", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-sm text-gray-500">
              Loading your profile...
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <ToastContainer />

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">

        {/* Page Header */}
        <div className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-amber-400">
            Your space
          </p>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back,{" "}
            <span className="text-gray-400">
              {form.name || session?.user?.name || "there"}.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
            Keep your profile up to date so people who discover your work
            know who they are supporting.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Profile Card */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">

            {/* Card Header */}
            <div className="border-b border-white/10 px-6 py-6 md:px-8">
              <div className="flex items-center gap-4">

                {/* Profile Image */}
                {form.profilepic ? (
                  <img
                    src={form.profilepic}
                    alt={form.name || "Profile"}
                    className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-2xl font-bold text-black">
                    {(form.name || session?.user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Profile details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    This information represents you on The Brew Club.
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
                  Name
                </label>

                <input
                  value={form.name || ""}
                  onChange={handleChange}
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Email
                </label>

                <input
                  value={form.email || ""}
                  onChange={handleChange}
                  type="email"
                  name="email"
                  id="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
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

                <input
                  value={form.username || ""}
                  onChange={handleChange}
                  type="text"
                  name="username"
                  id="username"
                  placeholder="yourusername"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                />

                <p className="mt-2 text-xs text-gray-600">
                  This can be used to identify your creator page.
                </p>
              </div>

              {/* Profile Picture */}
              <div>
                <label
                  htmlFor="profilepic"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Profile picture
                </label>

                <input
                  value={form.profilepic || ""}
                  onChange={handleChange}
                  type="text"
                  name="profilepic"
                  id="profilepic"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                />

                <p className="mt-2 text-xs text-gray-600">
                  Add a URL for your profile image.
                </p>
              </div>

              {/* Cover Picture */}
              <div className="md:col-span-2">
                <label
                  htmlFor="coverpic"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Cover image
                </label>

                <input
                  value={form.coverpic || ""}
                  onChange={handleChange}
                  type="text"
                  name="coverpic"
                  id="coverpic"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                />

                <p className="mt-2 text-xs text-gray-600">
                  A wide image that will appear at the top of your creator
                  page.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">

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
                    <rect
                      width="20"
                      height="14"
                      x="2"
                      y="5"
                      rx="2"
                    />
                    <path d="M2 10h20" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Payment settings
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Connect your Razorpay account so supporters can contribute
                    to your work.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Fields */}
            <div className="grid gap-6 p-6 md:p-8">

              {/* Razorpay ID */}
              <div>
                <label
                  htmlFor="razorpayid"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Razorpay ID
                </label>

                <input
                  value={form.razorpayid || ""}
                  onChange={handleChange}
                  type="text"
                  name="razorpayid"
                  id="razorpayid"
                  placeholder="Your Razorpay ID"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>

              {/* Razorpay Secret */}
              <div>
                <label
                  htmlFor="razorpaysecret"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Razorpay Secret
                </label>

                <input
                  value={form.razorpaysecret || ""}
                  onChange={handleChange}
                  type="password"
                  name="razorpaysecret"
                  id="razorpaysecret"
                  placeholder="Your Razorpay secret"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/30 focus:ring-2 focus:ring-amber-400/10"
                />

                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      width="18"
                      height="11"
                      x="3"
                      y="11"
                      rx="2"
                    />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>

                  Keep your payment credentials private.
                </p>
              </div>
            </div>
          </section>

          {/* Save Area */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/2.5 p-5 sm:flex-row">

            <div>
              <p className="text-sm font-medium text-gray-300">
                Ready to save your changes?
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Your updated profile will be reflected on your creator page.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex min-w-36 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200 hover:shadow-lg hover:shadow-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Dashboard
