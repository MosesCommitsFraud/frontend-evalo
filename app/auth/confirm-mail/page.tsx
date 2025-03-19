"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EmailConfirmationScreen({
  onResendEmail = null,
}: {
  onResendEmail?: (() => Promise<void>) | null;
}) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  // Retrieve the email from query params, fallback to empty string if not present.
  const email = searchParams.get("email") || "";
  const supabase = createClient();

  const handleResendEmail = async () => {
    if (onResendEmail) {
      await onResendEmail();
      return;
    }

    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        setError(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <Card className="w-full max-w-md border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-2 text-center">
          <div className="w-full flex justify-center mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Confirm Your Email
          </CardTitle>
          <CardDescription>
            We&apos;ve sent a confirmation email to{" "}
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>
            To complete your registration, please check your email inbox and
            click on the confirmation link.
          </p>

          {resendSuccess && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <p>Confirmation email resent successfully!</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              <p>{error}</p>
            </div>
          )}

          <div className="pt-2 pb-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend Email
              </>
            )}
          </Button>
          <Button variant="default" asChild>
            <Link href="/auth/sign-in">Return to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
