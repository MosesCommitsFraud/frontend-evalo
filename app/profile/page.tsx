"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomTabs from "@/components/custom-tabs";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Building,
  Clock,
  Edit,
  Upload,
  Pencil,
  Check,
  Loader2,
  AlertTriangle,
  Book,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { dataService, Department } from "@/lib/data-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Avatar Display Component
const AvatarDisplay = ({
  avatarUrl,
  isUploading,
  handleUploadClick,
}: {
  avatarUrl: string;
  isUploading: boolean;
  handleUploadClick: () => void;
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state whenever the URL changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30">
          {avatarUrl && !imageError ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={() => {
                console.error("Failed to load image:", avatarUrl);
                setImageError(true);
              }}
            />
          ) : (
            <User className="h-16 w-16 text-muted-foreground" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full bg-background shadow"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-4"
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Change Picture
          </>
        )}
      </Button>

      {imageError && avatarUrl && (
        <div className="text-xs text-red-500 mt-1 max-w-[200px] text-center">
          Unable to load image. The URL may be invalid or inaccessible.
        </div>
      )}
    </div>
  );
};

// Avatar Debugger Component
const AvatarDebugger = ({ avatarUrl }: { avatarUrl: string }) => {
  const [showDebugger, setShowDebugger] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    headers?: Record<string, string>;
    contentType?: string;
    contentLength?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAvatarUrl = async () => {
    if (!avatarUrl) {
      setTestResult({
        success: false,
        message: "No avatar URL provided to test",
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      console.log("Testing URL:", avatarUrl);

      // Try to fetch the image URL
      const response = await fetch(avatarUrl, {
        method: "HEAD",
        // Add cache-busting to avoid getting cached results
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });

      // Get headers to analyze
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      if (response.ok) {
        setTestResult({
          success: true,
          message: `URL is accessible (HTTP ${response.status})`,
          headers,
          contentType: headers["content-type"] || "Unknown",
          contentLength: headers["content-length"] || "Unknown",
        });
      } else {
        setTestResult({
          success: false,
          message: `URL returned error: HTTP ${response.status} ${response.statusText}`,
          headers,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error accessing URL: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDebugger(!showDebugger)}
        className="text-xs text-muted-foreground"
      >
        {showDebugger ? "Hide" : "Debug"} Avatar URL
      </Button>

      {showDebugger && (
        <div className="mt-2 p-3 border rounded-md text-xs">
          <div className="font-mono break-all overflow-hidden">
            <span className="font-semibold">Current URL:</span>{" "}
            {avatarUrl || "No URL set"}
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={testAvatarUrl}
              disabled={isLoading || !avatarUrl}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              Test URL
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(avatarUrl, "_blank")}
              disabled={!avatarUrl}
            >
              Open in New Tab
            </Button>
          </div>

          {testResult && (
            <div
              className={`mt-2 p-2 rounded text-xs ${testResult.success ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}
            >
              <div className="font-semibold">{testResult.message}</div>

              {testResult.contentType && (
                <div className="mt-1">
                  <span className="font-semibold">Content Type:</span>{" "}
                  {testResult.contentType}
                </div>
              )}

              {testResult.contentLength && (
                <div>
                  <span className="font-semibold">Size:</span>{" "}
                  {testResult.contentLength} bytes
                </div>
              )}

              {testResult.headers && (
                <details className="mt-1">
                  <summary className="cursor-pointer">Response Headers</summary>
                  <div className="mt-1 pl-2 border-l">
                    {Object.entries(testResult.headers).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-semibold">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ProfilePage() {
  // Get authentication info
  const { user: authUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data state
  const [user, setUser] = useState({
    name: "",
    email: "",
    department: "",
    joined: "",
    role: "",
    bio: "",
    avatar_url: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    department: "none", // Use "none" instead of "" for the select component
    role: "teacher",
    bio: "",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Departments state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Activity state
  interface Activity {
    id: string;
    type: "course" | "event" | "feedback" | "profile";
    title: string;
    description: string;
    date: string;
    icon: React.ReactNode;
  }

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 7;

  // Storage Debugging functions
  const debugSupabaseStorage = async () => {
    try {
      console.log("============ SUPABASE STORAGE DEBUG ============");
      console.log("1. Checking authentication status...");
      const supabase = createClient();

      const { data: authData } = await supabase.auth.getUser();
      console.log(
        "Authentication status:",
        authData?.user ? "Authenticated" : "Not authenticated",
      );
      if (authData?.user) {
        console.log("User ID:", authData.user.id);
      } else {
        console.error(
          "ERROR: User not authenticated. Storage operations require authentication.",
        );
        return;
      }

      console.log("\n2. Checking Supabase URL and key configuration...");
      // Don't log the actual key, just check if it exists
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      console.log("Supabase URL configured:", !!supabaseUrl);
      console.log("Supabase ANON key configured:", hasKey);

      if (!supabaseUrl || !hasKey) {
        console.error(
          "ERROR: Supabase configuration missing. Check your environment variables.",
        );
        return;
      }

      console.log("\n3. Attempting to list ALL buckets...");
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
          console.error("ERROR listing buckets:", error);
          console.log(
            "This suggests a permissions issue with your Supabase anon key or project settings.",
          );

          // Try to get more specific error info
          if (error.message.includes("permission")) {
            console.log(
              "This appears to be a permissions issue. Check that storage is enabled in your project.",
            );
          } else if (error.message.includes("network")) {
            console.log(
              "This appears to be a network issue. Check your connection and CORS settings.",
            );
          }
        } else {
          console.log("SUCCESS: Retrieved", buckets?.length || 0, "buckets");
          console.log(
            "Bucket names:",
            buckets?.map((b) => b.name),
          );

          // Check for avatars bucket with different casing
          const avatarsBucketVariants = buckets?.filter(
            (b) =>
              b.name.toLowerCase() === "avatars" ||
              b.name.toLowerCase() === "avatar",
          );

          if (avatarsBucketVariants && avatarsBucketVariants.length > 0) {
            console.log(
              "Found potential avatars buckets:",
              avatarsBucketVariants,
            );

            // Try each variant
            for (const bucket of avatarsBucketVariants) {
              console.log(`\n4. Testing access to bucket: "${bucket.name}"`);
              try {
                const { data: files, error: listError } = await supabase.storage
                  .from(bucket.name)
                  .list();

                if (listError) {
                  console.error(
                    `ERROR listing files in "${bucket.name}":`,
                    listError,
                  );
                } else {
                  console.log(
                    `SUCCESS: Listed ${files?.length || 0} files in "${bucket.name}"`,
                  );
                }

                // Try a dummy upload to test permissions
                const testBlob = new Blob(["test"], { type: "text/plain" });
                const testFile = new File([testBlob], "test.txt", {
                  type: "text/plain",
                });

                console.log(`Attempting test upload to "${bucket.name}"...`);
                const { data: uploadData, error: uploadError } =
                  await supabase.storage
                    .from(bucket.name)
                    .upload(`test-${Date.now()}.txt`, testFile, {
                      upsert: true,
                      cacheControl: "0",
                    });

                if (uploadError) {
                  console.error(
                    `ERROR uploading to "${bucket.name}":`,
                    uploadError,
                  );

                  // Check for specific error types
                  if (uploadError.message.includes("permission")) {
                    console.log(
                      "This is a permissions issue. You need an INSERT policy for this bucket.",
                    );
                  } else if (uploadError.message.includes("not found")) {
                    console.log(
                      "Bucket found in list but not accessible for upload. This is unusual.",
                    );
                  }
                } else {
                  console.log(
                    `SUCCESS: Test upload to "${bucket.name}" worked!`,
                  );
                  console.log("Upload data:", uploadData);

                  // Try to get URL
                  const { data: urlData } = supabase.storage
                    .from(bucket.name)
                    .getPublicUrl(uploadData?.path || "test.txt");

                  console.log("Generated public URL:", urlData?.publicUrl);

                  // Test URL accessibility
                  try {
                    const response = await fetch(urlData?.publicUrl, {
                      method: "HEAD",
                    });
                    console.log("URL is accessible:", response.ok);
                  } catch (fetchError) {
                    console.error("Error accessing the URL:", fetchError);
                  }
                }
              } catch (bucketError) {
                console.error(
                  `Exception testing bucket "${bucket.name}":`,
                  bucketError,
                );
              }
            }
          } else {
            console.error("No bucket with name 'avatars' or 'avatar' found.");
            console.log(
              "Available buckets:",
              buckets?.map((b) => b.name),
            );

            // If no avatars bucket, check if we can create one
            console.log("\nAttempting to create 'avatars' bucket...");
            try {
              const { data: createData, error: createError } =
                await supabase.storage.createBucket("avatars", {
                  public: true,
                });

              if (createError) {
                console.error("ERROR creating 'avatars' bucket:", createError);
                if (createError.message.includes("permission")) {
                  console.log(
                    "You don't have permission to create buckets. This requires admin access.",
                  );
                }
              } else {
                console.log("SUCCESS: Created 'avatars' bucket:", createData);
              }
            } catch (createError) {
              console.error("Exception creating bucket:", createError);
            }
          }
        }
      } catch (listError) {
        console.error("Exception listing buckets:", listError);
      }

      console.log("\n5. Final diagnosis:");
      console.log(
        "- If test uploads succeeded: Your avatar upload should work; the issue might be elsewhere in your code.",
      );
      console.log(
        "- If buckets couldn't be listed: Check your Storage permissions in Supabase project settings.",
      );
      console.log(
        "- If bucket was found but uploads failed: Check your RLS policies for INSERT permissions.",
      );
      console.log(
        "- If no avatars bucket was found: Create one in the Supabase dashboard.",
      );
      console.log("=================================================");
    } catch (e) {
      console.error("Exception in storage debug:", e);
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser) {
        setIsLoading(true);
        try {
          const { data, error } = await dataService.getProfile();

          if (error) {
            console.error("Error fetching profile:", error);
            toast({
              title: "Error",
              description: "Failed to load profile. Please refresh the page.",
            });
            return;
          }

          if (data) {
            console.log("Profile data:", data);
            // Map database fields to UI fields
            setUser({
              name: data.full_name || "Not set",
              email: data.email || authUser.email || "Not set",
              department: data.department || "", // Keep empty string here for display logic
              joined: data.created_at
                ? new Date(data.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Not available",
              role: data.role || "teacher",
              bio: data.bio || "",
              avatar_url: data.avatar_url || "",
            });

            // Initialize edit form with "none" instead of empty string for department
            setEditForm({
              full_name: data.full_name || "",
              department: data.department || "none", // Use "none" instead of empty string
              role: data.role || "teacher",
              bio: data.bio || "",
            });
          }
        } catch (error) {
          console.error("Error:", error);
          toast({
            title: "Error",
            description:
              "An unexpected error occurred while loading your profile.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [authUser]);

  // Check Supabase buckets on mount
  useEffect(() => {
    const checkBuckets = async () => {
      try {
        console.log("Checking Supabase buckets...");
        const supabase = createClient();

        // Check if we can access the storage API
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
          console.error("Error accessing Supabase storage:", error);
          toast({
            title: "Storage Access Error",
            description:
              "Unable to access storage. This might affect avatar uploads.",
          });
          return;
        }

        console.log(
          "Available buckets:",
          buckets?.map((b) => ({ name: b.name, id: b.id })),
        );

        // Check specifically for the avatars bucket
        const avatarsBucket = buckets?.find(
          (b) =>
            b.name.toLowerCase() === "avatars" ||
            b.name.toLowerCase() === "avatar",
        );

        if (!avatarsBucket) {
          console.warn("Warning: 'avatars' bucket not found in Supabase");
          toast({
            title: "Storage Configuration Warning",
            description:
              "The avatars storage bucket was not found. Avatar uploads may not work.",
          });
        } else {
          console.log("Found avatars bucket:", avatarsBucket);

          // Optional: Test bucket access by trying to list files
          const { data: files, error: listError } = await supabase.storage
            .from(avatarsBucket.name)
            .list();

          if (listError) {
            console.error("Error listing files in avatars bucket:", listError);
            toast({
              title: "Storage Access Warning",
              description:
                "Found avatars bucket but can't list files. Check bucket permissions.",
            });
          } else {
            console.log(
              `Successfully accessed avatars bucket. Contains ${files?.length || 0} files.`,
            );
          }
        }
      } catch (e) {
        console.error("Exception checking buckets:", e);
      }
    };

    // Only run this check if we're authenticated
    if (authUser) {
      checkBuckets();
    }
  }, [authUser]); // Run when authUser changes (i.e., after login)

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const { data, error } = await dataService.getDepartments();
        if (error) {
          console.error("Error fetching departments:", error);
          toast({
            title: "Warning",
            description:
              "Failed to load departments. You may not be able to select a department.",
          });
          return;
        }
        if (data) {
          console.log("Departments loaded:", data);
          setDepartments(data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Function to format dates as relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  // Function to fetch activities
  const fetchActivities = async () => {
    if (!authUser) return;

    setLoadingActivities(true);

    try {
      const supabase = createClient();

      // Fetch user's courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*")
        .eq("owner_id", authUser.id)
        .order("created_at", { ascending: false });

      const courses = coursesData || [];
      const allActivities = [];

      // Add course creation activities
      courses.forEach((course) => {
        allActivities.push({
          id: `course-${course.id}`,
          type: "course",
          title: "Created course",
          description: `${course.name} (${course.code})`,
          date: course.created_at,
          icon: <Book className="h-4 w-4" />,
        });
      });

      // Fetch all events for user's courses
      if (courses.length > 0) {
        const courseIds = courses.map((c) => c.id);

        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .in("course_id", courseIds)
          .order("created_at", { ascending: false });

        const events = eventsData || [];

        // Add event creation activities
        events.forEach((event) => {
          const relatedCourse = courses.find((c) => c.id === event.course_id);
          allActivities.push({
            id: `event-${event.id}`,
            type: "event",
            title: "Created feedback session",
            description: relatedCourse
              ? `For ${relatedCourse.name} (${relatedCourse.code})`
              : "For a course",
            date: event.created_at,
            icon: <Calendar className="h-4 w-4" />,
          });
        });

        // Fetch feedback for all events
        if (events.length > 0) {
          const eventIds = events.map((e) => e.id);

          const { data: feedbackData } = await supabase
            .from("feedback")
            .select("*")
            .in("event_id", eventIds)
            .order("created_at", { ascending: false });

          const feedback = feedbackData || [];

          // Add feedback activities
          feedback.forEach((item) => {
            const relatedEvent = events.find((e) => e.id === item.event_id);
            const relatedCourse = relatedEvent
              ? courses.find((c) => c.id === relatedEvent.course_id)
              : null;

            allActivities.push({
              id: `feedback-${item.id}`,
              type: "feedback",
              title: "Received feedback",
              description: relatedCourse
                ? `${capitalize(item.tone)} feedback for ${relatedCourse.name}`
                : `${capitalize(item.tone)} feedback`,
              date: item.created_at,
              icon: <MessageSquare className="h-4 w-4" />,
            });
          });
        }
      }

      // Add profile update activity if applicable
      const { data: profileData } = await supabase
        .from("profiles")
        .select("created_at, updated_at")
        .eq("id", authUser.id)
        .single();

      if (
        profileData &&
        new Date(profileData.updated_at).getTime() >
          new Date(profileData.created_at).getTime()
      ) {
        allActivities.push({
          id: `profile-${Date.now()}`,
          type: "profile",
          title: "Updated profile",
          description: "You updated your profile information",
          date: profileData.updated_at,
          icon: <User className="h-4 w-4" />,
        });
      }

      // Sort by date (newest first)
      allActivities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setActivities(allActivities as Activity[]);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Helper function to capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Fetch activities when tab changes
  useEffect(() => {
    // We'll fetch activities when the component mounts to ensure they're ready
    // when user switches to the Activity tab
    if (authUser) {
      fetchActivities();
    }
  }, [authUser]);

  // Handle opening the edit dialog
  const handleEdit = () => {
    setIsEditing(true);
    setSaveSuccess(false);
    setSaveError("");
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();

    // Create a folder structure with user ID to organize the files
    // But use a fixed filename to ensure we overwrite previous avatars
    const userId = authUser?.id || "unknown";
    const folderPath = `users/${userId}/`;
    const fileName = `avatar.${fileExt}`; // Fixed filename - will overwrite existing avatar
    const filePath = folderPath + fileName;

    setIsUploading(true);
    console.log("Starting avatar upload...");
    console.log("File:", file.name, "Size:", file.size);
    console.log("Upload path:", filePath);

    try {
      // Upload file to Supabase Storage - skip bucket checks, just try to upload directly
      const supabase = createClient();

      console.log("Uploading to storage...");
      const { data, error } = await supabase.storage
        .from("avatars") // Use the bucket name directly
        .upload(filePath, file, {
          upsert: true, // This ensures it overwrites any existing file at the same path
          cacheControl: "3600", // 1 hour cache, adjust as needed
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      console.log("Upload successful:", data);

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      console.log("Public URL data:", urlData);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to get public URL for the uploaded file");
      }

      // Add a timestamp query parameter to force image refresh in the UI
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      console.log("Final public URL with cache busting:", publicUrl);

      // Update profile with new avatar URL
      console.log("Updating profile with new avatar URL");
      const { error: updateError } = await dataService.updateProfile({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      // Update local state - force a re-render by creating a new object
      setUser((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      console.log("Avatar upload complete!");
      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: `Failed to upload profile picture: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle saving profile updates
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    console.log("Saving profile with data:", editForm);

    try {
      // Use the directly updated Supabase client for better error information
      const supabase = createClient();

      // Convert "none" department to empty string for storage
      const updateData = {
        full_name: editForm.full_name,
        department: editForm.department === "none" ? "" : editForm.department,
        role: editForm.role as "teacher" | "dean",
        bio: editForm.bio,
        updated_at: new Date().toISOString(),
      };

      console.log("Sending update data:", updateData);

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", authUser?.id || "")
        .select();

      if (error) {
        console.error("Error updating profile:", error);
        setSaveError(`Failed to update profile: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
        });
        return;
      }

      console.log("Profile updated successfully:", data);

      // Update local state
      setUser((prev) => ({
        ...prev,
        name: editForm.full_name,
        department: updateData.department, // Use the converted value
        role: editForm.role,
        bio: editForm.bio,
      }));

      setSaveSuccess(true);
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });

      // Close dialog after a brief delay to show success message
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Exception updating profile:", error);
      setSaveError(
        `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while updating your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get department name by code
  const getDepartmentName = (code: string) => {
    if (!code) return "Not set";

    const department = departments.find((dept) => dept.code === code);
    return department ? department.name : code;
  };

  // Functions to handle pagination
  const goToNextPage = () => {
    if (currentPage < Math.ceil(activities.length / activitiesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate pagination indexes
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = activities.slice(
    indexOfFirstActivity,
    indexOfLastActivity,
  );
  const totalPages = Math.ceil(activities.length / activitiesPerPage);

  // Profile Overview Tab Content
  const overviewTabContent = (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="ml-2">Loading profile...</span>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your personal and account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar section */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <AvatarDisplay
                    avatarUrl={user.avatar_url}
                    isUploading={isUploading}
                    handleUploadClick={handleUploadClick}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                  <AvatarDebugger avatarUrl={user.avatar_url} />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid gap-1">
                    <Label className="text-muted-foreground text-sm">
                      Full Name
                    </Label>
                    <div className="font-medium">{user.name}</div>
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-muted-foreground text-sm">
                      Role
                    </Label>
                    <div className="font-medium">
                      {user.role === "dean" ? "Dean" : "Teacher"}
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-muted-foreground text-sm">
                      Department
                    </Label>
                    <div className="font-medium">
                      {user.department
                        ? getDepartmentName(user.department)
                        : "Not set"}
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-muted-foreground text-sm">
                      Email
                    </Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio section */}
              {user.bio && (
                <div>
                  <Label className="text-muted-foreground text-sm">Bio</Label>
                  <p className="mt-1">{user.bio}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="gap-2" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={debugSupabaseStorage}
              >
                Storage Debug
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Member since
                  </div>
                </div>
                <div>{user.joined}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Role</div>
                </div>
                <div>{user.role === "dean" ? "Dean" : "Teacher"}</div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>

          {saveError && (
            <div className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md flex gap-2 items-start mt-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{saveError}</p>
            </div>
          )}

          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={editForm.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              {loadingDepartments ? (
                <div className="flex items-center h-10 px-3 rounded-md border">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-muted-foreground">
                    Loading departments...
                  </span>
                </div>
              ) : departments.length > 0 ? (
                <Select
                  value={editForm.department || "none"} // Use "none" instead of empty string
                  onValueChange={(value) => {
                    console.log("Selected department:", value);
                    setEditForm((prev) => ({
                      ...prev,
                      department: value, // We'll convert "none" to "" at save time
                    }));
                  }}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None Selected</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.code}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    id="department"
                    name="department"
                    value={
                      editForm.department === "none" ? "" : editForm.department
                    }
                    onChange={handleChange}
                    placeholder="Enter department"
                  />
                  <p className="text-xs text-muted-foreground">
                    No departments configured. Contact an administrator to add
                    departments.
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={editForm.bio || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="dean">Dean</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {saveSuccess ? (
              <div className="flex items-center text-emerald-600">
                <Check className="mr-2 h-4 w-4" />
                Profile updated successfully!
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Account Activity Tab Content - With real data and pagination
  const activityTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>
            Your recent activities and interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-2">Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No recent activity</h3>
              <p className="text-muted-foreground max-w-md">
                When you create courses, feedback sessions, or receive feedback,
                your activity will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div
                      className={cn(
                        "rounded-full p-2 mt-0.5",
                        activity.type === "course" &&
                          "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                        activity.type === "event" &&
                          "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                        activity.type === "feedback" &&
                          "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                        activity.type === "profile" &&
                          "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                      )}
                    >
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.date)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {activities.length > activitiesPerPage && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstActivity + 1}-
                    {Math.min(indexOfLastActivity, activities.length)} of{" "}
                    {activities.length} activities
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    <div className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={
                        currentPage === totalPages || activities.length === 0
                      }
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Create tabs data for CustomTabs component
  const tabsData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </span>
      ),
      content: overviewTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Activity
        </span>
      ),
      content: activityTabContent,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      </div>

      {/* Use the CustomTabs component */}
      <CustomTabs tabs={tabsData} />
    </div>
  );
}
