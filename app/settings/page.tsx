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
import {
  Bell,
  Moon,
  Sun,
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  Mail,
  Globe,
  Smartphone,
} from "lucide-react";

export default function SettingsPage() {
  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    defaultLanguage: "en",
    defaultTheme: "light",
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    feedbackUpdates: true,
    courseActivity: true,
    accountAlerts: true,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showEmail: false,
    showActivity: true,
    dataCollection: true,
  });

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

  // Account Settings Tab
  const accountTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your personal account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input id="display-name" defaultValue="John Smith" />
            <p className="text-sm text-muted-foreground">
              This is how your name will appear throughout the platform.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              defaultValue="john.smith@university.edu"
            />
            <p className="text-sm text-muted-foreground">
              Your primary email for account communications and notifications.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Language</Label>
            <Select
              value={accountSettings.defaultLanguage}
              onValueChange={(value) =>
                setAccountSettings((prev) => ({
                  ...prev,
                  defaultLanguage: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Appearance</Label>
            <Select
              value={accountSettings.defaultTheme}
              onValueChange={(value) =>
                setAccountSettings((prev) => ({ ...prev, defaultTheme: value }))
              }
            >
              <SelectTrigger>
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
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Account Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input id="current-password" type="password" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input id="new-password" type="password" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input id="confirm-password" type="password" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Update Password</Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Notifications Tab
  const notificationsTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
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
                onCheckedChange={() =>
                  toggleNotificationSetting("accountAlerts")
                }
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Notification Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Channels</CardTitle>
          <CardDescription>
            Configure where you receive communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">
                john.smith@university.edu
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">SMS</div>
              <div className="text-sm text-muted-foreground">
                Not configured
              </div>
            </div>
            <Button variant="outline" size="sm">
              Setup
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Web Notifications</div>
              <div className="text-sm text-muted-foreground">
                Enabled in Chrome
              </div>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Privacy & Security Tab
  const privacyTabContent = (
    <div className="space-y-6">
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
              checked={privacySettings.showProfile}
              onCheckedChange={() => togglePrivacySetting("showProfile")}
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
              <Label>Activity Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Show your activity history to colleagues
              </p>
            </div>
            <Switch
              checked={privacySettings.showActivity}
              onCheckedChange={() => togglePrivacySetting("showActivity")}
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
          <Button>Save Privacy Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage security settings for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Two-Factor Authentication</div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline">Setup 2FA</Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Active Sessions</div>
              <p className="text-sm text-muted-foreground">
                Manage your active login sessions
              </p>
            </div>
            <Button variant="outline">Manage</Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Account Recovery</div>
              <p className="text-sm text-muted-foreground">
                Setup recovery options for your account
              </p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            These actions are permanent and cannot be undone.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm">
              Reset Data
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/10"
              size="sm"
            >
              Delete Account
            </Button>
          </div>
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
          Account
        </span>
      ),
      content: accountTabContent,
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
          Privacy & Security
        </span>
      ),
      content: privacyTabContent,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Use the CustomTabs component */}
      <CustomTabs tabs={tabsData} />
    </div>
  );
}
