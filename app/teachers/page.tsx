"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  MessageSquare,
  Filter,
  Loader2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

// Type definitions
interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  avatar_url?: string;
  role: "teacher" | "dean";
  created_at: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  student_count?: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function TeachersPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // States for assigning courses
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [assignCourseDialogOpen, setAssignCourseDialogOpen] = useState(false);
  const [selectedCourseToAssign, setSelectedCourseToAssign] =
    useState<string>("");
  const [assigningCourse, setAssigningCourse] = useState(false);
  const [teacherCourses, setTeacherCourses] = useState<{
    [key: string]: Course[];
  }>({});

  // Fetch teachers, departments, and courses
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Verify user is admin
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || profileData?.role !== "dean") {
          setError("You don't have permission to view this page");
          return;
        }

        // Fetch all teachers and deans (both roles)
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        if (!profile?.organization_id) {
          setError("User not part of an organization");
          return;
        }

        const { data: teachersData, error: teachersError } = await supabase
          .from("profiles")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .or("role.eq.teacher,role.eq.dean")
          .order("full_name", { ascending: true });

        if (teachersError) {
          console.error("Error fetching teachers:", teachersError);
          setError("Failed to load teachers");
          return;
        }

        setTeachers(teachersData || []);
        console.log("Teachers loaded:", teachersData?.length);

        // Fetch departments
        const { data: departmentsData, error: departmentsError } =
          await supabase
            .from("departments")
            .select("*")
            .order("name", { ascending: true });

        if (departmentsError) {
          console.error("Error fetching departments:", departmentsError);
        } else {
          setDepartments(departmentsData || []);
        }

        // Fetch all courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*");

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
        } else {
          setCourses(coursesData || []);

          // Group courses by teacher
          const coursesByTeacher: { [key: string]: Course[] } = {};

          for (const course of coursesData || []) {
            if (course.owner_id) {
              if (!coursesByTeacher[course.owner_id]) {
                coursesByTeacher[course.owner_id] = [];
              }
              coursesByTeacher[course.owner_id].push(course);
            }
          }

          setTeacherCourses(coursesByTeacher);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle course assignment
  const handleAssignCourse = async () => {
    if (!selectedTeacher || !selectedCourseToAssign) return;

    setAssigningCourse(true);

    try {
      const supabase = createClient();

      // Update the course's owner_id to assign it to the selected teacher
      const { error } = await supabase
        .from("courses")
        .update({ owner_id: selectedTeacher.id })
        .eq("id", selectedCourseToAssign);

      if (error) {
        console.error("Error assigning course:", error);
        toast({
          title: "Error",
          description: "Failed to assign course to teacher",
        });
        return;
      }

      // Update local state
      const updatedCourse = courses.find(
        (c) => c.id === selectedCourseToAssign,
      );

      if (updatedCourse) {
        // Update the courses list
        setCourses(
          courses.map((c) =>
            c.id === selectedCourseToAssign
              ? { ...c, owner_id: selectedTeacher.id }
              : c,
          ),
        );

        // Update the teacherCourses state
        setTeacherCourses((prev) => {
          const newTeacherCourses = { ...prev };

          // Remove from previous owner if exists
          Object.keys(newTeacherCourses).forEach((teacherId) => {
            newTeacherCourses[teacherId] = newTeacherCourses[teacherId].filter(
              (c) => c.id !== selectedCourseToAssign,
            );
          });

          // Add to new owner
          if (!newTeacherCourses[selectedTeacher.id]) {
            newTeacherCourses[selectedTeacher.id] = [];
          }

          newTeacherCourses[selectedTeacher.id].push({
            ...updatedCourse,
            owner_id: selectedTeacher.id,
          });

          return newTeacherCourses;
        });
      }

      toast({
        title: "Success",
        description: "Course assigned successfully",
      });

      // Reset and close dialog
      setSelectedCourseToAssign("");
      setAssignCourseDialogOpen(false);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setAssigningCourse(false);
    }
  };

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || teacher.department === departmentFilter;

    const matchesRole = roleFilter === "all" || teacher.role === roleFilter;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get department name by code
  const getDepartmentName = (departmentCode: string | undefined) => {
    if (!departmentCode) return "Not assigned";

    const department = departments.find((d) => d.code === departmentCode);
    return department ? department.name : departmentCode;
  };

  // Stats calculation
  const totalTeachers = teachers.filter((t) => t.role === "teacher").length;
  const totalAdmins = teachers.filter((t) => t.role === "dean").length;
  const totalCourses = courses.length;
  const teachersWithCourses = Object.keys(teacherCourses).length;
  const averageCoursesPerTeacher =
    teachersWithCourses > 0
      ? (totalCourses / teachersWithCourses).toFixed(1)
      : "0";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Teacher Management
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Regular teaching staff
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administrators
            </CardTitle>
            <Shield className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground">
              With admin privileges
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
              {teachersWithCourses} teachers with assignments
              <br />
              Avg {averageCoursesPerTeacher} courses per teacher
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <MessageSquare className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
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
                <SelectItem key={dept.id} value={dept.code}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="dean">Administrators</SelectItem>
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
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-2">Loading teachers...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8 text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No teachers found</h3>
              <p className="text-sm text-muted-foreground">
                {teachers.length > 0
                  ? "Try adjusting your search or filters"
                  : "No teachers have been added to the system yet"}
              </p>
            </div>
          ) : (
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
                      Role
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Courses
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Joined
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
                              src={teacher.avatar_url || undefined}
                              alt={teacher.full_name}
                            />
                            <AvatarFallback>
                              {teacher.full_name
                                ? teacher.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {teacher.full_name || "Unnamed"}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {teacher.email}
                            </div>
                            {teacher.phone && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {teacher.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {getDepartmentName(teacher.department)}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge
                          variant={
                            teacher.role === "dean" ? "default" : "outline"
                          }
                        >
                          {teacher.role === "dean"
                            ? "Administrator"
                            : "Teacher"}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        {!teacherCourses[teacher.id] ||
                        teacherCourses[teacher.id].length === 0 ? (
                          <div className="flex space-x-2 items-center">
                            <span className="text-muted-foreground text-sm">
                              No courses
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setAssignCourseDialogOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {teacherCourses[teacher.id].map((course) => (
                              <div
                                key={course.id}
                                className="flex justify-between items-center"
                              >
                                <Link
                                  href={`/dashboard/courses/${course.id}`}
                                  className="text-sm hover:underline flex items-center gap-1"
                                >
                                  <BookOpen className="h-3 w-3" />
                                  {course.name}
                                  <span className="text-xs text-muted-foreground">
                                    ({course.code})
                                  </span>
                                </Link>
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 mt-1 w-fit"
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setAssignCourseDialogOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Assign More
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {teacher.created_at
                          ? formatDate(teacher.created_at)
                          : "Unknown"}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTeacher(teacher);
                                  setAssignCourseDialogOpen(true);
                                }}
                              >
                                <BookOpen className="mr-2 h-4 w-4" />
                                Assign Course
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
          )}
        </CardContent>
      </Card>

      {/* Assign Course Dialog */}
      <Dialog
        open={assignCourseDialogOpen}
        onOpenChange={setAssignCourseDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Course to Teacher</DialogTitle>
            <DialogDescription>
              {selectedTeacher
                ? `Select a course to assign to ${selectedTeacher.full_name}`
                : "Select a course to assign to this teacher"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select
                  value={selectedCourseToAssign}
                  onValueChange={setSelectedCourseToAssign}
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      // Filter out courses already assigned to this teacher
                      .filter(
                        (course) =>
                          !teacherCourses[selectedTeacher?.id || ""]?.some(
                            (c) => c.id === course.id,
                          ),
                      )
                      .map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignCourseDialogOpen(false)}
              disabled={assigningCourse}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignCourse}
              disabled={!selectedCourseToAssign || assigningCourse}
            >
              {assigningCourse ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
