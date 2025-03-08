"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Edit,
  Trash2,
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  Filter,
} from "lucide-react";
import Link from "next/link";

// Mock data for teachers
const teachers = [
  {
    id: "teacher-1",
    name: "Alice Johnson",
    email: "alice.johnson@university.edu",
    phone: "+1 (555) 123-4567",
    department: "Computer Science",
    avatar: "/avatars/alice.jpg",
    courses: [
      { id: "course-1", name: "Introduction to Programming", students: 50 },
      { id: "course-3", name: "Web Development", students: 40 },
    ],
    status: "active",
    startDate: "2022-01-15",
  },
  {
    id: "teacher-2",
    name: "Bob Smith",
    email: "bob.smith@university.edu",
    phone: "+1 (555) 234-5678",
    department: "Mathematics",
    avatar: "/avatars/bob.jpg",
    courses: [
      { id: "course-2", name: "Data Structures & Algorithms", students: 35 },
    ],
    status: "active",
    startDate: "2021-09-01",
  },
  {
    id: "teacher-3",
    name: "Charlie Brown",
    email: "charlie.brown@university.edu",
    phone: "+1 (555) 345-6789",
    department: "Computer Science",
    avatar: "/avatars/charlie.jpg",
    courses: [
      { id: "course-4", name: "Machine Learning Basics", students: 30 },
      { id: "course-5", name: "Database Systems", students: 45 },
    ],
    status: "active",
    startDate: "2020-06-15",
  },
  {
    id: "teacher-4",
    name: "Diana Ross",
    email: "diana.ross@university.edu",
    phone: "+1 (555) 456-7890",
    department: "Engineering",
    avatar: "/avatars/diana.jpg",
    courses: [],
    status: "inactive",
    startDate: "2023-02-01",
  },
  {
    id: "teacher-5",
    name: "Edward Norton",
    email: "edward.norton@university.edu",
    phone: "+1 (555) 567-8901",
    department: "Physics",
    avatar: "/avatars/edward.jpg",
    courses: [{ id: "course-6", name: "Physics 101", students: 38 }],
    status: "active",
    startDate: "2022-05-10",
  },
];

// Helper types for TypeScript
interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  avatar: string;
  courses: {
    id: string;
    name: string;
    students: number;
  }[];
  status: string;
  startDate: string;
}

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique departments for filter
  const departments = [
    ...new Set(teachers.map((teacher) => teacher.department)),
  ];

  // Format date string to more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || teacher.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || teacher.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Stats calculation
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === "active").length;
  const totalCourses = teachers.reduce(
    (acc, teacher) => acc + teacher.courses.length,
    0,
  );
  const averageStudents =
    teachers.reduce(
      (acc, teacher) =>
        acc + teacher.courses.reduce((sum, course) => sum + course.students, 0),
      0,
    ) / totalCourses || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>
                Enter the details of the new teacher to add them to the
                platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@university.edu"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">
                        Computer Science
                      </SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Teacher</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              {activeTeachers} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(totalCourses / activeTeachers)} avg per teacher
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Students
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(averageStudents)}
            </div>
            <p className="text-xs text-muted-foreground">Per course</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">897</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Teacher
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Department
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Courses
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Start Date
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={teacher.avatar}
                            alt={teacher.name}
                          />
                          <AvatarFallback>
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {teacher.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{teacher.department}</td>
                    <td className="p-4 align-middle">
                      {teacher.courses.length === 0 ? (
                        <span className="text-muted-foreground text-sm">
                          No courses
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {teacher.courses.map((course) => (
                            <Link
                              key={course.id}
                              href={`/dashboard/courses/${course.id}`}
                              className="text-sm hover:underline flex items-center gap-1"
                            >
                              <BookOpen className="h-3 w-3" />
                              {course.name}
                              <span className="text-xs text-muted-foreground">
                                ({course.students} students)
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant={
                          teacher.status === "active" ? "default" : "secondary"
                        }
                      >
                        {teacher.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      {formatDate(teacher.startDate)}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <Link
                            href={`/dashboard/analytics?teacher=${teacher.id}`}
                          >
                            <span className="sr-only">View analytics</span>
                            <BarChart3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
