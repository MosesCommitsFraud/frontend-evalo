// app/auth/callback/route.ts
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    // Verify the OTP
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data.user) {
      // Successfully verified, now check for an existing profile
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      console.log("Profile check:", existingProfile, profileError);

      // If no profile exists, create one
      if (!existingProfile && !profileError) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || "",
          role: "teacher", // Default role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          department: "", // Include required fields
        });

        if (insertError) {
          console.error("Error creating profile:", insertError);
        }
      }

      // Redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }

  // Redirect the user to an error page with some instructions
  redirect("/auth/sign-in?error=auth_callback_error");
}
