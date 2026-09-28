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
      toast.error("Please sign in to bookmark creators.");
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C5BDB0] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#C86B3C]/40"
    >
      {/* Top Cover Snippet */}
      <div className="relative h-20 w-full overflow-hidden bg-linear-to-r from-[#F0ECE4] via-[#EAE5DC] to-[#F5E8E0] border-b border-[#DED8CE]/60">
        {creator.coverpic && !coverError ? (
          <img
            src={creator.coverpic}
            alt={`${displayName}'s cover`}
            onError={() => setCoverError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-[#F5E8E0]/40 via-[#F0ECE4] to-[#EAE5DC]" />
        )}

        {/* Top Badges & Bookmark */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {creator.hasPaymentConfigured && (
            <span className="rounded-[5px] border border-[#DED8CE] bg-[#FFFFFF]/90 px-2 py-0.5 text-[10px] font-medium text-[#C86B3C] shadow-xs backdrop-blur-xs">
              Accepts support
            </span>
          )}

          <button
            type="button"
            onClick={handleBookmark}
            disabled={saving}
            className={`rounded-[5px] border px-2 py-0.5 transition-colors cursor-pointer text-xs shadow-xs ${
              isSaved
                ? "border-[#C86B3C]/30 bg-[#F5E8E0] text-[#C86B3C]"
                : "border-[#DED8CE] bg-[#FFFFFF]/90 text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#FFFFFF]"
            }`}
            title={isSaved ? "Saved in bookmarks" : "Save creator"}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Profile Avatar & Details */}
      <div className="relative -mt-7 px-5 pb-5 flex-1 flex flex-col">
        {/* Avatar */}
        <div className="mb-3">
          <div className="inline-block rounded-[8px] border-2 border-[#FFFFFF] bg-[#F0ECE4] shadow-xs overflow-hidden">
            {creator.profilepic && !imgError ? (
              <img
                src={creator.profilepic}
                alt={displayName}
                onError={() => setImgError(true)}
                className="h-14 w-14 rounded-[6px] object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center bg-[#F5E8E0] text-lg font-bold text-[#C86B3C]">
                {initial}
              </div>
            )}
          </div>
        </div>

        {/* Name & Handle */}
        <div>
          <h3 className="font-heading text-base font-bold text-[#1E1D1A] group-hover:text-[#C86B3C] transition-colors truncate">
            {displayName}
          </h3>
          <p className="text-xs font-medium text-[#C86B3C] truncate">
            @{creator.username}
          </p>
        </div>

        {/* Bio */}
        <p className="mt-2 text-xs leading-relaxed text-[#6F6A60] line-clamp-2">
          {creator.bio && creator.bio.trim()
            ? creator.bio
            : "Building and sharing creative projects on The Brew Club."}
        </p>

        {/* Currently Building */}
        {creator.currentWork && creator.currentWork.trim() && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#1E1D1A] truncate bg-[#F0ECE4] px-2 py-1 rounded-[5px]">
            <span className="text-[#918B80] shrink-0">Building:</span>
            <span className="font-medium truncate">{creator.currentWork}</span>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="rounded-[4px] border border-[#DED8CE] bg-[#F7F4EE] px-1.5 py-0.5 text-[10px] text-[#6F6A60]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Bottom Action Bar */}
        <div className="mt-4 flex items-center justify-between border-t border-[#DED8CE]/60 pt-3 text-xs font-medium text-[#6F6A60] group-hover:text-[#1E1D1A] transition-colors">
          <span>View profile</span>
          <span className="text-[#C86B3C] transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CreatorCard;
