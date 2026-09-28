"use client";

import React, { useState } from "react";
import Link from "next/link";

const CreatorCard = ({ creator }) => {
  const [imgError, setImgError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  if (!creator || !creator.username) return null;

  const displayName = creator.name || creator.username;
  const initial = (displayName.charAt(0) || "C").toUpperCase();
  const skills = Array.isArray(creator.skills) ? creator.skills.slice(0, 3) : [];

  return (
    <Link
      href={`/${creator.username}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-0 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/5 hover:shadow-xl hover:shadow-amber-500/5 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
    >
      {/* Top Banner snippet */}
      <div className="relative h-24 w-full overflow-hidden bg-linear-to-r from-amber-500/15 via-[#1c1813] to-orange-500/15">
        {creator.coverpic && !coverError ? (
          <img
            src={creator.coverpic}
            alt={`${displayName}'s cover`}
            onError={() => setCoverError(true)}
            className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0f14] via-transparent to-black/20" />

        {/* Payment support badge */}
        {creator.hasPaymentConfigured && (
          <div className="absolute top-3 right-3 rounded-full border border-amber-400/30 bg-black/60 px-2.5 py-1 text-[10px] font-medium text-amber-300 backdrop-blur-md">
            ☕ Accepting Support
          </div>
        )}
      </div>

      {/* Profile Avatar & Info */}
      <div className="relative -mt-10 px-6 pb-6 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="inline-block rounded-2xl border-4 border-[#0e0e13] bg-[#15151c] shadow-lg">
            {creator.profilepic && !imgError ? (
              <img
                src={creator.profilepic}
                alt={displayName}
                onError={() => setImgError(true)}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-2xl font-extrabold text-black">
                {initial}
              </div>
            )}
          </div>
        </div>

        {/* Creator Names */}
        <div>
          <h3 className="truncate text-lg font-bold text-white transition-colors group-hover:text-amber-300">
            {displayName}
          </h3>
          <p className="truncate text-xs font-medium text-amber-400/90">
            @{creator.username}
          </p>
        </div>

        {/* Creator Bio / Description */}
        <p className="mt-3 text-xs leading-relaxed text-gray-400 line-clamp-2">
          {creator.bio && creator.bio.trim()
            ? creator.bio
            : "Independent creator building and sharing creative work on The Brew Club."}
        </p>

        {/* Currently Building indicator if available */}
        {creator.currentWork && creator.currentWork.trim() && (
          <p className="mt-2 text-[11px] text-amber-300/90 truncate flex items-center gap-1">
            <span>🔨</span>
            <span className="truncate">{creator.currentWork}</span>
          </p>
        )}

        {/* Skill tags if available */}
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="rounded-md border border-white/5 bg-white/4 px-2 py-0.5 text-[10px] font-medium text-gray-300"
              >
                #{skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Card Action */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs font-semibold text-gray-300 transition-colors group-hover:text-amber-400">
          <span>View Profile</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CreatorCard;
