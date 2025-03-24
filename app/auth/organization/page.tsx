"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Loader2,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { dataService } from "@/lib/data-service";

export default function OrganizationPage() {
  const router = useRouter();

  // Form state
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create organization form
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");

  // Join organization form
  const [inviteCode, setInviteCode] = useState("");

  // Handle slug generation from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setOrgName(name);

    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

    setOrgSlug(slug);
  };

  // Handle organization creation
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (!orgName.trim()) {
      setError("Organization name is required");
      setIsLoading(false);
      return;
    }

    if (!orgSlug.trim()) {
      setError("Organization slug is required");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await dataService.createOrganization(
        orgName,
        orgSlug,
      );

      if (error) {
        console.error("Error creating organization:", error);
        setError(error.message || "Failed to create organization");
        return;
      }

      if (data) {
        setSuccess("Organization created successfully!");
        // Redirect happens in dataService via window.location.href for this function
      }
    } catch (err) {
      console.error("Exception during organization creation:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle joining an organization
  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (!inviteCode.trim()) {
      setError("Invite code is required");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await dataService.joinOrganizationWithCode(
        inviteCode.trim(),
      );

      if (error) {
        console.error("Error joining organization:", error);
        setError(error.message || "Invalid invitation code");
        return;
      }

      if (data) {
        setSuccess("Successfully joined organization!");
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Exception during organization join:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <Building2 className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Set Up Your Organization
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new organization or join an existing one
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs
              defaultValue="create"
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "create" | "join")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Create
                </TabsTrigger>
                <TabsTrigger value="join" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Join
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <p>{success}</p>
              </div>
            )}

            {activeTab === "create" ? (
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="E.g., Stanford University"
                    value={orgName}
                    onChange={handleNameChange}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The full name of your school or educational institution
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgSlug">Organization URL</Label>
                  <div className="flex items-center">
                    <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 text-muted-foreground text-sm">
                      evalo.app/
                    </span>
                    <Input
                      id="orgSlug"
                      placeholder="stanford"
                      value={orgSlug}
                      onChange={(e) =>
                        setOrgSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-"),
                        )
                      }
                      className="rounded-l-none"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A unique identifier for your organization
                  </p>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Organization...
                      </>
                    ) : (
                      <>
                        Create Organization
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleJoinOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invitation Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter invitation code"
                    value={inviteCode}
                    onChange={(e) =>
                      setInviteCode(e.target.value.toUpperCase())
                    }
                    className="text-center tracking-wider"
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the invitation code provided by your organization
                    administrator
                  </p>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining Organization...
                      </>
                    ) : (
                      <>
                        Join Organization
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground">
              By creating or joining an organization, you agree to our{" "}
              <Link href="#" className="text-emerald-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-emerald-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
