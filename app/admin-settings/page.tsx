"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Building,
  Users,
  Network,
  Plus,
  Trash2,
  Edit,
  Shield,
  Globe,
  Palette,
  Database,
  ScrollText,
  FileText,
  Key,
  Link as LinkIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  // State for system settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    analyticsTracking: true,
    defaultTheme: "system",
    platformLanguage: "en",
  });

  // State for departments
  const [departments, setDepartments] = useState([
    { id: "dept-1", name: "Computer Science", code: "CS" },
    { id: "dept-2", name: "Mathematics", code: "MATH" },
    { id: "dept-3", name: "Engineering", code: "ENG" },
  ]);

  // State for new department dialog
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: "",
  });

  // Handler for system settings toggle
  const handleSystemSettingToggle = (setting: keyof typeof systemSettings) => {
    setSystemSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Handler for department creation
  const handleCreateDepartment = () => {
    if (!newDepartment.name.trim() || !newDepartment.code.trim()) return;

    const newDepartmentEntry = {
      id: `dept-${departments.length + 1}`,
      name: newDepartment.name,
      code: newDepartment.code.toUpperCase(),
    };

    setDepartments((prev) => [...prev, newDepartmentEntry]);

    // Reset dialog
    setNewDepartment({ name: "", code: "" });
  };

  // Handler for department deletion
  const handleDeleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((dept) => dept.id !== id));
  };

  // System Settings Tab Content
  const systemTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>Manage core platform settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Maintenance Mode */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">
              Temporarily disable platform access for all users
            </p>
          </div>
          <Switch
            checked={systemSettings.maintenanceMode}
            onCheckedChange={() => handleSystemSettingToggle("maintenanceMode")}
          />
        </div>

        {/* Analytics Tracking */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Anonymous Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Help improve the platform by sharing usage data
            </p>
          </div>
          <Switch
            checked={systemSettings.analyticsTracking}
            onCheckedChange={() =>
              handleSystemSettingToggle("analyticsTracking")
            }
          />
        </div>

        {/* Default Theme */}
        <div className="grid gap-2">
          <Label>Default Theme</Label>
          <Select
            value={systemSettings.defaultTheme}
            onValueChange={(value) =>
              setSystemSettings((prev) => ({
                ...prev,
                defaultTheme: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select default theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System Default</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Platform Language */}
        <div className="grid gap-2">
          <Label>Platform Language</Label>
          <Select
            value={systemSettings.platformLanguage}
            onValueChange={(value) =>
              setSystemSettings((prev) => ({
                ...prev,
                platformLanguage: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select platform language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Email Configuration */}
        <div className="grid gap-2">
          <Label>SMTP Server</Label>
          <Input placeholder="smtp.example.com" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>SMTP Port</Label>
            <Input placeholder="587" type="number" />
          </div>
          <div className="grid gap-2">
            <Label>Authentication</Label>
            <Select defaultValue="tls">
              <SelectTrigger>
                <SelectValue placeholder="Select authentication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save System Settings</Button>
      </CardFooter>
    </Card>
  );

  // Departments Tab Content
  const departmentsTabContent = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Departments Management</CardTitle>
          <CardDescription>
            Add, edit, or remove academic departments
          </CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new academic department to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  value={newDepartment.name}
                  onChange={(e) =>
                    setNewDepartment((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dept-code">Department Code</Label>
                <Input
                  id="dept-code"
                  value={newDepartment.code}
                  onChange={(e) =>
                    setNewDepartment((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  placeholder="e.g., CS"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCreateDepartment}
                disabled={
                  !newDepartment.name.trim() || !newDepartment.code.trim()
                }
              >
                Create Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div>
                <div className="font-medium">{dept.name}</div>
                <div className="text-sm text-muted-foreground">{dept.code}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleDeleteDepartment(dept.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // User Management Tab Content
  const usersTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Configure user-related system settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Registration */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Open Registration</Label>
            <p className="text-sm text-muted-foreground">
              Allow new users to create accounts
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        {/* Default User Role */}
        <div className="grid gap-2">
          <Label>Default User Role</Label>
          <Select defaultValue="student">
            <SelectTrigger>
              <SelectValue placeholder="Select default role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Password Policy */}
        <div className="grid gap-2">
          <Label>Password Policy</Label>
          <Select defaultValue="medium">
            <SelectTrigger>
              <SelectValue placeholder="Select password complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Minimum requirements)</SelectItem>
              <SelectItem value="medium">
                Medium (Strong requirements)
              </SelectItem>
              <SelectItem value="high">High (Very strict)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Approvals */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Require Admin Approval</Label>
            <p className="text-sm text-muted-foreground">
              New accounts require administrator approval
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        {/* Account Lockout Settings */}
        <div className="grid gap-2">
          <Label>Account Lockout After Failed Attempts</Label>
          <Select defaultValue="5">
            <SelectTrigger>
              <SelectValue placeholder="Select number of attempts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 attempts</SelectItem>
              <SelectItem value="5">5 attempts</SelectItem>
              <SelectItem value="10">10 attempts</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save User Management Settings</Button>
      </CardFooter>
    </Card>
  );

  // Security Tab Content - NEW
  const securityTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure platform security and authentication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Require Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Require all users to set up 2FA for added security
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        {/* Session Timeout */}
        <div className="grid gap-2">
          <Label>Session Timeout</Label>
          <Select defaultValue="60">
            <SelectTrigger>
              <SelectValue placeholder="Select timeout period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="240">4 hours</SelectItem>
              <SelectItem value="480">8 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Keys */}
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label>API Key Management</Label>
            <Button variant="outline" size="sm" className="gap-2">
              <Key className="h-4 w-4" />
              Generate New Key
            </Button>
          </div>
          <div className="border rounded-md p-4">
            <div className="text-sm text-muted-foreground mb-2">
              Active API Keys
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <div>Analytics Integration</div>
                  <div className="text-xs text-muted-foreground">
                    Created: Mar 01, 2025
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7">
                  Revoke
                </Button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <div>LMS Integration</div>
                  <div className="text-xs text-muted-foreground">
                    Created: Feb 15, 2025
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7">
                  Revoke
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Login History */}
        <div className="grid gap-2">
          <Label>Login History Retention</Label>
          <Select defaultValue="90">
            <SelectTrigger>
              <SelectValue placeholder="Select retention period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Security Settings</Button>
      </CardFooter>
    </Card>
  );

  // Integrations Tab Content - NEW
  const integrationsTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>Integrations & API</CardTitle>
        <CardDescription>
          Configure third-party integrations and API settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* LMS Integration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Learning Management System (LMS)
              </Label>
              <p className="text-sm text-muted-foreground">
                Integrate with your institution&#39;s LMS
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>LMS Provider</Label>
              <Select defaultValue="canvas">
                <SelectTrigger>
                  <SelectValue placeholder="Select LMS provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="canvas">Canvas</SelectItem>
                  <SelectItem value="moodle">Moodle</SelectItem>
                  <SelectItem value="blackboard">Blackboard</SelectItem>
                  <SelectItem value="brightspace">Brightspace (D2L)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>API Key</Label>
              <Input type="password" value="••••••••••••••••" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>LMS URL</Label>
            <Input placeholder="https://your-institution.instructure.com" />
          </div>
        </div>

        {/* Calendar Integration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Calendar Integration
              </Label>
              <p className="text-sm text-muted-foreground">
                Sync course events with external calendars
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-2">
            <Label>Calendar Provider</Label>
            <Select defaultValue="google">
              <SelectTrigger>
                <SelectValue placeholder="Select calendar provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                <SelectItem value="apple">Apple Calendar</SelectItem>
                <SelectItem value="custom">Custom (iCal)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SSO Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Single Sign-On (SSO)
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow users to login with institutional credentials
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Identity Provider</Label>
              <Select defaultValue="saml">
                <SelectTrigger>
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saml">SAML 2.0</SelectItem>
                  <SelectItem value="oidc">OpenID Connect</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-background text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>SSO Metadata URL</Label>
            <Input placeholder="https://idp.your-institution.edu/metadata.xml" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Integration Settings</Button>
      </CardFooter>
    </Card>
  );

  // Branding Tab Content - NEW
  const brandingTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>Branding & Customization</CardTitle>
        <CardDescription>
          Customize the platform appearance and branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="grid gap-2">
          <Label>Institution Logo</Label>
          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 bg-muted/50">
            <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground">
              Drag and drop or click to upload
            </div>
            <Button variant="outline" size="sm">
              Upload Logo
            </Button>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="space-y-4">
          <Label>Brand Colors</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm">Primary Color</Label>
              <div className="flex gap-2">
                <div className="h-9 w-9 rounded-md bg-emerald-600 flex-shrink-0"></div>
                <Input defaultValue="#10b981" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm">Secondary Color</Label>
              <div className="flex gap-2">
                <div className="h-9 w-9 rounded-md bg-blue-500 flex-shrink-0"></div>
                <Input defaultValue="#3b82f6" />
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <div className="grid gap-2">
          <Label>Custom CSS</Label>
          <Textarea
            placeholder=":root { --primary-color: #10b981; --secondary-color: #3b82f6; }"
            className="font-mono text-sm"
            rows={5}
          />
        </div>

        {/* Domain Customization */}
        <div className="grid gap-2">
          <Label>Custom Domain</Label>
          <div className="grid grid-cols-4 gap-4">
            <Input placeholder="feedback" className="col-span-1" />
            <div className="flex items-center col-span-3">
              <span className="text-muted-foreground">
                .your-institution.edu
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Add CNAME record pointing to evalo.app before configuring custom
            domain
          </p>
        </div>

        {/* Email Templates */}
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label>Email Templates</Label>
            <Button variant="outline" size="sm">
              Edit Templates
            </Button>
          </div>
          <div className="border rounded-md divide-y">
            <div className="p-3 flex justify-between items-center">
              <div className="text-sm">Welcome Email</div>
              <div className="text-xs text-muted-foreground">Custom</div>
            </div>
            <div className="p-3 flex justify-between items-center">
              <div className="text-sm">Password Reset</div>
              <div className="text-xs text-muted-foreground">Default</div>
            </div>
            <div className="p-3 flex justify-between items-center">
              <div className="text-sm">Notification Digest</div>
              <div className="text-xs text-muted-foreground">Custom</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Branding Settings</Button>
      </CardFooter>
    </Card>
  );

  // Data Management Tab Content - NEW
  const dataTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Manage platform data, backups, and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Retention */}
        <div className="space-y-4">
          <Label>Data Retention Policy</Label>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Feedback Retention</div>
                <p className="text-xs text-muted-foreground">
                  How long to keep student feedback data
                </p>
              </div>
              <Select defaultValue="indefinite">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="2years">2 years</SelectItem>
                  <SelectItem value="5years">5 years</SelectItem>
                  <SelectItem value="indefinite">Indefinite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Analytics Data</div>
                <p className="text-xs text-muted-foreground">
                  How long to keep analytics and usage data
                </p>
              </div>
              <Select defaultValue="2years">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 months</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="2years">2 years</SelectItem>
                  <SelectItem value="5years">5 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">User Activity Logs</div>
                <p className="text-xs text-muted-foreground">
                  How long to keep user activity logs
                </p>
              </div>
              <Select defaultValue="6months">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">30 days</SelectItem>
                  <SelectItem value="3months">3 months</SelectItem>
                  <SelectItem value="6months">6 months</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Automated Backups */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automated Backups</Label>
              <p className="text-sm text-muted-foreground">
                Schedule regular backups of platform data
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Retention Period</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue placeholder="Select retention" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div className="space-y-2">
          <Label>Data Export</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              Export All Data
            </Button>
            <Button variant="outline" className="gap-2">
              <ScrollText className="h-4 w-4" />
              Export Analytics
            </Button>
          </div>
        </div>

        {/* GDPR Settings */}
        <div className="space-y-2">
          <Label>Privacy & Compliance</Label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Data Anonymization</div>
                <p className="text-xs text-muted-foreground">
                  Automatically anonymize personal data in exports and reports
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">GDPR Compliance Mode</div>
                <p className="text-xs text-muted-foreground">
                  Enable additional features required for GDPR compliance
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Data Management Settings</Button>
      </CardFooter>
    </Card>
  );

  // Create tabs data for CustomTabs component
  const tabsData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <Network className="h-4 w-4" />
          System
        </span>
      ),
      content: systemTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Departments
        </span>
      ),
      content: departmentsTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Users
        </span>
      ),
      content: usersTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </span>
      ),
      content: securityTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Integrations
        </span>
      ),
      content: integrationsTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Branding
        </span>
      ),
      content: brandingTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Data
        </span>
      ),
      content: dataTabContent,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Global Configuration
        </Button>
      </div>

      {/* Use the CustomTabs component */}
      <CustomTabs tabs={tabsData} />
    </div>
  );
}
