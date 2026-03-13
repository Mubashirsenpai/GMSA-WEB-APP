"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { getRelativeTime } from "@/lib/relativeTime";

export type ContentCardAction = "register" | "download";

export interface ContentCardProps {
  /** Optional image URL; card shows a placeholder if missing */
  imageUrl?: string | null;
  title: string;
  /** Optional subtitle (e.g. date, author, venue) */
  subtitle?: string;
  /** When the item was last updated (ISO string); shown as "X ago" */
  updatedAt?: string | null;
  /** When the item was created (ISO string); used for relative time if updatedAt not set */
  createdAt?: string | null;
  /** Link for "View details" (used when onViewDetailsClick is not provided) */
  viewDetailsHref: string;
  /** When provided, "View details" opens in a popup instead of navigating */
  onViewDetailsClick?: () => void;
  /** Secondary action: Register (e.g. events) or Download (e.g. timetables, materials) */
  secondaryAction?: {
    label: ContentCardAction;
    href: string;
  };
  /** Optional extra content below subtitle (e.g. meta, badges) */
  children?: React.ReactNode;
  /** Optional actions for dashboard (e.g. Edit, Delete buttons) */
  manageActions?: React.ReactNode;
}

export function ContentCard({
  imageUrl,
  title,
  subtitle,
  updatedAt,
  createdAt,
  viewDetailsHref,
  onViewDetailsClick,
  secondaryAction,
  children,
  manageActions,
}: ContentCardProps) {
  const relativeTime = getRelativeTime(updatedAt, createdAt);
  return (
    <article className="card overflow-hidden flex flex-col h-full">
      <div className="aspect-video bg-gray-100 shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-light">
            {title.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{subtitle}</p>}
        {relativeTime && (
          <p className="text-xs text-gray-400 mt-0.5">{relativeTime}</p>
        )}
        {children && <div className="mt-2">{children}</div>}
        <div className="mt-4 flex flex-wrap gap-2">
          {onViewDetailsClick ? (
            <button
              type="button"
              onClick={onViewDetailsClick}
              className="btn-secondary inline-flex items-center gap-1.5 text-sm py-2 px-3"
            >
              <ExternalLink className="w-4 h-4" />
              View details
            </button>
          ) : (
            <Link
              href={viewDetailsHref}
              className="btn-secondary inline-flex items-center gap-1.5 text-sm py-2 px-3"
            >
              <ExternalLink className="w-4 h-4" />
              View details
            </Link>
          )}
          {secondaryAction && (
            <a
              href={secondaryAction.href}
              target={secondaryAction.label === "download" ? "_blank" : undefined}
              rel={secondaryAction.label === "download" ? "noopener noreferrer" : undefined}
              className={
                secondaryAction.label === "register"
                  ? "btn-primary inline-flex items-center gap-1.5 text-sm py-2 px-3"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5 text-sm py-2 px-3 rounded-lg transition-colors"
              }
            >
              {secondaryAction.label === "download" && <Download className="w-4 h-4" />}
              {secondaryAction.label === "register" ? "Register" : "Download"}
            </a>
          )}
          {manageActions}
        </div>
      </div>
    </article>
  );
}
