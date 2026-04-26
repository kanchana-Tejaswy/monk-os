"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function redeemCode(code: string) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "You must be logged in to redeem a code." }
  }

  // 2. Verify code
  const { data: codeData, error: codeError } = await supabase
    .from("redeem_codes")
    .select("*")
    .eq("code", code)
    .eq("is_used", false)
    .single()

  if (codeError || !codeData) {
    return { error: "Invalid or already used code." }
  }

  // 3. Calculate expiry date
  const expiryDate = new Date()
  if (codeData.duration_type === "1month") {
    expiryDate.setMonth(expiryDate.getMonth() + 1)
  } else if (codeData.duration_type === "1year") {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
  } else if (codeData.duration_type === "lifetime") {
    expiryDate.setFullYear(expiryDate.getFullYear() + 100) // Lifetime approx
  }

  // 4. Update code status
  const { error: updateCodeError } = await supabase
    .from("redeem_codes")
    .update({
      is_used: true,
      used_by: user.id,
      used_at: new Date().toISOString()
    })
    .eq("code", code)

  if (updateCodeError) {
    return { error: "Failed to process code. Please try again." }
  }

  // 5. Update user profile
  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({
      subscription_tier: "Mastery",
      subscription_expiry: expiryDate.toISOString()
    })
    .eq("id", user.id)

  if (updateProfileError) {
    return { error: "Failed to update your profile. Please contact support." }
  }

  revalidatePath("/")
  revalidatePath("/pricing")
  revalidatePath("/dashboard")

  return { success: `Successfully redeemed! You now have Mastery access until ${expiryDate.toLocaleDateString()}.` }
}
