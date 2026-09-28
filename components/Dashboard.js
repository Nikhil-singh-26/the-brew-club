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

const getRelativeTime = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

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
      <main className="min-h-screen bg-[#F7F4EE] text-[#1E1D1A]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#DED8CE] border-t-[#C86B3C]" />
            <p className="text-xs text-[#6F6A60]">Loading your creator studio...</p>
          </div>
        </div>
      </main>
    );
  }

  const isAdmin = form.role === "admin" || session?.user?.role === "admin";
  const displayName = form.name || form.username || "Creator";

  return (
    <main className="min-h-screen bg-[#F7F4EE] text-[#1E1D1A] pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {/* Header (Human & Product-Focused) */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-6 border-b border-[#DED8CE]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F5E8E0] text-[#C86B3C] text-[11px] font-semibold uppercase tracking-wider mb-2">
              Creator Studio
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1D1A]">
              {greeting}, {displayName}
            </h1>
            <p className="mt-1 text-xs text-[#6F6A60]">
              Manage your personal page, showcase projects, and track real verified supporter contributions.
            </p>
          </div>

          {form.username && (
            <Link
              href={`/${form.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-medium text-[#1E1D1A] shadow-xs hover:bg-[#F0ECE4] transition self-start sm:self-auto"
            >
              <span>View public page</span>
              <span className="text-[#C86B3C]">↗</span>
            </Link>
          )}
        </div>

        {/* Profile Completeness Gauge */}
        <div className="my-6 rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold text-[#1E1D1A]">Profile setup:</span>
              <span className="rounded-[4px] bg-[#F5E8E0] text-[#C86B3C] px-2 py-0.5 text-xs font-bold">
                {completeness.percentage}% complete
              </span>
            </div>
            <p className="mt-1 text-xs text-[#6F6A60]">
              {completeness.percentage === 100
                ? "🎉 Great job! Your profile is complete and ready to convert supporters."
                : "Fill out your story, projects, and payment credentials to maximize supporter backing."}
            </p>
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <div className="h-2 w-full rounded-full bg-[#F0ECE4] overflow-hidden border border-[#DED8CE]/60">
              <div
                className="h-full bg-[#C86B3C] transition-all duration-300"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>
            <span className="block text-right text-[10px] text-[#918B80] mt-1">
              {completeness.completed} of {completeness.total} completed
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#DED8CE]">
          {[
            { id: "profile", label: "Profile Info" },
            { id: "story", label: "Story & Narrative" },
            { id: "portfolio", label: "Projects & Highlights" },
            { id: "analytics", label: "Analytics (Verified Data)" },
            { id: "supporters", label: "Bookmarks & Activity" },
            {
              id: "notifications",
              label: "Activity Feed",
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
            },
            { id: "payments", label: "Payment Settings" },
            ...(isAdmin ? [{ id: "admin", label: "Moderation Queue" }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium transition shrink-0 cursor-pointer border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? "border-[#C86B3C] text-[#C86B3C] font-semibold"
                  : "border-transparent text-[#6F6A60] hover:text-[#1E1D1A]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1.5 rounded-full bg-[#C86B3C] px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: BASIC PROFILE */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs space-y-5">
              <h2 className="font-heading text-base font-bold text-[#1E1D1A] pb-3 border-b border-[#DED8CE]/60">
                Creator Identity
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-[#6F6A60] mb-1">
                    Display Name
                  </label>
                  <input
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-[#6F6A60] mb-1">
                    Account Email (Private)
                  </label>
                  <input
                    value={form.email}
                    disabled
                    type="email"
                    name="email"
                    id="email"
                    className="w-full rounded-[7px] border border-[#DED8CE]/50 bg-[#F0ECE4] px-3 py-2 text-xs text-[#918B80] cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-xs font-medium text-[#6F6A60] mb-1">
                    Username Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#918B80]">@</span>
                    <input
                      value={form.username}
                      onChange={handleChange}
                      type="text"
                      name="username"
                      id="username"
                      required
                      placeholder="yourhandle"
                      className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] py-2 pl-7 pr-3 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="profilepic" className="block text-xs font-medium text-[#6F6A60] mb-1">
                    Profile Image URL
                  </label>
                  <input
                    value={form.profilepic}
                    onChange={handleChange}
                    type="url"
                    name="profilepic"
                    id="profilepic"
                    placeholder="https://..."
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="coverpic" className="block text-xs font-medium text-[#6F6A60] mb-1">
                    Cover Banner Image URL
                  </label>
                  <input
                    value={form.coverpic}
                    onChange={handleChange}
                    type="url"
                    name="coverpic"
                    id="coverpic"
                    placeholder="https://..."
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-xs font-medium text-[#6F6A60] mb-1">
                    Short Bio (displayed on cards)
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={handleChange}
                    name="bio"
                    id="bio"
                    rows={2}
                    placeholder="Full stack developer building open-source web tools..."
                    className="w-full resize-none rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
              <h2 className="font-heading text-base font-bold text-[#1E1D1A] pb-3 border-b border-[#DED8CE]/60">
                Social Links & Portfolio
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#6F6A60] mb-1">GitHub URL</label>
                  <input
                    value={form.socialLinks.github}
                    onChange={handleSocialChange}
                    type="url"
                    name="github"
                    placeholder="https://github.com/username"
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6F6A60] mb-1">LinkedIn URL</label>
                  <input
                    value={form.socialLinks.linkedin}
                    onChange={handleSocialChange}
                    type="url"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6F6A60] mb-1">Portfolio URL</label>
                  <input
                    value={form.socialLinks.portfolio}
                    onChange={handleSocialChange}
                    type="url"
                    name="portfolio"
                    placeholder="https://yourwebsite.com"
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6F6A60] mb-1">X (Twitter) URL</label>
                  <input
                    value={form.socialLinks.twitter}
                    onChange={handleSocialChange}
                    type="url"
                    name="twitter"
                    placeholder="https://x.com/username"
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-6 py-2.5 text-xs font-medium text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: STORY & PURPOSE */}
        {activeTab === "story" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs space-y-5">
              <h2 className="font-heading text-base font-bold text-[#1E1D1A] pb-3 border-b border-[#DED8CE]/60">
                Story & Mission
              </h2>

              <div>
                <label htmlFor="about" className="block text-xs font-medium text-[#6F6A60] mb-1">
                  About Me / Background Narrative
                </label>
                <textarea
                  value={form.about}
                  onChange={handleChange}
                  name="about"
                  id="about"
                  rows={4}
                  placeholder="Share your developer journey, what motivates you, and your roadmap..."
                  className="w-full resize-none rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                />
              </div>

              <div>
                <label htmlFor="currentWork" className="block text-xs font-medium text-[#6F6A60] mb-1">
                  What I&apos;m Currently Building
                </label>
                <textarea
                  value={form.currentWork}
                  onChange={handleChange}
                  name="currentWork"
                  id="currentWork"
                  rows={2}
                  placeholder="Currently working on v2 of my open-source developer toolkit..."
                  className="w-full resize-none rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                />
              </div>

              <div>
                <label htmlFor="whySupport" className="block text-xs font-medium text-[#6F6A60] mb-1">
                  Why Support My Journey
                </label>
                <textarea
                  value={form.whySupport}
                  onChange={handleChange}
                  name="whySupport"
                  id="whySupport"
                  rows={2}
                  placeholder="Your support helps me maintain open source packages full-time..."
                  className="w-full resize-none rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                />
              </div>

              <div>
                <label htmlFor="supportPurpose" className="block text-xs font-medium text-[#6F6A60] mb-1">
                  Support Purpose Banner
                </label>
                <input
                  value={form.supportPurpose}
                  onChange={handleChange}
                  type="text"
                  name="supportPurpose"
                  id="supportPurpose"
                  placeholder="e.g. Cloud server hosting and maintenance costs"
                  className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                />
              </div>

              <div>
                <label htmlFor="thankYouMessage" className="block text-xs font-medium text-[#6F6A60] mb-1">
                  Custom Supporter Thank You Note
                </label>
                <input
                  value={form.thankYouMessage}
                  onChange={handleChange}
                  type="text"
                  name="thankYouMessage"
                  id="thankYouMessage"
                  placeholder="e.g. Thanks so much for fueling independent creation!"
                  className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-xs font-medium text-[#6F6A60] mb-1">
                  Skills & Stack (comma separated)
                </label>
                <input
                  value={form.skills}
                  onChange={handleChange}
                  type="text"
                  name="skills"
                  id="skills"
                  placeholder="Next.js, React, Node.js, TypeScript, UI/UX"
                  className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-6 py-2.5 text-xs font-medium text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PORTFOLIO & PROJECTS */}
        {activeTab === "portfolio" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#DED8CE]/60">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#1E1D1A]">
                    Showcase Projects
                  </h2>
                  <p className="text-xs text-[#6F6A60] mt-0.5">
                    Highlight your best products, open source repos, or portfolio tools.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProject}
                  className="rounded-[6px] border border-[#DED8CE] bg-[#F7F4EE] hover:bg-[#F0ECE4] px-3 py-1.5 text-xs font-medium text-[#1E1D1A] shadow-xs transition cursor-pointer"
                >
                  + Add project
                </button>
              </div>

              <div className="space-y-4">
                {form.projects.map((project, index) => (
                  <div
                    key={index}
                    className="rounded-[8px] border border-[#DED8CE] bg-[#F7F4EE] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E1D1A]">
                        Project #{index + 1}
                      </span>
                      {form.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="text-xs text-[#B8544B] hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-medium text-[#6F6A60] mb-1">Project Name</label>
                        <input
                          value={project.name}
                          onChange={(e) => handleProjectChange(index, "name", e.target.value)}
                          placeholder="e.g. Developer CLI"
                          className="w-full rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1E1D1A] outline-none focus:border-[#C86B3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#6F6A60] mb-1">Status</label>
                        <select
                          value={project.status}
                          onChange={(e) => handleProjectChange(index, "status", e.target.value)}
                          className="w-full rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1E1D1A] outline-none focus:border-[#C86B3C]"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-[#6F6A60] mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={project.description}
                          onChange={(e) => handleProjectChange(index, "description", e.target.value)}
                          placeholder="Brief overview of what this project achieves..."
                          className="w-full resize-none rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1E1D1A] outline-none focus:border-[#C86B3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#6F6A60] mb-1">Live Demo URL</label>
                        <input
                          value={project.live}
                          onChange={(e) => handleProjectChange(index, "live", e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1E1D1A] outline-none focus:border-[#C86B3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#6F6A60] mb-1">GitHub Repo URL</label>
                        <input
                          value={project.github}
                          onChange={(e) => handleProjectChange(index, "github", e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1E1D1A] outline-none focus:border-[#C86B3C]"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs text-[#6F6A60] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={project.featured}
                            onChange={(e) => handleProjectChange(index, "featured", e.target.checked)}
                            className="rounded border-[#DED8CE] text-[#C86B3C] focus:ring-0"
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
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DED8CE]/60">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#1E1D1A]">
                    Milestones & Recognition
                  </h2>
                  <p className="text-xs text-[#6F6A60] mt-0.5">
                    List awards, hackathon wins, top contributions, or major milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="rounded-[6px] border border-[#DED8CE] bg-[#F7F4EE] hover:bg-[#F0ECE4] px-3 py-1.5 text-xs font-medium text-[#1E1D1A] shadow-xs transition cursor-pointer"
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
                      placeholder="e.g. Built a developer tool with 1,000+ GitHub stars"
                      className="flex-1 rounded-[6px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-1.5 text-xs text-[#1E1D1A] outline-none focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                    />
                    {form.achievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="text-xs text-[#B8544B] hover:underline px-2 py-1"
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
                className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-6 py-2.5 text-xs font-medium text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: ANALYTICS (REAL VERIFIED SUPPORTER DATA ONLY) */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Top Metric Strip */}
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#DED8CE]/60">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#1E1D1A]">
                    Verified Supporter Overview
                  </h2>
                  <p className="text-xs text-[#6F6A60] mt-0.5">
                    Real payment transactions verified directly through Razorpay.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSyncPayments}
                  disabled={syncingPayments}
                  className="rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] hover:bg-[#F0ECE4] px-3.5 py-1.5 text-xs font-medium text-[#1E1D1A] shadow-xs transition disabled:opacity-50 cursor-pointer self-start"
                >
                  {syncingPayments ? "Syncing from Razorpay..." : "Sync latest payments ↻"}
                </button>
              </div>

              {analyticsLoading ? (
                <div className="py-10 text-center text-xs text-[#6F6A60]">
                  Loading supporter metrics...
                </div>
              ) : (
                <div className="pt-6 grid grid-cols-3 gap-6 text-center sm:text-left">
                  <div>
                    <span className="font-heading text-3xl font-bold text-[#C86B3C] block">
                      ₹{(analytics?.totalRaised || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#6F6A60]">Total Verified Backing</span>
                  </div>

                  <div>
                    <span className="font-heading text-3xl font-bold text-[#1E1D1A] block">
                      {analytics?.totalContributions || 0}
                    </span>
                    <span className="text-xs text-[#6F6A60]">Verified Backers</span>
                  </div>

                  <div>
                    <span className="font-heading text-3xl font-bold text-[#557A5C] block">
                      ₹{analytics?.averageContribution || 0}
                    </span>
                    <span className="text-xs text-[#6F6A60]">Average Contribution</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Contributions Table */}
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <h3 className="font-heading text-sm font-bold text-[#1E1D1A] mb-4">
                Recent Verified Contributions
              </h3>

              {!analytics?.recentPayments || analytics.recentPayments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6F6A60] rounded-[8px] bg-[#F7F4EE] border border-[#DED8CE]/60 p-6">
                  No verified contributions recorded yet. Supporters will appear here once confirmed by Razorpay.
                </div>
              ) : (
                <div className="space-y-2">
                  {analytics.recentPayments.map((p, idx) => (
                    <div
                      key={p._id || idx}
                      className="flex items-center justify-between rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] p-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1E1D1A]">{p.name || "Anonymous Supporter"}</span>
                        {p.message && (
                          <p className="text-[11px] text-[#6F6A60] italic mt-0.5">
                            &ldquo;{p.message}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-[#C86B3C]">₹{p.amount}</span>
                        <span className="block text-[10px] text-[#918B80]">
                          {getRelativeTime(p.createdAt)}
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
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <h2 className="font-heading text-base font-bold text-[#1E1D1A] pb-3 border-b border-[#DED8CE]/60">
                Bookmarked Creators
              </h2>

              {supportersLoading ? (
                <div className="py-8 text-center text-xs text-[#6F6A60]">Loading bookmarks...</div>
              ) : savedCreators.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6F6A60]">
                  You haven&apos;t bookmarked any creators yet. Explore creators to follow their journey.
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {savedCreators.map((c) => (
                    <div
                      key={c._id || c.username}
                      className="flex items-center justify-between rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#1E1D1A]">{c.name || c.username}</span>
                        <span className="text-[#C86B3C]">@{c.username}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${c.username}`}
                          className="text-[#6F6A60] hover:text-[#1E1D1A] text-xs font-medium"
                        >
                          View ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUnsave(c.username)}
                          className="text-[#B8544B] hover:underline text-xs cursor-pointer ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Contributions History */}
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <h2 className="font-heading text-base font-bold text-[#1E1D1A] pb-3 border-b border-[#DED8CE]/60">
                Contributions You&apos;ve Made
              </h2>

              {supportersLoading ? (
                <div className="py-8 text-center text-xs text-[#6F6A60]">Loading contributions...</div>
              ) : supporterActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6F6A60]">
                  No contributions made yet. Discover creators and support their work.
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {supporterActivity.map((act, idx) => (
                    <div
                      key={act._id || idx}
                      className="flex items-center justify-between rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] p-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1E1D1A]">Supported @{act.to_user}</span>
                        {act.message && (
                          <p className="text-[11px] text-[#6F6A60] italic mt-0.5">
                            &ldquo;{act.message}&rdquo;
                          </p>
                        )}
                      </div>

                      <span className="font-bold text-[#C86B3C]">₹{act.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS / ACTIVITY FEED */}
        {activeTab === "notifications" && (
          <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DED8CE]/60">
              <h2 className="font-heading text-base font-bold text-[#1E1D1A]">
                Activity Feed
              </h2>
              {unreadNotifsCount > 0 && (
                <button
                  type="button"
                  onClick={() => handleMarkNotifRead("all")}
                  className="text-xs text-[#C86B3C] hover:underline cursor-pointer font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifsLoading ? (
              <div className="py-8 text-center text-xs text-[#6F6A60]">Loading activity...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F6A60]">
                No recent notifications. Verified contributions and platform updates will appear here.
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start justify-between rounded-[7px] border p-3 text-xs transition-colors ${
                      n.read
                        ? "border-[#DED8CE] bg-[#F7F4EE] text-[#6F6A60]"
                        : "border-[#C86B3C]/40 bg-[#F5E8E0] text-[#1E1D1A]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{n.message}</p>
                      <span className="text-[10px] text-[#918B80] block mt-1">
                        {getRelativeTime(n.createdAt)}
                      </span>
                    </div>

                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkNotifRead(n._id)}
                        className="text-[11px] text-[#C86B3C] hover:underline shrink-0 ml-3 font-medium"
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
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
              <div className="pb-3 border-b border-[#DED8CE]/60">
                <h2 className="font-heading text-base font-bold text-[#1E1D1A]">
                  Payment Settings
                </h2>
                <p className="text-xs text-[#6F6A60] mt-0.5">
                  Choose how supporters contribute to your projects.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#1E1D1A]">
                  Select Payment Architecture
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex items-start gap-3 rounded-[8px] border p-4 cursor-pointer transition-colors shadow-xs ${
                      form.paymentMethod === "razorpay_link"
                        ? "border-[#C86B3C] bg-[#F5E8E0]/50"
                        : "border-[#DED8CE] bg-[#F7F4EE] hover:bg-[#F0ECE4]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay_link"
                      checked={form.paymentMethod === "razorpay_link"}
                      onChange={handleChange}
                      className="mt-0.5 text-[#C86B3C] focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#1E1D1A] block">
                        Razorpay Payment Link
                      </span>
                      <span className="text-[11px] text-[#6F6A60] mt-1 block leading-relaxed">
                        Supporters click Support and are redirected to your personalized Razorpay payment link (e.g. pages.razorpay.com/pl_xyz).
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 rounded-[8px] border p-4 cursor-pointer transition-colors shadow-xs ${
                      form.paymentMethod === "razorpay_gateway"
                        ? "border-[#C86B3C] bg-[#F5E8E0]/50"
                        : "border-[#DED8CE] bg-[#F7F4EE] hover:bg-[#F0ECE4]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay_gateway"
                      checked={form.paymentMethod === "razorpay_gateway"}
                      onChange={handleChange}
                      className="mt-0.5 text-[#C86B3C] focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#1E1D1A] block">
                        Razorpay Integrated Gateway
                      </span>
                      <span className="text-[11px] text-[#6F6A60] mt-1 block leading-relaxed">
                        Supporters contribute directly on your profile via Razorpay popup using your Key ID and Key Secret.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Razorpay Link Fields */}
              {form.paymentMethod === "razorpay_link" && (
                <div className="pt-4 border-t border-[#DED8CE]/60 space-y-3">
                  <label htmlFor="razorpayLink" className="block text-xs font-semibold text-[#1E1D1A]">
                    Personalized Razorpay Payment Link URL
                  </label>
                  <input
                    value={form.razorpayLink}
                    onChange={handleChange}
                    type="url"
                    name="razorpayLink"
                    id="razorpayLink"
                    placeholder="https://pages.razorpay.com/pl_..."
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                  />
                  <p className="text-[11px] text-[#6F6A60]">
                    Create a payment page or link inside your Razorpay Dashboard, copy the link URL, and paste it here.
                  </p>
                </div>
              )}

              {/* Razorpay Gateway Fields */}
              {form.paymentMethod === "razorpay_gateway" && (
                <div className="pt-4 border-t border-[#DED8CE]/60 space-y-4">
                  {form.gatewayConfigured && (
                    <div className="rounded-[6px] border border-[#557A5C]/30 bg-[#557A5C]/10 p-3 text-xs text-[#557A5C] font-medium">
                      ✓ Razorpay gateway configured ({form.isLiveGateway ? "Live Mode" : "Test Mode"}).
                    </div>
                  )}

                  <div>
                    <label htmlFor="razorpayid" className="block text-xs font-semibold text-[#1E1D1A] mb-1">
                      Razorpay Key ID
                    </label>
                    <input
                      value={form.razorpayid}
                      onChange={handleChange}
                      type="text"
                      name="razorpayid"
                      id="razorpayid"
                      placeholder="rzp_test_... or rzp_live_..."
                      className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                    />
                  </div>

                  <div>
                    <label htmlFor="razorpaysecret" className="block text-xs font-semibold text-[#1E1D1A] mb-1">
                      Razorpay Key Secret
                    </label>
                    <input
                      value={form.razorpaysecret}
                      onChange={handleChange}
                      type="password"
                      name="razorpaysecret"
                      id="razorpaysecret"
                      placeholder={form.gatewayConfigured ? "•••••••••••• (Leave blank to preserve current secret)" : "Enter secret key"}
                      className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF]"
                    />
                    <p className="mt-1 text-[11px] text-[#6F6A60]">
                      Key Secrets are securely encrypted on the server and never returned to client browsers.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-6 py-2.5 text-xs font-medium text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving settings..." : "Save payment settings"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 8: ADMIN & MODERATION */}
        {activeTab === "admin" && isAdmin && (
          <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
            <h2 className="font-heading text-base font-bold text-[#1E1D1A] pb-3 border-b border-[#DED8CE]/60">
              Platform Moderation & Reports
            </h2>

            {adminLoading ? (
              <div className="py-8 text-center text-xs text-[#6F6A60]">Loading reports queue...</div>
            ) : !adminData?.reports || adminData.reports.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F6A60]">
                No pending moderation reports.
              </div>
            ) : (
              <div className="space-y-3">
                {adminData.reports.map((report) => (
                  <div
                    key={report._id}
                    className="rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] p-4 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1E1D1A]">
                        Reported: @{report.targetUsername}
                      </span>
                      <span className="rounded-[4px] bg-[#F0ECE4] px-2 py-0.5 text-[10px] text-[#6F6A60]">
                        {report.status}
                      </span>
                    </div>

                    <p className="text-[#6F6A60]">Reason: {report.reason}</p>
                    {report.description && (
                      <p className="text-[#918B80] italic">{report.description}</p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleModerateReport(report._id, "Resolved")}
                        className="rounded-[4px] bg-[#557A5C]/20 border border-[#557A5C]/30 px-2.5 py-1 text-[11px] text-[#557A5C] font-semibold"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModerateReport(report._id, "Dismissed")}
                        className="rounded-[4px] border border-[#DED8CE] bg-[#FFFFFF] px-2.5 py-1 text-[11px] text-[#6F6A60]"
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
