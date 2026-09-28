"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchuser,
  updateProfile,
  fetchCreatorAnalytics,
  syncCreatorPayments,
  fetchSupporterActivity,
  fetchSavedCreators,
  unsaveCreator,
  fetchNotifications,
  markNotificationAsRead,
  fetchAdminData,
  moderateReport,
} from "@/actions/useractions";
import { useToast } from "./Toast";

const Dashboard = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [syncingPayments, setSyncingPayments] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    about: "",
    currentWork: "",
    whySupport: "",
    supportPurpose: "",
    thankYouMessage: "",
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
        technologies: "",
        status: "In Progress",
        featured: false,
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
    paymentMethod: "razorpay_gateway",
    razorpayLink: "",
    razorpayid: "",
    razorpaysecret: "",
    gatewayConfigured: false,
    isTestGateway: false,
    isLiveGateway: false,
    role: "user",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'story' | 'portfolio' | 'analytics' | 'supporters' | 'notifications' | 'payments' | 'admin'

  // Additional Data State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [savedCreators, setSavedCreators] = useState([]);
  const [supporterActivity, setSupporterActivity] = useState([]);
  const [supportersLoading, setSupportersLoading] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);

  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Initial Profile Load
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
              supportPurpose: user.supportPurpose || "",
              thankYouMessage: user.thankYouMessage || "",
              skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
              achievements:
                Array.isArray(user.achievements) && user.achievements.length > 0
                  ? user.achievements
                  : [""],
              projects:
                Array.isArray(user.projects) && user.projects.length > 0
                  ? user.projects.map((p) => ({
                      name: p.name || "",
                      description: p.description || "",
                      image: p.image || "",
                      github: p.github || "",
                      live: p.live || "",
                      url: p.url || "",
                      technologies: Array.isArray(p.technologies)
                        ? p.technologies.join(", ")
                        : p.technologies || "",
                      status: p.status || "In Progress",
                      featured: Boolean(p.featured),
                    }))
                  : [
                      {
                        name: "",
                        description: "",
                        image: "",
                        github: "",
                        live: "",
                        url: "",
                        technologies: "",
                        status: "In Progress",
                        featured: false,
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
              paymentMethod:
                user.paymentMethod ||
                (user.razorpayLink && !user.razorpayid
                  ? "razorpay_link"
                  : "razorpay_gateway"),
              razorpayLink: user.razorpayLink || "",
              razorpayid: user.razorpayid || "",
              razorpaysecret: "",
              gatewayConfigured: Boolean(user.gatewayConfigured),
              isTestGateway: Boolean(user.isTestGateway),
              isLiveGateway: Boolean(user.isLiveGateway),
              role: user.role || session.user.role || "user",
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

  // Tab Data Fetching on Demand
  useEffect(() => {
    if (!session?.user) return;
    let isMounted = true;

    const loadTabData = async () => {
      if (activeTab === "analytics" && !analytics) {
        setAnalyticsLoading(true);
        try {
          const res = await fetchCreatorAnalytics(form.username || session.user.name);
          if (isMounted && res?.success) setAnalytics(res.analytics);
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setAnalyticsLoading(false);
        }
      }

      if (activeTab === "supporters") {
        setSupportersLoading(true);
        try {
          const [savedRes, actRes] = await Promise.all([fetchSavedCreators(), fetchSupporterActivity()]);
          if (isMounted) {
            if (savedRes?.success) setSavedCreators(savedRes.creators || []);
            if (actRes?.success) setSupporterActivity(actRes.activity || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setSupportersLoading(false);
        }
      }

      if (activeTab === "notifications") {
        setNotifsLoading(true);
        try {
          const res = await fetchNotifications();
          if (isMounted && res?.success) {
            setNotifications(res.notifications || []);
            setUnreadNotifsCount(res.unreadCount || 0);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setNotifsLoading(false);
        }
      }

      if (activeTab === "admin" && (form.role === "admin" || session.user.role === "admin")) {
        setAdminLoading(true);
        try {
          const res = await fetchAdminData();
          if (isMounted && res?.success) setAdminData(res);
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setAdminLoading(false);
        }
      }
    };

    loadTabData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, session, form.username, form.role, analytics]);

  const handleSyncPayments = async () => {
    if (!session?.user?.name) return;
    setSyncingPayments(true);
    try {
      const res = await syncCreatorPayments(form.username || session.user.name);
      if (res?.success) {
        toast.success(res.message || "Payments synchronized from Razorpay.");
        const analyticsRes = await fetchCreatorAnalytics(form.username || session.user.name);
        if (analyticsRes?.success) setAnalytics(analyticsRes.analytics);
      } else {
        toast.error(res?.error || "Failed to sync payments.");
      }
    } catch (err) {
      toast.error("Error syncing payments from Razorpay.");
    } finally {
      setSyncingPayments(false);
    }
  };

  // Profile Completeness Calculation
  const completeness = useMemo(() => {
    const isPaymentDone = Boolean(
      (form.paymentMethod === "razorpay_link" && form.razorpayLink && form.razorpayLink.trim()) ||
      (form.paymentMethod === "razorpay_gateway" && (form.razorpayid || form.gatewayConfigured)) ||
      (form.razorpayLink && form.razorpayLink.trim()) ||
      form.razorpayid ||
      form.gatewayConfigured
    );

    const checks = [
      { id: "profilepic", label: "Profile picture", done: Boolean(form.profilepic && form.profilepic.trim()) },
      { id: "bio", label: "Short bio", done: Boolean(form.bio && form.bio.trim()) },
      { id: "about", label: "About story", done: Boolean(form.about && form.about.trim().length > 20) },
      { id: "currentWork", label: "Current work", done: Boolean(form.currentWork && form.currentWork.trim()) },
      { id: "whySupport", label: "Why support me", done: Boolean(form.whySupport && form.whySupport.trim()) },
      { id: "projects", label: "Project showcase", done: form.projects.some((p) => p.name && p.name.trim()) },
      { id: "skills", label: "Skills", done: Boolean(form.skills && form.skills.trim()) },
      { id: "socialLinks", label: "Social links", done: Boolean(form.socialLinks.github || form.socialLinks.linkedin || form.socialLinks.portfolio || form.socialLinks.twitter) },
      { id: "payment", label: "Payment configuration", done: isPaymentDone },
    ];

    const completed = checks.filter((c) => c.done).length;
    const percentage = Math.round((completed / checks.length) * 100);

    return { percentage, completed, total: checks.length };
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "profilepic") setImgError(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
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
      if (field === "featured" && value === true) {
        updated.forEach((p, i) => {
          p.featured = i === index;
        });
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
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
          technologies: "",
          status: "In Progress",
          featured: false,
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
                  technologies: "",
                  status: "In Progress",
                  featured: false,
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
          technologies: typeof p.technologies === "string"
            ? p.technologies.split(",").map((t) => t.trim()).filter(Boolean)
            : p.technologies || [],
          status: p.status || "In Progress",
          featured: Boolean(p.featured),
        }));

      const cleanSkills =
        typeof form.skills === "string"
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
        toast.success(res.message || "Profile settings saved.");

        if (res.user) {
          setForm((prev) => ({
            ...prev,
            name: res.user.name,
            username: res.user.username,
            bio: res.user.bio || "",
            about: res.user.about || "",
            currentWork: res.user.currentWork || "",
            whySupport: res.user.whySupport || "",
            supportPurpose: res.user.supportPurpose || "",
            thankYouMessage: res.user.thankYouMessage || "",
            skills: Array.isArray(res.user.skills) ? res.user.skills.join(", ") : "",
            achievements:
              Array.isArray(res.user.achievements) && res.user.achievements.length > 0
                ? res.user.achievements
                : [""],
            projects:
              Array.isArray(res.user.projects) && res.user.projects.length > 0
                ? res.user.projects.map((p) => ({
                    ...p,
                    technologies: Array.isArray(p.technologies)
                      ? p.technologies.join(", ")
                      : p.technologies || "",
                  }))
                : prev.projects,
            socialLinks: res.user.socialLinks || prev.socialLinks,
            profilepic: res.user.profilepic || "",
            coverpic: res.user.coverpic || "",
            paymentMethod: res.user.paymentMethod || prev.paymentMethod,
            razorpayLink: res.user.razorpayLink || "",
            razorpayid: res.user.razorpayid || "",
            gatewayConfigured: Boolean(res.user.gatewayConfigured),
            isTestGateway: Boolean(res.user.razorpayid?.startsWith("rzp_test_")),
            isLiveGateway: Boolean(res.user.razorpayid?.startsWith("rzp_live_")),
            razorpaysecret: "",
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

  const handleUnsave = async (creatorUsername) => {
    try {
      const res = await unsaveCreator(creatorUsername);
      if (res?.success) {
        setSavedCreators((prev) => prev.filter((c) => c.username !== creatorUsername));
        toast.success("Bookmark removed.");
      } else {
        toast.error(res?.error || "Failed to remove bookmark.");
      }
    } catch (err) {
      toast.error("Failed to remove bookmark.");
    }
  };

  const handleMarkNotifRead = async (id = "all") => {
    try {
      const res = await markNotificationAsRead(id);
      if (res?.success) {
        if (id === "all") {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setUnreadNotifsCount(0);
        } else {
          setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
          );
          setUnreadNotifsCount((prev) => Math.max(0, prev - 1));
        }
        toast.success("Notification updated.");
      }
    } catch (err) {
      toast.error("Could not update notification.");
    }
  };

  const handleModerateReport = async (reportId, newStatus) => {
    try {
      const res = await moderateReport({ reportId, status: newStatus });
      if (res?.success) {
        setAdminData((prev) => ({
          ...prev,
          reports: prev.reports.map((r) =>
            r._id === reportId ? { ...r, status: newStatus } : r
          ),
          stats: {
            ...prev.stats,
            pendingReports: Math.max(0, prev.stats.pendingReports - 1),
          },
        }));
        toast.success(res.message);
      } else {
        toast.error(res?.error || "Failed to moderate report.");
      }
    } catch (err) {
      toast.error("Moderation error.");
    }
  };

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen bg-[#171613] text-[#F4F0E8]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#34322C] border-t-[#C96F43]" />
            <p className="text-xs text-[#AAA59A]">Loading creator space...</p>
          </div>
        </div>
      </main>
    );
  }

  const isAdmin = form.role === "admin" || session?.user?.role === "admin";
  const displayName = form.name || form.username || "Creator";

  return (
    <main className="min-h-screen bg-[#171613] text-[#F4F0E8] pb-24">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header (Human, Editorial) */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-6 border-b border-[#34322C]">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F0E8]">
              {greeting}, {displayName}
            </h1>
            <p className="mt-1 text-xs text-[#AAA59A]">
              Your creator space
            </p>
          </div>

          {form.username && (
            <Link
              href={`/${form.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#34322C] bg-[#201F1B] px-3.5 py-1.5 text-xs font-medium text-[#F4F0E8] hover:bg-[#282721] transition-colors self-start"
            >
              <span>View public page</span>
              <span className="text-[#C96F43]">↗</span>
            </Link>
          )}
        </div>

        {/* Completeness bar */}
        <div className="py-4 border-b border-[#34322C] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#AAA59A]">Profile setup:</span>
            <span className="font-medium text-[#F4F0E8]">{completeness.percentage}% complete</span>
          </div>
          <div className="w-32 h-1.5 rounded-full bg-[#201F1B] overflow-hidden border border-[#34322C]">
            <div
              className="h-full bg-[#C96F43] transition-all duration-300"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>

        {/* Quiet Navigation Tabs */}
        <div className="mt-6 mb-8 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#34322C]">
          {[
            { id: "profile", label: "Profile" },
            { id: "story", label: "Story" },
            { id: "portfolio", label: "Projects" },
            { id: "analytics", label: "Analytics" },
            { id: "supporters", label: "Bookmarks" },
            {
              id: "notifications",
              label: "Activity",
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
            },
            { id: "payments", label: "Payment" },
            ...(isAdmin ? [{ id: "admin", label: "Moderation" }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium transition-colors shrink-0 cursor-pointer border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? "border-[#C96F43] text-[#F4F0E8]"
                  : "border-transparent text-[#AAA59A] hover:text-[#F4F0E8]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1.5 rounded-full bg-[#C96F43] px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: BASIC PROFILE */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 space-y-5">
              <h2 className="font-heading text-base font-semibold text-[#F4F0E8] pb-3 border-b border-[#34322C]">
                Identity & Appearance
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-[#AAA59A] mb-1">
                    Display Name
                  </label>
                  <input
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-[#AAA59A] mb-1">
                    Account Email
                  </label>
                  <input
                    value={form.email}
                    disabled
                    type="email"
                    name="email"
                    id="email"
                    className="w-full rounded-[7px] border border-[#34322C]/50 bg-[#171613]/50 px-3 py-2 text-xs text-[#77736B] cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-xs font-medium text-[#AAA59A] mb-1">
                    Username / Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#77736B]">@</span>
                    <input
                      value={form.username}
                      onChange={handleChange}
                      type="text"
                      name="username"
                      id="username"
                      required
                      placeholder="yourhandle"
                      className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] py-2 pl-7 pr-3 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="profilepic" className="block text-xs font-medium text-[#AAA59A] mb-1">
                    Profile Image URL
                  </label>
                  <input
                    value={form.profilepic}
                    onChange={handleChange}
                    type="url"
                    name="profilepic"
                    id="profilepic"
                    placeholder="https://..."
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="coverpic" className="block text-xs font-medium text-[#AAA59A] mb-1">
                    Cover Banner URL
                  </label>
                  <input
                    value={form.coverpic}
                    onChange={handleChange}
                    type="url"
                    name="coverpic"
                    id="coverpic"
                    placeholder="https://..."
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-xs font-medium text-[#AAA59A] mb-1">
                    Short Bio (displayed on creator cards)
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={handleChange}
                    name="bio"
                    id="bio"
                    rows={2}
                    placeholder="Full stack developer building open-source web tools..."
                    className="w-full resize-none rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 space-y-4">
              <h2 className="font-heading text-base font-semibold text-[#F4F0E8] pb-3 border-b border-[#34322C]">
                Social & Portfolio Links
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#AAA59A] mb-1">GitHub URL</label>
                  <input
                    value={form.socialLinks.github}
                    onChange={handleSocialChange}
                    type="url"
                    name="github"
                    placeholder="https://github.com/username"
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AAA59A] mb-1">LinkedIn URL</label>
                  <input
                    value={form.socialLinks.linkedin}
                    onChange={handleSocialChange}
                    type="url"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AAA59A] mb-1">Portfolio URL</label>
                  <input
                    value={form.socialLinks.portfolio}
                    onChange={handleSocialChange}
                    type="url"
                    name="portfolio"
                    placeholder="https://yourwebsite.com"
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AAA59A] mb-1">X (Twitter) URL</label>
                  <input
                    value={form.socialLinks.twitter}
                    onChange={handleSocialChange}
                    type="url"
                    name="twitter"
                    placeholder="https://x.com/username"
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] px-5 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: STORY & PURPOSE */}
        {activeTab === "story" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 space-y-5">
              <h2 className="font-heading text-base font-semibold text-[#F4F0E8] pb-3 border-b border-[#34322C]">
                Story & Narrative
              </h2>

              <div>
                <label htmlFor="about" className="block text-xs font-medium text-[#AAA59A] mb-1">
                  About Me / Creator Journey
                </label>
                <textarea
                  value={form.about}
                  onChange={handleChange}
                  name="about"
                  id="about"
                  rows={4}
                  placeholder="Share your background, what motivates your work, and your creative roadmap..."
                  className="w-full resize-none rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                />
              </div>

              <div>
                <label htmlFor="currentWork" className="block text-xs font-medium text-[#AAA59A] mb-1">
                  What I&apos;m Currently Building
                </label>
                <textarea
                  value={form.currentWork}
                  onChange={handleChange}
                  name="currentWork"
                  id="currentWork"
                  rows={2}
                  placeholder="Currently working on v2 of my open-source CLI..."
                  className="w-full resize-none rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                />
              </div>

              <div>
                <label htmlFor="whySupport" className="block text-xs font-medium text-[#AAA59A] mb-1">
                  Why Support My Work
                </label>
                <textarea
                  value={form.whySupport}
                  onChange={handleChange}
                  name="whySupport"
                  id="whySupport"
                  rows={2}
                  placeholder="Your support helps me maintain open source packages full-time..."
                  className="w-full resize-none rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                />
              </div>

              <div>
                <label htmlFor="supportPurpose" className="block text-xs font-medium text-[#AAA59A] mb-1">
                  Contribution Purpose (shown on support box)
                </label>
                <input
                  value={form.supportPurpose}
                  onChange={handleChange}
                  type="text"
                  name="supportPurpose"
                  id="supportPurpose"
                  placeholder="e.g. Server hosting & infrastructure costs"
                  className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                />
              </div>

              <div>
                <label htmlFor="thankYouMessage" className="block text-xs font-medium text-[#AAA59A] mb-1">
                  Custom Thank You Note to Supporters
                </label>
                <input
                  value={form.thankYouMessage}
                  onChange={handleChange}
                  type="text"
                  name="thankYouMessage"
                  id="thankYouMessage"
                  placeholder="e.g. Thanks so much for backing independent tools!"
                  className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-xs font-medium text-[#AAA59A] mb-1">
                  Skills & Technologies (comma separated)
                </label>
                <input
                  value={form.skills}
                  onChange={handleChange}
                  type="text"
                  name="skills"
                  id="skills"
                  placeholder="Next.js, React, Node.js, TypeScript, UI/UX"
                  className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] px-5 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PORTFOLIO & PROJECTS */}
        {activeTab === "portfolio" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#34322C]">
                <div>
                  <h2 className="font-heading text-base font-semibold text-[#F4F0E8]">
                    Showcase Projects
                  </h2>
                  <p className="text-xs text-[#AAA59A] mt-0.5">
                    Highlight your best products, open source repos, or creative work.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProject}
                  className="rounded-[6px] border border-[#34322C] bg-[#171613] hover:bg-[#282721] px-3 py-1.5 text-xs font-medium text-[#F4F0E8] transition-colors cursor-pointer"
                >
                  + Add project
                </button>
              </div>

              <div className="space-y-5">
                {form.projects.map((project, index) => (
                  <div
                    key={index}
                    className="rounded-[8px] border border-[#34322C] bg-[#171613] p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#AAA59A]">
                        Project #{index + 1}
                      </span>
                      {form.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="text-xs text-[#C85C52] hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] text-[#AAA59A] mb-1">Project Name</label>
                        <input
                          value={project.name}
                          onChange={(e) => handleProjectChange(index, "name", e.target.value)}
                          placeholder="e.g. NextAuth Toolkit"
                          className="w-full rounded-[6px] border border-[#34322C] bg-[#201F1B] px-3 py-1.5 text-xs text-[#F4F0E8] outline-none focus:border-[#C96F43]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#AAA59A] mb-1">Status</label>
                        <select
                          value={project.status}
                          onChange={(e) => handleProjectChange(index, "status", e.target.value)}
                          className="w-full rounded-[6px] border border-[#34322C] bg-[#201F1B] px-3 py-1.5 text-xs text-[#F4F0E8] outline-none focus:border-[#C96F43]"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-[#AAA59A] mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={project.description}
                          onChange={(e) => handleProjectChange(index, "description", e.target.value)}
                          placeholder="Brief summary of what this project does..."
                          className="w-full resize-none rounded-[6px] border border-[#34322C] bg-[#201F1B] px-3 py-1.5 text-xs text-[#F4F0E8] outline-none focus:border-[#C96F43]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#AAA59A] mb-1">Live Demo URL</label>
                        <input
                          value={project.live}
                          onChange={(e) => handleProjectChange(index, "live", e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-[6px] border border-[#34322C] bg-[#201F1B] px-3 py-1.5 text-xs text-[#F4F0E8] outline-none focus:border-[#C96F43]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#AAA59A] mb-1">GitHub Repo URL</label>
                        <input
                          value={project.github}
                          onChange={(e) => handleProjectChange(index, "github", e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full rounded-[6px] border border-[#34322C] bg-[#201F1B] px-3 py-1.5 text-xs text-[#F4F0E8] outline-none focus:border-[#C96F43]"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs text-[#AAA59A] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={project.featured}
                            onChange={(e) => handleProjectChange(index, "featured", e.target.checked)}
                            className="rounded border-[#34322C] text-[#C96F43] focus:ring-0"
                          />
                          <span>Highlight as featured project spotlight</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#34322C]">
                <div>
                  <h2 className="font-heading text-base font-semibold text-[#F4F0E8]">
                    Milestones & Recognition
                  </h2>
                  <p className="text-xs text-[#AAA59A] mt-0.5">
                    List awards, hackathon wins, top open source contributions, or career milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="rounded-[6px] border border-[#34322C] bg-[#171613] hover:bg-[#282721] px-3 py-1.5 text-xs font-medium text-[#F4F0E8] transition-colors cursor-pointer"
                >
                  + Add milestone
                </button>
              </div>

              <div className="space-y-2.5">
                {form.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={achievement}
                      onChange={(e) => handleAchievementChange(index, e.target.value)}
                      placeholder="e.g. Built a GitHub tool with 1,000+ stars"
                      className="flex-1 rounded-[6px] border border-[#34322C] bg-[#171613] px-3 py-1.5 text-xs text-[#F4F0E8] outline-none focus:border-[#C96F43]"
                    />
                    {form.achievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="text-xs text-[#C85C52] hover:underline px-2 py-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] px-5 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: ANALYTICS (REAL SUPPORTER DATA) */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Top Metric Strip */}
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#34322C]">
                <div>
                  <h2 className="font-heading text-base font-semibold text-[#F4F0E8]">
                    Contribution Overview
                  </h2>
                  <p className="text-xs text-[#AAA59A] mt-0.5">
                    Real-time payment data synchronized directly from Razorpay.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSyncPayments}
                  disabled={syncingPayments}
                  className="rounded-[7px] border border-[#34322C] bg-[#171613] hover:bg-[#282721] px-3.5 py-1.5 text-xs font-medium text-[#F4F0E8] transition-colors disabled:opacity-50 cursor-pointer self-start"
                >
                  {syncingPayments ? "Syncing from Razorpay..." : "Sync latest payments ↻"}
                </button>
              </div>

              {analyticsLoading ? (
                <div className="py-10 text-center text-xs text-[#AAA59A]">
                  Loading supporter metrics...
                </div>
              ) : (
                <div className="pt-6 grid grid-cols-3 gap-6 text-center sm:text-left">
                  <div>
                    <span className="font-heading text-2xl font-bold text-[#C96F43] block">
                      ₹{(analytics?.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#77736B]">Total Supported</span>
                  </div>

                  <div>
                    <span className="font-heading text-2xl font-bold text-[#F4F0E8] block">
                      {analytics?.totalPayments || 0}
                    </span>
                    <span className="text-xs text-[#77736B]">Supporters Count</span>
                  </div>

                  <div>
                    <span className="font-heading text-2xl font-bold text-[#E9DFD0] block">
                      ₹{analytics?.totalPayments ? Math.round((analytics.totalAmount || 0) / analytics.totalPayments) : 0}
                    </span>
                    <span className="text-xs text-[#77736B]">Average Contribution</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Contributions Table */}
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6">
              <h3 className="font-heading text-sm font-semibold text-[#F4F0E8] mb-4">
                Recent Contributions
              </h3>

              {!analytics?.recentPayments || analytics.recentPayments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#77736B]">
                  No contributions recorded yet. Supporters will appear here once they back you.
                </div>
              ) : (
                <div className="space-y-2">
                  {analytics.recentPayments.map((p, idx) => (
                    <div
                      key={p._id || idx}
                      className="flex items-center justify-between rounded-[7px] border border-[#34322C] bg-[#171613] p-3 text-xs"
                    >
                      <div>
                        <span className="font-medium text-[#F4F0E8]">{p.name || "Anonymous"}</span>
                        {p.message && (
                          <p className="text-[11px] text-[#AAA59A] italic mt-0.5">
                            &ldquo;{p.message}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-medium text-[#C96F43]">₹{p.amount}</span>
                        <span className="block text-[10px] text-[#77736B]">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: BOOKMARKS & ACTIVITY */}
        {activeTab === "supporters" && (
          <div className="space-y-6">
            {/* Bookmarked Creators */}
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6">
              <h2 className="font-heading text-base font-semibold text-[#F4F0E8] pb-3 border-b border-[#34322C]">
                Saved Creators
              </h2>

              {supportersLoading ? (
                <div className="py-8 text-center text-xs text-[#AAA59A]">Loading saved creators...</div>
              ) : savedCreators.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#77736B]">
                  You have not saved any creators yet. Explore creators to bookmark them for later.
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {savedCreators.map((c) => (
                    <div
                      key={c._id || c.username}
                      className="flex items-center justify-between rounded-[7px] border border-[#34322C] bg-[#171613] p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-[#F4F0E8]">{c.name || c.username}</span>
                        <span className="text-[#C96F43]">@{c.username}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${c.username}`}
                          className="text-[#AAA59A] hover:text-[#F4F0E8] text-xs"
                        >
                          View ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUnsave(c.username)}
                          className="text-[#C85C52] hover:underline text-xs cursor-pointer ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Backing History */}
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6">
              <h2 className="font-heading text-base font-semibold text-[#F4F0E8] pb-3 border-b border-[#34322C]">
                Creators You&apos;ve Backed
              </h2>

              {supportersLoading ? (
                <div className="py-8 text-center text-xs text-[#AAA59A]">Loading activity...</div>
              ) : supporterActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#77736B]">
                  No contributions made yet. Discover creators and support their work.
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {supporterActivity.map((act, idx) => (
                    <div
                      key={act._id || idx}
                      className="flex items-center justify-between rounded-[7px] border border-[#34322C] bg-[#171613] p-3 text-xs"
                    >
                      <div>
                        <span className="font-medium text-[#F4F0E8]">Supported @{act.to_user}</span>
                        {act.message && (
                          <p className="text-[11px] text-[#AAA59A] italic mt-0.5">
                            &ldquo;{act.message}&rdquo;
                          </p>
                        )}
                      </div>

                      <span className="font-medium text-[#C96F43]">₹{act.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS / ACTIVITY FEED */}
        {activeTab === "notifications" && (
          <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#34322C]">
              <h2 className="font-heading text-base font-semibold text-[#F4F0E8]">
                Activity Feed
              </h2>
              {unreadNotifsCount > 0 && (
                <button
                  type="button"
                  onClick={() => handleMarkNotifRead("all")}
                  className="text-xs text-[#C96F43] hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifsLoading ? (
              <div className="py-8 text-center text-xs text-[#AAA59A]">Loading activity...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#77736B]">
                No recent activity. New contributions and updates will appear here.
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start justify-between rounded-[7px] border p-3 text-xs transition-colors ${
                      n.read
                        ? "border-[#34322C] bg-[#171613] text-[#AAA59A]"
                        : "border-[#C96F43]/40 bg-[#282721] text-[#F4F0E8]"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{n.message}</p>
                      <span className="text-[10px] text-[#77736B] block mt-1">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN") : ""}
                      </span>
                    </div>

                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkNotifRead(n._id)}
                        className="text-[11px] text-[#C96F43] hover:underline shrink-0 ml-3"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: PAYMENT SETTINGS */}
        {activeTab === "payments" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 space-y-6">
              <div className="pb-3 border-b border-[#34322C]">
                <h2 className="font-heading text-base font-semibold text-[#F4F0E8]">
                  Payment Settings
                </h2>
                <p className="text-xs text-[#AAA59A] mt-0.5">
                  Select your preferred way to receive funds from supporters.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-[#AAA59A]">
                  Choose Payment Method
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex items-start gap-3 rounded-[8px] border p-4 cursor-pointer transition-colors ${
                      form.paymentMethod === "razorpay_link"
                        ? "border-[#C96F43] bg-[#282721]"
                        : "border-[#34322C] bg-[#171613] hover:bg-[#201F1B]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay_link"
                      checked={form.paymentMethod === "razorpay_link"}
                      onChange={handleChange}
                      className="mt-0.5 text-[#C96F43] focus:ring-0"
                    />
                    <div>
                      <span className="font-medium text-xs text-[#F4F0E8] block">
                        Razorpay Payment Link
                      </span>
                      <span className="text-[11px] text-[#AAA59A] mt-1 block leading-relaxed">
                        Supporters click Support and are redirected to your personalized Razorpay payment page (e.g. pages.razorpay.com/pl_xyz).
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 rounded-[8px] border p-4 cursor-pointer transition-colors ${
                      form.paymentMethod === "razorpay_gateway"
                        ? "border-[#C96F43] bg-[#282721]"
                        : "border-[#34322C] bg-[#171613] hover:bg-[#201F1B]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay_gateway"
                      checked={form.paymentMethod === "razorpay_gateway"}
                      onChange={handleChange}
                      className="mt-0.5 text-[#C96F43] focus:ring-0"
                    />
                    <div>
                      <span className="font-medium text-xs text-[#F4F0E8] block">
                        Razorpay Integrated Gateway
                      </span>
                      <span className="text-[11px] text-[#AAA59A] mt-1 block leading-relaxed">
                        Supporters pay directly on your page via Razorpay modal using your Razorpay Key ID and Secret.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Razorpay Link Fields */}
              {form.paymentMethod === "razorpay_link" && (
                <div className="pt-4 border-t border-[#34322C] space-y-3">
                  <label htmlFor="razorpayLink" className="block text-xs font-medium text-[#AAA59A]">
                    Personalized Razorpay Payment Link URL
                  </label>
                  <input
                    value={form.razorpayLink}
                    onChange={handleChange}
                    type="url"
                    name="razorpayLink"
                    id="razorpayLink"
                    placeholder="https://pages.razorpay.com/pl_..."
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                  />
                  <p className="text-[11px] text-[#77736B]">
                    Generate your payment link in your Razorpay Dashboard under Payment Links or Pages.
                  </p>
                </div>
              )}

              {/* Razorpay Gateway Fields */}
              {form.paymentMethod === "razorpay_gateway" && (
                <div className="pt-4 border-t border-[#34322C] space-y-4">
                  {form.gatewayConfigured && (
                    <div className="rounded-[6px] border border-[#7E9B72]/30 bg-[#7E9B72]/10 p-3 text-xs text-[#7E9B72]">
                      ✓ Razorpay gateway configured ({form.isLiveGateway ? "Live Mode" : "Test Mode"}).
                    </div>
                  )}

                  <div>
                    <label htmlFor="razorpayid" className="block text-xs font-medium text-[#AAA59A] mb-1">
                      Razorpay Key ID
                    </label>
                    <input
                      value={form.razorpayid}
                      onChange={handleChange}
                      type="text"
                      name="razorpayid"
                      id="razorpayid"
                      placeholder="rzp_test_... or rzp_live_..."
                      className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                    />
                  </div>

                  <div>
                    <label htmlFor="razorpaysecret" className="block text-xs font-medium text-[#AAA59A] mb-1">
                      Razorpay Key Secret
                    </label>
                    <input
                      value={form.razorpaysecret}
                      onChange={handleChange}
                      type="password"
                      name="razorpaysecret"
                      id="razorpaysecret"
                      placeholder={form.gatewayConfigured ? "•••••••••••• (Leave blank to keep current secret)" : "Enter secret key"}
                      className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43]"
                    />
                    <p className="mt-1 text-[11px] text-[#77736B]">
                      Secrets are securely encrypted and never displayed back in the browser.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] px-5 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving settings..." : "Save payment settings"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 8: ADMIN & MODERATION */}
        {activeTab === "admin" && isAdmin && (
          <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 space-y-6">
            <h2 className="font-heading text-base font-semibold text-[#F4F0E8] pb-3 border-b border-[#34322C]">
              Platform Moderation & Reports
            </h2>

            {adminLoading ? (
              <div className="py-8 text-center text-xs text-[#AAA59A]">Loading moderation queue...</div>
            ) : !adminData?.reports || adminData.reports.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#77736B]">
                No pending moderation reports.
              </div>
            ) : (
              <div className="space-y-3">
                {adminData.reports.map((report) => (
                  <div
                    key={report._id}
                    className="rounded-[7px] border border-[#34322C] bg-[#171613] p-4 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F4F0E8]">
                        Reported: @{report.targetUsername}
                      </span>
                      <span className="rounded-[4px] bg-[#282721] px-2 py-0.5 text-[10px] text-[#AAA59A]">
                        {report.status}
                      </span>
                    </div>

                    <p className="text-[#AAA59A]">Reason: {report.reason}</p>
                    {report.description && (
                      <p className="text-[#77736B] italic">{report.description}</p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleModerateReport(report._id, "Resolved")}
                        className="rounded-[4px] bg-[#7E9B72]/20 border border-[#7E9B72]/30 px-2.5 py-1 text-[11px] text-[#7E9B72]"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModerateReport(report._id, "Dismissed")}
                        className="rounded-[4px] border border-[#34322C] bg-[#201F1B] px-2.5 py-1 text-[11px] text-[#AAA59A]"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
