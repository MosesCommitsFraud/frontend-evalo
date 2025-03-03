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
import { toast } from "@/components/ui/toast";

export function SettingsComponent({ courseId }: { courseId: string }) {
  const [settings, setSettings] = useState({
    anonymousFeedback: true,
    emailNotifications: true,
    autoAnalysis: true,
  });

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

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          {/* Course Information Card */}
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
          {/* Enrollment & Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment & Schedule</CardTitle>
              <CardDescription>
                Manage enrollment and scheduling settings for your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="max-participants">Maximum Participants</Label>
                <Input id="max-participants" type="number" defaultValue="50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="enrollment-deadline">Enrollment Deadline</Label>
                <Input
                  id="enrollment-deadline"
                  type="date"
                  defaultValue="2025-06-30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-duration">Course Duration (weeks)</Label>
                <Input id="course-duration" type="number" defaultValue="12" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Enrollment Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
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

        {/* Notifications Tab */}
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
