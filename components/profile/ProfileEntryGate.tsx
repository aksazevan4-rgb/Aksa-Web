"use client";

/**
 * components/profile/ProfileEntryGate.tsx
 *
 * Wraps an entire rendered profile layout (background + card + everything)
 * and shows it fully blurred/dimmed behind a "click to enter..." veil on
 * first paint — the same pattern guns.lol uses. Clicking the veil fades it
 * out and un-blurs/scales the profile in with one continuous transition.
 *
 * This also doubles as the user-gesture we need before any background
 * <video>/<audio> can autoplay with sound in most browsers, so it's wired
 * up as a single wrapper in app/[username]/page.tsx rather than duplicated
 * per layout.
 */

import { useState, type ReactNode } from "react";

export function ProfileEntryGate({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false);

  return (
    <div className="profile-gate">
      <div className={`profile-gate__content ${entered ? "profile-gate__content--entered" : ""}`}>
        {children}
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Click to enter"
        onClick={() => setEntered(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setEntered(true);
        }}
        className={`profile-gate__veil ${entered ? "profile-gate__veil--hidden" : ""}`}
      >
        <span className="profile-gate__label">click to enter...</span>
      </div>
    </div>
  );
}
