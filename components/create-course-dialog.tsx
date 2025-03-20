"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

// Define the interface for a course
export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  studentCount?: number;
  owner_id?: string;
  teacher?: string;
  cycle?: string;
}

interface CreateCourseDialogProps {
  children: React.ReactNode;
  onCourseCreate: (course: Course) => void;
}

const CreateCourseDialog = ({
  children,
  onCourseCreate,
}: CreateCourseDialogProps) => {
  const { user } = useAuth(); // Get the currently logged-in user
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kuerzel, setKuerzel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [teilnehmerzahl, setTeilnehmerzahl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate user is logged in
    if (!user) {
      setError("You must be logged in to create a course");
      toast({
        title: "Error",
        description: "You must be logged in to create a course",
      });
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();

      // Create the new course in Supabase
      const { data, error } = await supabase
        .from("courses")
        .insert({
          name: name,
          code: kuerzel,
          student_count: teilnehmerzahl ? parseInt(teilnehmerzahl, 10) : 0,
          owner_id: user.id,
          teacher: user.id, // Initially the creator is the teacher
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          cycle: "current", // Default value, can be adjusted as needed
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

        // Call the onCourseCreate callback to add the course to the sidebar
        onCourseCreate(newCourse);

        // Show success message
        toast({
          title: "Success",
          description: `Course "${name}" created successfully`,
        });

        // Reset form and close dialog
        setName("");
        setKuerzel("");
        setBeschreibung("");
        setTeilnehmerzahl("");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Erstelle einen Kurs</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Course name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="kuerzel">Kürzel</Label>
            <Input
              id="kuerzel"
              value={kuerzel}
              onChange={(e) => setKuerzel(e.target.value)}
              placeholder="Course abbreviation"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="beschreibung">Kursbeschreibung</Label>
            <Textarea
              id="beschreibung"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Course description"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="teilnehmerzahl">Teilnehmerzahl</Label>
            <Input
              id="teilnehmerzahl"
              type="number"
              value={teilnehmerzahl}
              onChange={(e) => setTeilnehmerzahl(e.target.value)}
              placeholder="Number of students"
              required
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
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

export default CreateCourseDialog;
