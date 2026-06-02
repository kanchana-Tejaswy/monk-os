"use client";

export default function GlobalError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B0D10] text-zinc-900 dark:text-zinc-100 p-4 text-center">
          <h2 className="text-2xl font-heading font-black mb-4 uppercase tracking-tighter">System Disruption</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-soft mb-8 max-w-md">
            A critical error has interrupted your Monk Mode session.
          </p>
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-xs"
          >
            Reset System
          </button>
        </div>
      </body>
    </html>
  );
}
