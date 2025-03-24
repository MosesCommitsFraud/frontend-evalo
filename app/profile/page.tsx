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
import { Badge } from "@/components/ui/badge";
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
    // Generate a unique filename to avoid caching issues
    const fileName = `${Date.now()}_${authUser?.id}.${fileExt}`;
    const filePath = fileName; // Simplified path - no folders

    setIsUploading(true);
    console.log("Starting avatar upload...");
    console.log("File:", file.name, "Size:", file.size);

    try {
      // Upload file to Supabase Storage
      const supabase = createClient();
      console.log("Uploading to avatars bucket, path:", filePath);

      // First check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log("Available buckets:", buckets);

      const bucketExists = buckets?.some((bucket) => bucket.name === "avatars");
      if (!bucketExists) {
        console.error("Avatars bucket doesn't exist!");
        toast({
          title: "Error",
          description: "Storage bucket not found. Please contact support.",
        });
        setIsUploading(false);
        return;
      }

      // Upload the file
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "0", // Disable caching
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

      console.log("Public URL:", urlData.publicUrl);

      // Make sure the URL is using HTTPS (sometimes needed for security)
      const publicUrl = urlData.publicUrl.replace("http:", "https:");

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

      // Update local state
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
        description: "Failed to upload profile picture. Please try again.",
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
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Profile"
                          className="h-full w-full object-cover"
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
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
            <CardFooter>
              <Button variant="outline" className="gap-2" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                Edit Profile
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

  // Account Activity Tab Content
  const activityTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>
            This is a placeholder for account activity. In a real application,
            this would show actual user activity from your database.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Badge variant="outline">Demo Information</Badge>
          <p className="mt-4 text-center text-muted-foreground">
            Activity tracking features would be implemented based on your
            specific requirements.
          </p>
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
