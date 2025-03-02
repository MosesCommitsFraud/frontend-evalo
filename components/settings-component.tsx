"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Link2, Share } from "lucide-react";
import { toast } from "@/components/ui/toast";

export function SettingsComponent({ courseId }: { courseId: string }) {
  const [settings, setSettings] = useState({
    anonymousFeedback: true,
    emailNotifications: true,
    autoAnalysis: true,
  });

  const feedbackLink = `https://evalo.app/feedback/${courseId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedbackLink);
    toast({
      title: "Link Copied",
      description: "Feedback link copied to clipboard!",
    });
  };

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Course Settings</h2>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Basic information about your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="course-name">Course Name</Label>
                <Input
                  id="course-name"
                  defaultValue="Introduction to Programming"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-code">Course Code</Label>
                <Input id="course-code" defaultValue="CS101" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-description">Course Description</Label>
                <Input
                  id="course-description"
                  defaultValue="An introduction to programming concepts and techniques"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Link</CardTitle>
              <CardDescription>
                Share this link with your students to collect feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input readOnly value={feedbackLink} />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Generate New Link
                </Button>
                <Button variant="outline">QR Code</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Settings</CardTitle>
              <CardDescription>
                Configure how feedback is collected and processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous-feedback">Anonymous Feedback</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow students to submit feedback anonymously
                  </p>
                </div>
                <Switch
                  id="anonymous-feedback"
                  checked={settings.anonymousFeedback}
                  onCheckedChange={() =>
                    handleSettingChange("anonymousFeedback")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-analysis">Automatic Analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically analyze feedback using AI
                  </p>
                </div>
                <Switch
                  id="auto-analysis"
                  checked={settings.autoAnalysis}
                  onCheckedChange={() => handleSettingChange("autoAnalysis")}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for new feedback
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() =>
                    handleSettingChange("emailNotifications")
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  defaultValue="john.smith@university.edu"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
