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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Building,
  BookOpen,
  Clock,
  BarChart3,
  FileText,
  Calendar,
  Edit,
  Upload,
  Pencil,
  GraduationCap,
  Award,
  MessageSquare,
} from "lucide-react";

export default function ProfilePage() {
  // Mock user data
  const [user, setUser] = useState({
    name: "John Smith",
    title: "Associate Professor",
    email: "john.smith@university.edu",
    phone: "+1 (555) 123-4567",
    department: "Computer Science",
    bio: "Professor of Computer Science with 10+ years of experience in teaching and research. Specializes in machine learning and data science.",
    joined: "March 2021",
    avatar: "/avatar.png",
  });

  // Profile Overview Tab Content
  const overviewTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your personal and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full bg-background shadow"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Change Picture
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
                <Label className="text-muted-foreground text-sm">Title</Label>
                <div className="font-medium">{user.title}</div>
              </div>

              <div className="grid gap-1">
                <Label className="text-muted-foreground text-sm">
                  Department
                </Label>
                <div className="font-medium">{user.department}</div>
              </div>

              <div className="grid gap-1">
                <Label className="text-muted-foreground text-sm">Email</Label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="grid gap-1">
                <Label className="text-muted-foreground text-sm">Phone</Label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-sm">Bio</Label>
            <p className="mt-1">{user.bio}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Teaching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">5</div>
            <p className="text-sm text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">432</div>
            <p className="text-sm text-muted-foreground">
              Student responses received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">3.2</div>
            <p className="text-sm text-muted-foreground">Years on platform</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and membership</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Member since</div>
            </div>
            <div>{user.joined}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Institution</div>
            </div>
            <div>State University</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Academic role</div>
            </div>
            <div>Teaching Faculty</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Account type</div>
            </div>
            <Badge>Premium</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Activity Tab Content
  const activityTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Added a new feedback session</p>
                <p className="text-sm text-muted-foreground">
                  Created feedback session for CS101: Introduction to
                  Programming
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  2 hours ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Created a new course</p>
                <p className="text-sm text-muted-foreground">
                  Added CS301: Web Development to your courses
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Yesterday at 3:45 PM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Viewed analytics dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Reviewed student feedback analytics for CS201
                </p>
                <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Scheduled an event</p>
                <p className="text-sm text-muted-foreground">
                  Added Guest Lecture to course calendar
                </p>
                <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Recent account access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Current session</div>
                <div className="text-sm text-muted-foreground">
                  Chrome on Windows
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Today, 10:34 AM
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                <div className="font-medium">Chrome on iPhone</div>
                <div className="text-sm text-muted-foreground">
                  Mobile device
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Yesterday, 8:12 PM
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                <div className="font-medium">Safari on MacBook</div>
                <div className="text-sm text-muted-foreground">
                  Desktop device
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Mar 7, 2025, 4:45 PM
              </div>
            </div>
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
          Overview
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
