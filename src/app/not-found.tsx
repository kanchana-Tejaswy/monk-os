"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B0D10] text-zinc-900 dark:text-zinc-100 p-4 text-center">
      <h2 className="text-2xl font-heading font-black mb-4 uppercase tracking-tighter italic">Focus Lost</h2>
      <p className="text-zinc-500 dark:text-zinc-400 font-soft mb-8 max-w-md text-sm">
        The path you are seeking does not exist in this discipline sequence.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-[10px]"
      >
        Return to Source
      </Link>
    </div>
  );
}
