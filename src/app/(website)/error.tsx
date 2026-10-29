"use client";

import { useEffect } from "react";

/** Shown when content cannot be loaded (e.g. database outage). Honest, not blank, and retryable. */
export default function WebsiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main" className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl">We can&apos;t load this page right now</h1>
      <p className="mt-4">Something went wrong on our side while loading the content. Please try again in a moment.</p>
      <button type="button" onClick={reset}
        className="mt-8 rounded-full bg-btn-bg px-6 py-3 text-sm font-semibold text-btn-text transition hover:bg-secondary">
        Try again
      </button>
    </main>
  );
}
