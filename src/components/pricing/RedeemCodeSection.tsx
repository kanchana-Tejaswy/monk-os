"use client"

import { useState } from "react"
import { Gift, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { redeemCode } from "@/app/actions/redeem"
import { cn } from "@/lib/utils"

export function RedeemCodeSection() {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({
    type: "idle",
    message: ""
  })

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setStatus({ type: "loading", message: "Verifying code..." })

    try {
      const result = await redeemCode(code.trim())
      if (result.error) {
        setStatus({ type: "error", message: result.error })
      } else {
        setStatus({ type: "success", message: result.success || "Code redeemed successfully!" })
        setCode("")
      }
    } catch {
      setStatus({ type: "error", message: "Something went wrong. Please try again." })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="monk-card p-8 border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Gift className="h-12 w-12 text-primary" />
        </div>
        
        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <h3 className="text-xl font-heading font-bold flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Redeem Mastery Access
            </h3>
            <p className="text-sm text-muted-foreground font-soft">
              Have a special code? Enter it below to unlock your Mastery evolution for 1 month, 1 year, or Lifetime.
            </p>
          </div>

          <form onSubmit={handleRedeem} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your code (e.g. MONK-XXXX)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                disabled={status.type === "loading"}
                suppressHydrationWarning
              />
            </div>

            <button
              type="submit"
              disabled={status.type === "loading" || !code.trim()}
              className="w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {status.type === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                "Redeem Now"
              )}
            </button>
          </form>

          {status.type !== "idle" && (
            <div className={cn(
              "p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
              status.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"
            )}>
              {status.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <p className="text-xs font-bold leading-relaxed">{status.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
