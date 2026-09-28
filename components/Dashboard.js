"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    bio: "",
    about: "",
    currentWork: "",
    whySupport: "",
    skills: "",
    achievements: [""],
    projects: [
      {
        name: "",
        description: "",
        image: "",
        github: "",
        live: "",
        url: "",
      },
    ],
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
      twitter: "",
      other: "",
    },
    profilepic: "",
    coverpic: "",
    razorpayid: "",
    razorpaysecret: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'story' | 'portfolio' | 'payments'

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
              bio: user.bio || "",
              about: user.about || "",
              currentWork: user.currentWork || "",
              whySupport: user.whySupport || "",
              skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
              achievements:
                Array.isArray(user.achievements) && user.achievements.length > 0
                  ? user.achievements
                  : [""],
              projects:
                Array.isArray(user.projects) && user.projects.length > 0
                  ? user.projects
                  : [
                      {
                        name: "",
                        description: "",
                        image: "",
                        github: "",
                        live: "",
                        url: "",
                      },
                    ],
              socialLinks: {
                github: user.socialLinks?.github || "",
                linkedin: user.socialLinks?.linkedin || "",
                portfolio: user.socialLinks?.portfolio || "",
                twitter: user.socialLinks?.twitter || "",
                other: user.socialLinks?.other || "",
              },
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
    const { name, value } = e.target;
    if (name === "profilepic") {
      setImgError(false);
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  // Achievement helpers
  const handleAchievementChange = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.achievements];
      updated[index] = value;
      return { ...prev, achievements: updated };
    });
  };

  const addAchievement = () => {
    setForm((prev) => ({
      ...prev,
      achievements: [...prev.achievements, ""],
    }));
  };

  const removeAchievement = (index) => {
    setForm((prev) => {
      const updated = prev.achievements.filter((_, i) => i !== index);
      return {
        ...prev,
        achievements: updated.length > 0 ? updated : [""],
      };
    });
  };

  // Project helpers
  const handleProjectChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.projects];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, projects: updated };
    });
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: "",
          description: "",
          image: "",
          github: "",
          live: "",
          url: "",
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setForm((prev) => {
      const updated = prev.projects.filter((_, i) => i !== index);
      return {
        ...prev,
        projects:
          updated.length > 0
            ? updated
            : [
                {
                  name: "",
                  description: "",
                  image: "",
                  github: "",
                  live: "",
                  url: "",
                },
              ],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.name) {
      toast.error("You must be logged in to save changes.");
      return;
    }

    setSaving(true);

    try {
      // Clean achievements and projects before sending
      const cleanAchievements = form.achievements
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const cleanProjects = form.projects
        .filter((p) => p.name && p.name.trim())
        .map((p) => ({
          name: p.name.trim(),
          description: p.description ? p.description.trim() : "",
          image: p.image ? p.image.trim() : "",
          github: p.github ? p.github.trim() : "",
          live: p.live ? p.live.trim() : "",
          url: p.url ? p.url.trim() : "",
        }));

      const cleanSkills = typeof form.skills === "string"
        ? form.skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      const payload = {
        ...form,
        skills: cleanSkills,
        achievements: cleanAchievements,
        projects: cleanProjects,
      };

      const res = await updateProfile(payload, session.user.name);

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success(res.message || "Profile updated successfully! ☕");

        if (res.user) {
          setForm((prev) => ({
            ...prev,
            name: res.user.name,
            username: res.user.username,
            bio: res.user.bio || "",
            about: res.user.about || "",
            currentWork: res.user.currentWork || "",
            whySupport: res.user.whySupport || "",
            skills: Array.isArray(res.user.skills) ? res.user.skills.join(", ") : "",
            achievements:
              Array.isArray(res.user.achievements) && res.user.achievements.length > 0
                ? res.user.achievements
                : [""],
            projects:
              Array.isArray(res.user.projects) && res.user.projects.length > 0
                ? res.user.projects
                : [
                    {
                      name: "",
                      description: "",
                      image: "",
                      github: "",
                      live: "",
                      url: "",
                    },
                  ],
            socialLinks: res.user.socialLinks || prev.socialLinks,
            profilepic: res.user.profilepic || "",
            coverpic: res.user.coverpic || "",
            razorpayid: res.user.razorpayid || "",
          }));
        }

        if (typeof update === "function") {
          await update();
        }

        router.refresh();
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Something went wrong while saving your changes.");
    } finally {
      setSaving(false);
    }
  };

  // Parsed skills chips preview
  const skillsList = form.skills
    ? form.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-sm text-gray-500">Loading your creator dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full border border-amber-400/20 bg-amber-400/10 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <span>☕</span> Creator Studio
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome,{" "}
              <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {form.name || form.username || "Creator"}
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-gray-400">
              Customize your creator portfolio, tell supporters why your work matters,
              showcase your projects, and manage your payment gateway.
            </p>
          </div>

          {form.username && (
            <Link
              href={`/${form.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 hover:text-white transition shadow-sm"
            >
              <span>✨</span>
              <span>View Public Page ↗</span>
            </Link>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "profile", label: "Basic Info", icon: "👤" },
            { id: "story", label: "Story & Bio", icon: "📖" },
            { id: "portfolio", label: "Projects & Highlights", icon: "🚀" },
            { id: "payments", label: "Payment Gateway", icon: "💳" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-linear-to-r from-amber-400/20 to-orange-500/20 text-amber-300 border border-amber-400/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* TAB 1: BASIC PROFILE INFO */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Identity Card */}
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
                <div className="border-b border-white/10 px-6 py-5 md:px-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Live Avatar Preview */}
                    {form.profilepic && !imgError ? (
                      <img
                        src={form.profilepic}
                        alt={form.name || "Profile"}
                        onError={() => setImgError(true)}
                        className="h-16 w-16 rounded-2xl border border-white/15 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-2xl font-extrabold text-black">
                        {(form.name || form.username || "C").charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        Creator Identity
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Your public name, handle, and avatar representation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
                    >
                      Display Name
                    </label>
                    <input
                      value={form.name}
                      onChange={handleChange}
                      type="text"
                      name="name"
                      id="name"
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
                    >
                      Account Email <span className="text-[10px] text-amber-400/80">(Private)</span>
                    </label>
                    <input
                      value={form.email}
                      disabled
                      type="email"
                      name="email"
                      id="email"
                      className="w-full rounded-xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-gray-500 cursor-not-allowed outline-none"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
                    >
                      Creator Handle / Username
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
                        required
                        placeholder="yourhandle"
                        className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-8 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-gray-500">
                      Public URL: <span className="text-amber-400">/{form.username || "username"}</span>
                    </p>
                  </div>

                  {/* Profile Picture URL */}
                  <div>
                    <label
                      htmlFor="profilepic"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
                    >
                      Profile Picture URL
                    </label>
                    <input
                      value={form.profilepic}
                      onChange={handleChange}
                      type="url"
                      name="profilepic"
                      id="profilepic"
                      placeholder="https://images.unsplash.com/... or https://..."
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                    <p className="mt-1.5 text-[11px] text-gray-500">
                      Paste an image URL. Profile images are manually controlled by you.
                    </p>
                  </div>

                  {/* Cover Banner URL */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="coverpic"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
                    >
                      Cover Banner URL
                    </label>
                    <input
                      value={form.coverpic}
                      onChange={handleChange}
                      type="url"
                      name="coverpic"
                      id="coverpic"
                      placeholder="https://images.unsplash.com/... or https://..."
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                    <p className="mt-1.5 text-[11px] text-gray-500">
                      Optional top banner shown across your creator profile page.
                    </p>
                  </div>
                </div>
              </section>

              {/* Social / Professional Links Card */}
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
                <div className="border-b border-white/10 px-6 py-5 md:px-8">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>🌐</span> Social & Professional Links
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Connect your GitHub, LinkedIn, and personal websites so supporters can explore your work.
                  </p>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
                  <div>
                    <label
                      htmlFor="social-github"
                      className="mb-1.5 block text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <span>🐙</span> GitHub Profile
                    </label>
                    <input
                      value={form.socialLinks.github}
                      onChange={handleSocialChange}
                      type="url"
                      name="github"
                      id="social-github"
                      placeholder="https://github.com/username"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="social-linkedin"
                      className="mb-1.5 block text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <span>💼</span> LinkedIn Profile
                    </label>
                    <input
                      value={form.socialLinks.linkedin}
                      onChange={handleSocialChange}
                      type="url"
                      name="linkedin"
                      id="social-linkedin"
                      placeholder="https://linkedin.com/in/username"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="social-portfolio"
                      className="mb-1.5 block text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <span>✨</span> Portfolio / Website
                    </label>
                    <input
                      value={form.socialLinks.portfolio}
                      onChange={handleSocialChange}
                      type="url"
                      name="portfolio"
                      id="social-portfolio"
                      placeholder="https://yourportfolio.dev"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="social-twitter"
                      className="mb-1.5 block text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <span>🐦</span> X (Twitter) Profile
                    </label>
                    <input
                      value={form.socialLinks.twitter}
                      onChange={handleSocialChange}
                      type="url"
                      name="twitter"
                      id="social-twitter"
                      placeholder="https://x.com/username"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: STORY, BIO & SKILLS */}
          {activeTab === "story" && (
            <div className="space-y-8">
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
                <div className="border-b border-white/10 px-6 py-5 md:px-8">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>📖</span> Creator Story & Mission
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Help supporters understand who you are, what you create, and how their support fuels your journey.
                  </p>
                </div>

                <div className="space-y-6 p-6 md:p-8">
                  {/* Short Bio */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="bio"
                        className="block text-xs font-semibold uppercase tracking-wider text-gray-300"
                      >
                        Short Bio / Tagline
                      </label>
                      <span className="text-[11px] text-gray-500">1 sentence</span>
                    </div>
                    <input
                      value={form.bio}
                      onChange={handleChange}
                      type="text"
                      name="bio"
                      id="bio"
                      placeholder="e.g. Full Stack Developer building open source developer tools."
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                    <p className="mt-1.5 text-[11px] text-gray-500">
                      Displayed on your creator card and profile header.
                    </p>
                  </div>

                  {/* About Me / Long Intro */}
                  <div>
                    <label
                      htmlFor="about"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
                    >
                      About Me / Introduction
                    </label>
                    <textarea
                      value={form.about}
                      onChange={handleChange}
                      name="about"
                      id="about"
                      rows={4}
                      placeholder="Share your background, what drives you, what technologies you use, and the kind of work you create..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>

                  {/* Current Work / What I'm building */}
                  <div>
                    <label
                      htmlFor="currentWork"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5"
                    >
                      <span>🔨</span> What I&apos;m Currently Building
                    </label>
                    <textarea
                      value={form.currentWork}
                      onChange={handleChange}
                      name="currentWork"
                      id="currentWork"
                      rows={3}
                      placeholder="e.g. Working on a real-time collaborative workspace for indie makers..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>

                  {/* Why Support Me */}
                  <div>
                    <label
                      htmlFor="whySupport"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5"
                    >
                      <span>☕</span> Why Support Me
                    </label>
                    <textarea
                      value={form.whySupport}
                      onChange={handleChange}
                      name="whySupport"
                      id="whySupport"
                      rows={3}
                      placeholder="Explain what community backing allows you to do (e.g. cover hosting costs, dedicate more time to open source, build free educational guides)..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>

                  {/* Skills & Interests */}
                  <div>
                    <label
                      htmlFor="skills"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
                    >
                      Skills & Interests <span className="text-[11px] text-gray-500 font-normal">(comma-separated)</span>
                    </label>
                    <input
                      value={form.skills}
                      onChange={handleChange}
                      type="text"
                      name="skills"
                      id="skills"
                      placeholder="e.g. Next.js, React, Node.js, TypeScript, UI/UX, Cloud, AI"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />

                    {/* Live tags preview */}
                    {skillsList.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-gray-500 mr-1">Preview:</span>
                        {skillsList.map((skill, i) => (
                          <span
                            key={i}
                            className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: PROJECTS & ACHIEVEMENTS */}
          {activeTab === "portfolio" && (
            <div className="space-y-8">
              {/* Projects Section */}
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
                <div className="border-b border-white/10 px-6 py-5 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>🚀</span> Featured Projects & Creations
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Showcase projects you have built or are actively developing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addProject}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition border border-white/10 cursor-pointer self-start sm:self-auto"
                  >
                    <span>+</span> Add Project
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {form.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-black/30 p-5 relative group transition hover:border-white/20"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Project #{idx + 1}
                        </span>

                        {form.projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProject(idx)}
                            className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>🗑️</span> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Project Name */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-300">
                            Project Name *
                          </label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) =>
                              handleProjectChange(idx, "name", e.target.value)
                            }
                            placeholder="e.g. BrewPulse Analytics"
                            className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                          />
                        </div>

                        {/* Project Image */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-300">
                            Image URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={proj.image}
                            onChange={(e) =>
                              handleProjectChange(idx, "image", e.target.value)
                            }
                            placeholder="https://images.unsplash.com/..."
                            className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                          />
                        </div>

                        {/* Project Description */}
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-medium text-gray-300">
                            Short Description
                          </label>
                          <textarea
                            rows={2}
                            value={proj.description}
                            onChange={(e) =>
                              handleProjectChange(idx, "description", e.target.value)
                            }
                            placeholder="What does this project do and what problem does it solve?"
                            className="w-full resize-y rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                          />
                        </div>

                        {/* Live Demo URL */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-300">
                            Live Demo URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={proj.live}
                            onChange={(e) =>
                              handleProjectChange(idx, "live", e.target.value)
                            }
                            placeholder="https://myproject.app"
                            className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                          />
                        </div>

                        {/* GitHub URL */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-300">
                            GitHub Repo URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={proj.github}
                            onChange={(e) =>
                              handleProjectChange(idx, "github", e.target.value)
                            }
                            placeholder="https://github.com/user/project"
                            className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Achievements Section */}
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
                <div className="border-b border-white/10 px-6 py-5 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>🏆</span> Achievements & Milestones
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Hackathons, awards, open-source milestones, certifications, or accomplishments.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addAchievement}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition border border-white/10 cursor-pointer self-start sm:self-auto"
                  >
                    <span>+</span> Add Milestone
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-3">
                  {form.achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-amber-400 text-sm">⭐</span>
                      <input
                        type="text"
                        value={ach}
                        onChange={(e) => handleAchievementChange(idx, e.target.value)}
                        placeholder="e.g. Winner of DevHacks 2025 · Built CLI tool with 2,000+ stars"
                        className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                      />
                      {form.achievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAchievement(idx)}
                          className="p-2 text-gray-400 hover:text-rose-400 transition cursor-pointer"
                          title="Remove milestone"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: PAYMENT GATEWAY */}
          {activeTab === "payments" && (
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
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
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      Razorpay Payment Gateway
                    </h2>
                    <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                      Connect your Razorpay Key ID and Key Secret to receive direct supporter
                      contributions into your bank account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
                {/* Razorpay Key ID */}
                <div>
                  <label
                    htmlFor="razorpayid"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
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
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    Public Razorpay API key identifier.
                  </p>
                </div>

                {/* Razorpay Key Secret */}
                <div>
                  <label
                    htmlFor="razorpaysecret"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300"
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
                  <p className="mt-1.5 text-[11px] text-amber-400/80">
                    🔒 Strictly protected. Never exposed on public creator pages or APIs.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Persistent Save Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/2 p-6">
            <div>
              <p className="text-sm font-semibold text-white">
                Ready to update your creator profile?
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Saved changes take effect immediately on your public creator page.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex min-w-44 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-orange-500/20 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
          </div>
        </form>
      </div>
    </main>
  );
};

export default Dashboard;
