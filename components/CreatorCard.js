"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { saveCreator, unsaveCreator } from "@/actions/useractions";
import { useToast } from "./Toast";

const CreatorCard = ({ creator }) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [imgError, setImgError] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!creator || !creator.username) return null;

  const displayName = creator.name || creator.username;
  const initial = (displayName.charAt(0) || "C").toUpperCase();
  const skills = Array.isArray(creator.skills) ? creator.skills.slice(0, 3) : [];

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error("Please sign in to save creators.");
      return;
    }

    if (session.user.name === creator.username) {
      toast.error("You cannot bookmark your own profile.");
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        const res = await unsaveCreator(creator.username);
        if (res?.success) {
          setIsSaved(false);
          toast.success("Bookmark removed.");
        }
      } else {
        const res = await saveCreator(creator.username);
        if (res?.success) {
          setIsSaved(true);
          toast.success("Creator saved to bookmarks.");
        }
      }
    } catch (err) {
      toast.error("Could not update bookmark.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link
      href={`/${creator.username}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[10px] border border-[#34322C] bg-[#201F1B] transition-all duration-200 hover:border-[#77736B]/50 hover:bg-[#282721] focus:outline-none focus:ring-2 focus:ring-[#C96F43]/40"
    >
      {/* Top Cover Snippet */}
      <div className="relative h-20 w-full overflow-hidden bg-[#171613] border-b border-[#34322C]">
        {creator.coverpic && !coverError ? (
          <img
            src={creator.coverpic}
            alt={`${displayName}'s cover`}
            onError={() => setCoverError(true)}
            className="h-full w-full object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-80"
          />
        ) : (
          <div className="h-full w-full bg-[#171613]" />
        )}

        {/* Top Badges & Bookmark */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {creator.hasPaymentConfigured && (
            <div className="rounded-[6px] border border-[#34322C] bg-[#171613]/90 px-2 py-0.5 text-[10px] font-medium text-[#E9DFD0]">
              Accepts support
            </div>
          )}

          <button
            type="button"
            onClick={handleBookmark}
            disabled={saving}
            className={`rounded-[6px] border px-2 py-1 transition cursor-pointer text-xs ${
              isSaved
                ? "border-[#C96F43]/40 bg-[#C96F43]/15 text-[#C96F43]"
                : "border-[#34322C] bg-[#171613]/80 text-[#AAA59A] hover:text-[#F4F0E8] hover:bg-[#282721]"
            }`}
            title={isSaved ? "Saved" : "Save creator"}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Profile Avatar & Details */}
      <div className="relative -mt-7 px-5 pb-5 flex-1 flex flex-col">
        {/* Avatar */}
        <div className="mb-3">
          <div className="inline-block rounded-[8px] border-2 border-[#201F1B] bg-[#171613] overflow-hidden">
            {creator.profilepic && !imgError ? (
              <img
                src={creator.profilepic}
                alt={displayName}
                onError={() => setImgError(true)}
                className="h-14 w-14 rounded-[6px] object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center bg-[#282721] text-lg font-bold text-[#E9DFD0]">
                {initial}
              </div>
            )}
          </div>
        </div>

        {/* Name & Handle */}
        <div>
          <h3 className="font-heading text-base font-semibold text-[#F4F0E8] group-hover:text-[#E9DFD0] transition-colors truncate">
            {displayName}
          </h3>
          <p className="text-xs text-[#C96F43] truncate">
            @{creator.username}
          </p>
        </div>

        {/* Bio */}
        <p className="mt-2.5 text-xs leading-relaxed text-[#AAA59A] line-clamp-2">
          {creator.bio && creator.bio.trim()
            ? creator.bio
            : "Building and sharing creative work on The Brew Club."}
        </p>

        {/* Currently Building */}
        {creator.currentWork && creator.currentWork.trim() && (
          <p className="mt-2 text-[11px] text-[#E9DFD0]/90 truncate">
            <span className="text-[#77736B]">Building:</span> {creator.currentWork}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="rounded-[6px] border border-[#34322C] bg-[#171613] px-2 py-0.5 text-[10px] text-[#AAA59A]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Bottom Action Divider */}
        <div className="mt-4 flex items-center justify-between border-t border-[#34322C] pt-3 text-xs font-medium text-[#AAA59A] group-hover:text-[#F4F0E8] transition-colors">
          <span>View profile</span>
          <span className="text-[#C96F43] transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CreatorCard;
