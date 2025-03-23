"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the interface for a course
export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  student_count?: number;
  owner_id?: string;
  teacher?: string;
  cycle?: string;
  organization_id?: string;
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface CreateCourseDialogProps {
  children: React.ReactNode;
  onCourseCreate: (course: Course) => void;
}

const AdminCreateCourseDialog = ({
  children,
  onCourseCreate,
}: CreateCourseDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [orgId, setOrgId] = useState(""); // new state for organization id
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Check if user is admin and load teachers when dialog opens
  useEffect(() => {
    if (!open || !user) return;

    const checkAdminAndLoadTeachers = async () => {
      setLoadingTeachers(true);
      setError("");

      try {
        const supabase = createClient();

        // Check if user is admin and fetch organization_id and full_name
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role, organization_id, full_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error checking role:", profileError);
          setError("Failed to verify permissions");
          return;
        }

        const userIsAdmin = profileData?.role === "dean";
        setIsAdmin(userIsAdmin);

        if (userIsAdmin && profileData?.organization_id) {
          setOrgId(profileData.organization_id);
        } else {
          setError("Only administrators can create courses");
          return;
        }

        // Fetch teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("role", "teacher")
          .order("full_name", { ascending: true });

        if (teachersError) {
          console.error("Error fetching teachers:", teachersError);
          setError("Failed to load teachers");
          return;
        }

        // If the current dean isn't in the list (because their role isn't teacher),
        // add them as an option labeled "(You)"
        let updatedTeachers: Teacher[] = teachersData || [];
        const deanOption: Teacher = {
          id: user.id,
          full_name: profileData.full_name
            ? `${profileData.full_name} (You)`
            : "You (You)",
          email: user.email || "",
        };

        if (!updatedTeachers.find((t) => t.id === user.id)) {
          updatedTeachers = [deanOption, ...updatedTeachers];
        }

        setTeachers(updatedTeachers);
        console.log(
          `Loaded ${updatedTeachers.length} teachers:`,
          updatedTeachers,
        );
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoadingTeachers(false);
      }
    };

    checkAdminAndLoadTeachers();
  }, [open, user]);

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setStudentCount("");
    setTeacherId("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a course");
      return;
    }

    if (!isAdmin) {
      setError("Only administrators can create courses");
      return;
    }

    if (!name.trim()) {
      setError("Course name is required");
      return;
    }

    if (!code.trim()) {
      setError("Course code is required");
      return;
    }

    if (!teacherId) {
      setError("Please select a teacher for this course");
      return;
    }

    if (!orgId) {
      setError("Organization information is missing");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();

      // Create the new course in Supabase, including organization_id
      const { data, error } = await supabase
        .from("courses")
        .insert({
          name: name,
          code: code,
          student_count: studentCount ? parseInt(studentCount, 10) : 0,
          owner_id: teacherId,
          teacher: teacherId,
          organization_id: orgId, // include organization id here
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          cycle: "current",
          // description field is omitted as per your previous changes
        })
        .select();

      if (error) {
        console.error("Error creating course:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to create course: ${error.message}`,
        });
        return;
      }

      if (data && data.length > 0) {
        const newCourse = data[0] as Course;
        console.log("Course created successfully:", newCourse);
        onCourseCreate(newCourse);
        toast({
          title: "Success",
          description: `Course "${name}" created successfully`,
        });
        resetForm();
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Introduction to Programming"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS101"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the course"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentCount">Initial Student Count</Label>
              <Input
                id="studentCount"
                type="number"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              {loadingTeachers ? (
                <div className="flex items-center h-10 px-3 py-2 rounded-md border text-sm">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading teachers...
                </div>
              ) : (
                <Select
                  value={teacherId}
                  onValueChange={(value) => {
                    console.log("Teacher selected:", value);
                    setTeacherId(value);
                  }}
                >
                  <SelectTrigger id="teacher" className="w-full">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.slice(0, 5).map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                    {teachers.length > 5 && (
                      <div className="py-2 px-2 text-xs text-muted-foreground">
                        {teachers.length - 5} more teachers...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !teacherId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCreateCourseDialog;
