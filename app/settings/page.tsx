"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomTabs from "@/components/custom-tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Moon, Sun, Shield, Globe, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function SettingsPage() {
  const [isUpdating, setIsUpdating] = useState(false);

  // App Preferences
  const [appPreferences, setAppPreferences] = useState({
    defaultLanguage: "en",
    defaultTheme: "system",
    timezone: "UTC",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    feedbackUpdates: true,
    courseActivity: true,
    accountAlerts: true,
    emailDigestFrequency: "daily",
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showEmail: false,
    dataCollection: true,
  });

  // Current and new password for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Handle App Preferences changes
  const handleAppPreferenceChange = (
    key: keyof typeof appPreferences,
    value: string,
  ) => {
    setAppPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Toggle notification setting
  const toggleNotificationSetting = (
    setting: keyof typeof notificationSettings,
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Toggle privacy setting
  const togglePrivacySetting = (setting: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (passwordError) {
      setPasswordError("");
    }
  };

  // Submit password change
  const handlePasswordSubmit = async () => {
    // Basic validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    setIsUpdating(true);

    try {
      // This would be replaced with your actual password update logic
      // Example: await auth.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear form after successful update
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Success",
        description: "Your password has been updated successfully",
      });
    } catch (error) {
      setPasswordError(
        "Failed to update password. Please check your current password.",
      );
      console.error("Password update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Save App Preferences
  const saveAppPreferences = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Preferences Saved",
        description: "Your application preferences have been updated",
      });

      // Here you would actually save to your backend
      // Example: await userService.updatePreferences(user.id, appPreferences);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save preferences",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Save Notification Settings
  const saveNotificationSettings = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated",
      });

      // Here you would actually save to your backend
    } catch {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Save Privacy Settings
  const savePrivacySettings = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Privacy Settings Saved",
        description: "Your privacy settings have been updated",
      });

      // Here you would actually save to your backend
    } catch (error) {
      console.error("Privacy settings update error:", error);
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // App Preferences Tab Content
  const preferencesTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>Application Preferences</CardTitle>
        <CardDescription>Customize your application experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={appPreferences.defaultLanguage}
              onValueChange={(value) =>
                handleAppPreferenceChange("defaultLanguage", value)
              }
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the language for the user interface
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={appPreferences.defaultTheme}
              onValueChange={(value) =>
                handleAppPreferenceChange("defaultTheme", value)
              }
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose between light, dark, or system default theme
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="timezone">Time Zone</Label>
            <Select
              value={appPreferences.timezone}
              onValueChange={(value) =>
                handleAppPreferenceChange("timezone", value)
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">
                  UTC (Coordinated Universal Time)
                </SelectItem>
                <SelectItem value="America/New_York">
                  Eastern Time (ET)
                </SelectItem>
                <SelectItem value="America/Chicago">
                  Central Time (CT)
                </SelectItem>
                <SelectItem value="America/Denver">
                  Mountain Time (MT)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time (PT)
                </SelectItem>
                <SelectItem value="Europe/London">
                  Greenwich Mean Time (GMT)
                </SelectItem>
                <SelectItem value="Europe/Paris">
                  Central European Time (CET)
                </SelectItem>
                <SelectItem value="Asia/Tokyo">
                  Japan Standard Time (JST)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select your local time zone for accurate time displays
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveAppPreferences} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  // Notifications Tab Content
  const notificationsTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email updates for important events
            </p>
          </div>
          <Switch
            checked={notificationSettings.emailNotifications}
            onCheckedChange={() =>
              toggleNotificationSetting("emailNotifications")
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>In-App Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Show notifications within the platform
            </p>
          </div>
          <Switch
            checked={notificationSettings.inAppNotifications}
            onCheckedChange={() =>
              toggleNotificationSetting("inAppNotifications")
            }
          />
        </div>

        <div className="border-t pt-6 space-y-6">
          <h3 className="text-sm font-medium">Notification Types</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Feedback Updates</div>
              <p className="text-sm text-muted-foreground">
                When you receive new student feedback
              </p>
            </div>
            <Switch
              checked={notificationSettings.feedbackUpdates}
              onCheckedChange={() =>
                toggleNotificationSetting("feedbackUpdates")
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Course Activity</div>
              <p className="text-sm text-muted-foreground">
                Updates about your courses and events
              </p>
            </div>
            <Switch
              checked={notificationSettings.courseActivity}
              onCheckedChange={() =>
                toggleNotificationSetting("courseActivity")
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Account Alerts</div>
              <p className="text-sm text-muted-foreground">
                Security and account-related notifications
              </p>
            </div>
            <Switch
              checked={notificationSettings.accountAlerts}
              onCheckedChange={() => toggleNotificationSetting("accountAlerts")}
            />
          </div>

          <div className="grid gap-2 pt-4">
            <Label htmlFor="digest">Email Digest Frequency</Label>
            <Select
              value={notificationSettings.emailDigestFrequency}
              onValueChange={(value) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  emailDigestFrequency: value,
                }))
              }
              disabled={!notificationSettings.emailNotifications}
            >
              <SelectTrigger id="digest">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveNotificationSettings} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Notification Settings"
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  // Security Tab Content
  const securityTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          {passwordError && (
            <div className="text-sm text-red-500">{passwordError}</div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handlePasswordSubmit}
            disabled={
              isUpdating ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control your data and visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              checked={privacySettings.publicProfile}
              onCheckedChange={() => togglePrivacySetting("publicProfile")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Email Address</Label>
              <p className="text-sm text-muted-foreground">
                Display your email on your profile
              </p>
            </div>
            <Switch
              checked={privacySettings.showEmail}
              onCheckedChange={() => togglePrivacySetting("showEmail")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Collection</Label>
              <p className="text-sm text-muted-foreground">
                Allow anonymous usage data collection to improve the platform
              </p>
            </div>
            <Switch
              checked={privacySettings.dataCollection}
              onCheckedChange={() => togglePrivacySetting("dataCollection")}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={savePrivacySettings} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Privacy Settings"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Create tabs data for CustomTabs component
  const tabsData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Preferences
        </span>
      ),
      content: preferencesTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </span>
      ),
      content: notificationsTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security & Privacy
        </span>
      ),
      content: securityTabContent,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
      </div>

      {/* Use the CustomTabs component */}
      <CustomTabs tabs={tabsData} />
    </div>
  );
}
