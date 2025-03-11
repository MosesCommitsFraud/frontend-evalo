"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomTabs from "@/components/custom-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  FileText,
  Mail,
  MessageSquare,
  Video,
  BookOpen,
  Lightbulb,
  Search,
  Clock,
  Zap,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
  Users,
  BarChart,
  ArrowRight,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ Tab Content
  const faqTabContent = (
    <div className="space-y-6">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for answers..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about using the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Getting Started */}
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base">
                How do I create my first course?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-2">To create your first course:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Navigate to the Dashboard</li>
                  <li>
                    Click the &quot;+&quot; button next to &quot;Courses&quot;
                    in the sidebar
                  </li>
                  <li>
                    Fill in the course details including name, code, and
                    description
                  </li>
                  <li>Click &quot;Create Course&quot; to finish</li>
                </ol>
                <p className="mt-4">
                  You can then customize your course by adding materials,
                  setting up feedback sessions, and inviting students.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base">
                How do students join my course?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>Students can join your course in several ways:</p>
                <ul className="list-disc pl-5 space-y-2 my-2">
                  <li>
                    <strong>Access Code:</strong> Share the 6-digit course
                    access code with your students
                  </li>
                  <li>
                    <strong>Direct Link:</strong> Send students the unique
                    course join link
                  </li>
                  <li>
                    <strong>LMS Integration:</strong> If you&apos;ve connected
                    to your LMS, students can join automatically
                  </li>
                  <li>
                    <strong>QR Code:</strong> Display the course QR code for
                    students to scan
                  </li>
                </ul>
                <p>
                  You can find all these options by clicking &quot;Share
                  Course&quot; on your course dashboard.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Feedback Collection */}
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base">
                How do I collect feedback from students?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-2">
                  There are three main ways to collect feedback:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Quick Feedback:</strong> Create a session code for
                    immediate feedback during class
                  </li>
                  <li>
                    <strong>Scheduled Feedback:</strong> Set up recurring
                    feedback sessions at specific intervals
                  </li>
                  <li>
                    <strong>Event-based Feedback:</strong> Attach feedback
                    collection to specific course events
                  </li>
                </ol>
                <p className="mt-4">
                  All feedback is collected anonymously by default, encouraging
                  honest responses from students. You can access analytics and
                  insights from the course analytics dashboard.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-base">
                Is student feedback anonymous?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  Yes, all student feedback is anonymous by default. This
                  encourages honest and unfiltered feedback. The system is
                  designed so that neither instructors nor administrators can
                  trace feedback to individual students.
                </p>
                <p className="mt-2">
                  For specific use cases, you can enable identified feedback in
                  the course settings, but this should be done with student
                  consent and is generally not recommended for most feedback
                  scenarios.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Analytics & Insights */}
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-base">
                How does the sentiment analysis work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  Our AI-powered sentiment analysis processes student feedback
                  to determine whether comments express positive, negative, or
                  neutral sentiment. The system:
                </p>
                <ul className="list-disc pl-5 space-y-2 my-2">
                  <li>Analyzes the language and context of each comment</li>
                  <li>
                    Identifies key topics and themes across multiple responses
                  </li>
                  <li>Tracks sentiment trends over time</li>
                  <li>
                    Highlights the most significant feedback that may require
                    attention
                  </li>
                </ul>
                <p>
                  This gives instructors valuable insights without having to
                  manually process large volumes of feedback.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-base">
                How can I export analytics data?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>You can export analytics data in several formats:</p>
                <ul className="list-disc pl-5 space-y-2 my-2">
                  <li>
                    <strong>CSV/Excel:</strong> For detailed data analysis in
                    spreadsheet software
                  </li>
                  <li>
                    <strong>PDF Reports:</strong> For sharing formatted reports
                    with colleagues or administration
                  </li>
                  <li>
                    <strong>API Access:</strong> For integrating with other
                    systems (available on higher-tier plans)
                  </li>
                </ul>
                <p>
                  To export data, navigate to the Analytics page for your
                  course, click the &quot;Export&quot; button in the top-right
                  corner, and select your preferred format.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Account & Settings */}
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-base">
                How do I change my notification preferences?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>To change your notification preferences:</p>
                <ol className="list-decimal pl-5 space-y-2 my-2">
                  <li>Click on your profile icon in the top-right corner</li>
                  <li>Select &quot;Settings&quot; from the dropdown menu</li>
                  <li>Click on the &quot;Notifications&quot; tab</li>
                  <li>
                    Customize which notifications you want to receive and how
                    (email, in-app, etc.)
                  </li>
                  <li>Save your changes</li>
                </ol>
                <p>
                  You can set different notification preferences for different
                  courses if needed.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-base">
                How do I integrate with my institution&apos;s LMS?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>
                  We support integration with major LMS platforms including
                  Canvas, Blackboard, Moodle, and D2L Brightspace. To set up an
                  integration:
                </p>
                <ol className="list-decimal pl-5 space-y-2 my-2">
                  <li>Go to Admin Settings → Integrations</li>
                  <li>Select your LMS provider</li>
                  <li>
                    Enter your API credentials (usually available from your LMS
                    administrator)
                  </li>
                  <li>Configure the synchronization options</li>
                  <li>Test the connection</li>
                </ol>
                <p>
                  Once connected, you can import courses, sync enrollments, and
                  even push feedback results back to your LMS.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Topics</CardTitle>
          <CardDescription>
            Quick answers to the most common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="#" className="group block">
              <div className="border rounded-lg p-4 h-full transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 h-8 w-8 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">Getting Started</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quick guide to setting up your account and first course
                </p>
              </div>
            </Link>

            <Link href="#" className="group block">
              <div className="border rounded-lg p-4 h-full transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 h-8 w-8 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">Student Engagement</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Techniques to increase student participation and feedback
                </p>
              </div>
            </Link>

            <Link href="#" className="group block">
              <div className="border rounded-lg p-4 h-full transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 h-8 w-8 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Bell className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Managing notification preferences and delivery methods
                </p>
              </div>
            </Link>

            <Link href="#" className="group block">
              <div className="border rounded-lg p-4 h-full transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 h-8 w-8 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BarChart className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">Analytics</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Understanding the analytics dashboard and reports
                </p>
              </div>
            </Link>

            <Link href="#" className="group block">
              <div className="border rounded-lg p-4 h-full transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 h-8 w-8 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <User className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">Account Settings</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Managing your profile, security, and preferences
                </p>
              </div>
            </Link>

            <Link href="#" className="group block">
              <div className="border rounded-lg p-4 h-full transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 h-8 w-8 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">User Roles</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Understanding different user permissions and capabilities
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full gap-1">
            View All Help Topics
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Guides Tab Content
  const guidesTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guides</CardTitle>
          <CardDescription>
            Step-by-step guides to get you started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex border-b pb-4">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Setting Up Your First Course</h3>
                  <Badge variant="outline">Beginner</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Learn how to create and configure your first course on the
                  platform.
                </p>
                <Button variant="link" className="h-7 px-0 text-emerald-600">
                  Read Guide
                </Button>
              </div>
            </div>

            <div className="flex border-b pb-4">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Creating Effective Feedback Sessions
                  </h3>
                  <Badge variant="outline">Intermediate</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Best practices for designing feedback sessions that yield
                  valuable insights.
                </p>
                <Button variant="link" className="h-7 px-0 text-emerald-600">
                  Read Guide
                </Button>
              </div>
            </div>

            <div className="flex border-b pb-4">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Understanding Analytics & Insights
                  </h3>
                  <Badge variant="outline">Intermediate</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  How to interpret and act on the analytics data for your
                  courses.
                </p>
                <Button variant="link" className="h-7 px-0 text-emerald-600">
                  Read Guide
                </Button>
              </div>
            </div>

            <div className="flex">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Advanced LMS Integration</h3>
                  <Badge variant="outline">Advanced</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detailed steps for integrating the platform with your
                  institution&apos;s LMS.
                </p>
                <Button variant="link" className="h-7 px-0 text-emerald-600">
                  Read Guide
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video Tutorials</CardTitle>
          <CardDescription>
            Watch and learn with our step-by-step video guides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground" />
                <Button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  Watch Video
                </Button>
              </div>
              <div className="p-3">
                <h3 className="font-medium">Getting Started with Evalo</h3>
                <p className="text-sm text-muted-foreground mt-1">4:32</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground" />
                <Button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  Watch Video
                </Button>
              </div>
              <div className="p-3">
                <h3 className="font-medium">Creating Feedback Sessions</h3>
                <p className="text-sm text-muted-foreground mt-1">6:15</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground" />
                <Button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  Watch Video
                </Button>
              </div>
              <div className="p-3">
                <h3 className="font-medium">Analyzing Student Sentiment</h3>
                <p className="text-sm text-muted-foreground mt-1">8:22</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground" />
                <Button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  Watch Video
                </Button>
              </div>
              <div className="p-3">
                <h3 className="font-medium">Admin Settings & Configuration</h3>
                <p className="text-sm text-muted-foreground mt-1">10:47</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View Full Tutorial Library
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Contact Support Tab Content
  const contactTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Get help from our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="support-topic">Topic</Label>
              <Select defaultValue="question">
                <SelectTrigger id="support-topic">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">General Question</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing & Account</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                placeholder="Please provide details about your question or issue"
                rows={5}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="support-priority">Priority</Label>
              <Select defaultValue="normal">
                <SelectTrigger id="support-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General question</SelectItem>
                  <SelectItem value="normal">
                    Normal - Need help soon
                  </SelectItem>
                  <SelectItem value="high">High - Affecting my work</SelectItem>
                  <SelectItem value="urgent">
                    Urgent - System unusable
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Submit Support Request</Button>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-600" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Email our support team directly for assistance with your account
              or technical issues.
            </p>
            <Button variant="outline" className="w-full">
              support@evalo.app
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Chat directly with our support team during business hours for
              immediate assistance.
            </p>
            <Button className="w-full">Start Live Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access our comprehensive documentation and developer resources.
            </p>
            <Button variant="outline" className="w-full">
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Troubleshooting Tab Content
  const troubleshootingTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
          <CardDescription>Quick fixes for frequent problems</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="issue-1">
              <AccordionTrigger className="text-base">
                I can&apos;t login to my account
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  If you&apos;re having trouble logging in, try these steps:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Verify you&apos;re using the correct email address</li>
                  <li>
                    Use the &quot;Forgot Password&quot; link to reset your
                    password
                  </li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try using a different browser</li>
                  <li>
                    Check if your account has been locked due to too many failed
                    attempts
                  </li>
                </ol>
                <p className="mt-2">
                  If you still can&apos;t login, contact support with details
                  about the issue.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issue-2">
              <AccordionTrigger className="text-base">
                Students can&apos;t join my course
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>If students are having trouble joining your course:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Verify the course access code is correct and hasn&apos;t
                    expired
                  </li>
                  <li>
                    Check if you&apos;ve reached your student enrollment limit
                  </li>
                  <li>
                    Ensure the course is marked as &quot;Active&quot; in
                    settings
                  </li>
                  <li>Try generating a new access code or link</li>
                  <li>
                    Check if your institution has any network restrictions
                  </li>
                </ol>
                <p className="mt-2">
                  For LMS integrations, verify that the course is properly
                  linked in your LMS.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issue-3">
              <AccordionTrigger className="text-base">
                Analytics data isn&apos;t loading
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>If your analytics data isn&apos;t loading correctly:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Refresh the page and try again</li>
                  <li>
                    Check if you have sufficient feedback data to display
                    analytics
                  </li>
                  <li>Verify your internet connection is stable</li>
                  <li>Try a different browser</li>
                  <li>Clear your browser cache</li>
                </ol>
                <p className="mt-2">
                  Large datasets may take longer to process. If the issue
                  persists, contact support.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issue-4">
              <AccordionTrigger className="text-base">
                I&apos;m not receiving email notifications
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>If you&apos;re not receiving email notifications:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Check your spam/junk folder</li>
                  <li>
                    Verify your email address is correct in your profile
                    settings
                  </li>
                  <li>
                    Ensure notifications are enabled in your account preferences
                  </li>
                  <li>
                    Add support@evalo.app to your email contacts/safe senders
                    list
                  </li>
                  <li>
                    Check if your institution&apos;s email system has any
                    filtering rules
                  </li>
                </ol>
                <p className="mt-2">
                  You can also switch to in-app notifications only in your
                  notification preferences.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issue-5">
              <AccordionTrigger className="text-base">
                LMS integration issues
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>For problems with LMS integration:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Verify your API key and credentials are correct</li>
                  <li>Check if your LMS admin has enabled API access</li>
                  <li>Ensure you have the correct permissions in your LMS</li>
                  <li>Confirm your LMS version is compatible</li>
                  <li>Try disconnecting and reconnecting the integration</li>
                </ol>
                <p className="mt-2">
                  For specific LMS integration issues, please contact support
                  with details about your LMS type and version.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current platform operational status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Core Platform</div>
                  <div className="text-sm text-muted-foreground">
                    All systems operational
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                Operational
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Analytics Engine</div>
                  <div className="text-sm text-muted-foreground">
                    All systems operational
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                Operational
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium">API Services</div>
                  <div className="text-sm text-muted-foreground">
                    Experiencing delays
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
              >
                Partial Outage
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Notification System</div>
                  <div className="text-sm text-muted-foreground">
                    All systems operational
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                Operational
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View System Status Page
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Tools</CardTitle>
          <CardDescription>Run diagnostics to identify issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                <div className="font-medium">Network Connectivity Test</div>
              </div>
              <Button variant="outline" size="sm">
                Run Test
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                <div className="font-medium">Browser Compatibility Check</div>
              </div>
              <Button variant="outline" size="sm">
                Run Test
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                <div className="font-medium">Integration Connectivity</div>
              </div>
              <Button variant="outline" size="sm">
                Run Test
              </Button>
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
          <HelpCircle className="h-4 w-4" />
          FAQ
        </span>
      ),
      content: faqTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Guides
        </span>
      ),
      content: guidesTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Contact
        </span>
      ),
      content: contactTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Troubleshooting
        </span>
      ),
      content: troubleshootingTabContent,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
      </div>

      {/* Support header card */}
      <Card className="bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/30 dark:to-transparent border">
        <CardContent className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">
                How can we help you?
              </h2>
              <p className="text-muted-foreground">
                Find answers, guides, and get support from our team. Browse our
                documentation or submit a support request.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border shadow-sm">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 h-12 w-12 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">Documentation</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Browse our guides and tutorials
                  </p>
                  <Button
                    variant="link"
                    className="h-7 px-0 text-emerald-600 text-xs"
                  >
                    Read Docs
                  </Button>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 h-12 w-12 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">Contact Support</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Get help from our support team
                  </p>
                  <Button
                    variant="link"
                    className="h-7 px-0 text-emerald-600 text-xs"
                  >
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use the CustomTabs component */}
      <CustomTabs tabs={tabsData} />
    </div>
  );
}
