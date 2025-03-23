"use client";

import { useState, useEffect } from "react";
import { dataService } from "@/lib/data-service";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { Organization } from "@/lib/data-service"; // Import the Organization type

export default function InviteCodeManager() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copying, setCopying] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isDean, setIsDean] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get user profile to check role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, organization_id")
          .eq("id", user.id)
          .single();

        if (!profile) return;

        // Check if user is dean
        if (profile.role === "dean") {
          setIsDean(true);

          // Get organization details
          if (profile.organization_id) {
            const { data: org } = await supabase
              .from("organizations")
              .select("*")
              .eq("id", profile.organization_id)
              .single();

            if (org) setOrganization(org);
          }
        }
      } catch (err) {
        console.error("Failed to fetch organization data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateNewCode = async () => {
    if (!organization || !isDean) return;

    try {
      setGenerating(true);
      const { data, error } = await dataService.generateNewInviteCode(
        organization.id,
      );
      if (error) throw error;
      if (data) setOrganization(data);
    } catch (err) {
      console.error("Failed to generate new invite code:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!organization?.invite_code) return;

    try {
      setCopying(true);
      await navigator.clipboard.writeText(organization.invite_code);
      // Show success state for 2 seconds
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error("Failed to copy invite code:", err);
      setCopying(false);
    }
  };

  // If not a dean, don't show this component
  if (!isDean && !loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Teachers to Your Organization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Share this code with teachers to invite them to your organization:
            </div>

            <div className="flex space-x-2">
              <Input
                value={organization?.invite_code || "No code generated"}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                disabled={!organization?.invite_code || copying}
              >
                {copying ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleGenerateNewCode}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate New Code
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Note: Generating a new code invalidates the previous one.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
