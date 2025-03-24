"use client";

import React, { useState, useEffect } from "react";
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
  Key,
  Loader2,
  Building2,
} from "lucide-react";
import { dataService } from "@/lib/data-service";
import { toast } from "@/components/ui/toast";
import { Department } from "@/lib/data-service";
import InviteCodeManager from "@/components/invite-code-manager";

export default function AdminSettingsPage() {
  // State for system settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    analyticsTracking: true,
    defaultTheme: "system",
    platformLanguage: "en",
  });

  // State for departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for new department dialog
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: "",
  });

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await dataService.getDepartments();
        if (error) {
          console.error("Error fetching departments:", error);
          toast({
            title: "Error",
            description:
              "Failed to load departments. Please refresh and try again.",
          });
          return;
        }
        if (data) {
          setDepartments(data);
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while loading departments.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Handler for system settings toggle
  const handleSystemSettingToggle = (setting: keyof typeof systemSettings) => {
    setSystemSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Handler for department creation
  const handleCreateDepartment = async () => {
    if (!newDepartment.name.trim() || !newDepartment.code.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await dataService.createDepartment({
        name: newDepartment.name,
        code: newDepartment.code.toUpperCase(),
        organization_id: "your-organization-id", // Add the required organization_id
      });

      if (error) {
        console.error("Error creating department:", error);
        toast({
          title: "Error",
          description: "Failed to create department. Please try again.",
        });
        return;
      }

      if (data) {
        setDepartments((prev) => [...prev, data]);
        // Reset dialog
        setNewDepartment({ name: "", code: "" });
        toast({
          title: "Success",
          description: "Department created successfully.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while creating the department.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for department deletion
  const handleDeleteDepartment = async (id: string) => {
    try {
      const { error } = await dataService.deleteDepartment(id);
      if (error) {
        console.error("Error deleting department:", error);
        toast({
          title: "Error",
          description: "Failed to delete department. Please try again.",
        });
        return;
      }

      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      toast({
        title: "Success",
        description: "Department deleted successfully.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while deleting the department.",
      });
    }
  };

  // Organizations Tab Content
  const organizationsTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Management</CardTitle>
          <CardDescription>
            Manage your organization and invite users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteCodeManager />
        </CardContent>
      </Card>
    </div>
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
                  isSubmitting ||
                  !newDepartment.name.trim() ||
                  !newDepartment.code.trim()
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Department"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No departments found. Add your first department to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <div className="font-medium">{dept.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {dept.code}
                  </div>
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
        )}
      </CardContent>
    </Card>
  );

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

  // Security Tab Content
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

  // Integrations Tab Content
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

        {/* Other integration settings (calendar, SSO) remain unchanged */}
      </CardContent>
      <CardFooter>
        <Button>Save Integration Settings</Button>
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
          <Building2 className="h-4 w-4" />
          Organizations
        </span>
      ),
      content: organizationsTabContent,
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
