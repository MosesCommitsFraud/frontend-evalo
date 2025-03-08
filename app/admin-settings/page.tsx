"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Global Configuration
        </Button>
      </div>

      <Tabs defaultValue="system">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system" className="gap-2">
            <Network className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Building className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
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
                  onCheckedChange={() =>
                    handleSystemSettingToggle("maintenanceMode")
                  }
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
            </CardContent>
            <CardFooter>
              <Button>Save System Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
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
                <Switch />
              </div>

              {/* Default User Role */}
              <div className="grid gap-2">
                <Label>Default User Role</Label>
                <Select>
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select password complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Low (Minimum requirements)
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium (Strong requirements)
                    </SelectItem>
                    <SelectItem value="high">High (Very strict)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save User Management Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
