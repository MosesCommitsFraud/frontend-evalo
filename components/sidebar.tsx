"use client";

import React, { memo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Settings,
  ChartLine,
  HelpCircle,
  CalendarClock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CreateCourseDialog, { Course } from "@/components/create-course-dialog";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

// Skeleton loader component to prevent "popping" effect
const SidebarSkeleton = memo(() => (
  <div className="px-4 py-4 space-y-6 animate-pulse">
    {/* OVERVIEW Section */}
    <div className="space-y-2">
      <div className="h-4 w-20 bg-muted rounded"></div>
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 bg-muted rounded-md"></div>
        ))}
      </div>
    </div>

    {/* SETTINGS Section */}
    <div className="space-y-2">
      <div className="h-4 w-20 bg-muted rounded"></div>
      <div className="space-y-1">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-9 bg-muted rounded-md"></div>
        ))}
      </div>
    </div>

    <div className="h-[1px] bg-border my-2"></div>

    {/* Courses Section */}
    <div className="space-y-2">
      <div className="h-4 w-20 bg-muted rounded"></div>
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 bg-muted rounded-md"></div>
        ))}
      </div>
    </div>
  </div>
));
SidebarSkeleton.displayName = "SidebarSkeleton";

// Explicitly type the props for NavItem
interface NavItemProps {
  href: string;
  title: string;
  icon: React.ReactNode;
  pathname?: string | null;
}

// Memoized nav item component to prevent unnecessary re-renders
const NavItem = memo(({ href, title, icon, pathname }: NavItemProps) => {
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors-only",
        isActive ? "bg-accent text-accent-foreground" : "transparent",
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
});
NavItem.displayName = "NavItem";

// Explicitly type the props for CourseItem
interface CourseItemProps {
  course: Course;
  pathname?: string | null;
}

// Memoized course item component with fixed-width icon and proper text truncation
const CourseItem = memo(({ course, pathname }: CourseItemProps) => {
  const href = `/dashboard/courses/${course.id}`;
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      key={course.id}
      href={href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors-only",
        isActive ? "bg-accent text-accent-foreground" : "transparent",
      )}
    >
      {/* Fix icon width to prevent shrinking */}
      <div className="flex-shrink-0 w-6">
        <BookOpen className="h-4 w-4" />
      </div>
      {/* Allow text to truncate properly */}
      <span className="truncate">{course.name}</span>
    </Link>
  );
});
CourseItem.displayName = "CourseItem";

// Explicitly type props for SidebarSection
interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

// Memoized section component
const SidebarSection = memo(({ title, children }: SidebarSectionProps) => (
  <div className="space-y-2">
    <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-3">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
));
SidebarSection.displayName = "SidebarSection";

// Type definition for Sidebar props
interface SidebarProps {
  isVisible?: boolean;
}

// Main Sidebar component
export const Sidebar = memo(({ isVisible = true }: SidebarProps) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error checking admin status:", error);
          return;
        }

        setIsAdmin(data?.role === "dean");
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fetch courses from Supabase
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const supabase = createClient();

        // Get organization_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        if (!profile?.organization_id) {
          toast({
            title: "Error",
            description: "You don't belong to an organization",
          });
          return;
        }

        // Add organization filter
        let query = supabase
          .from("courses")
          .select("*")
          .eq("organization_id", profile.organization_id);

        // If admin, show all courses. Otherwise, only show courses where user is the teacher
        if (!isAdmin) {
          // Only show courses where user is the teacher
          query = query.eq("teacher", user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching courses:", error);
          toast({
            title: "Error",
            description: "Failed to load courses. Please refresh the page.",
          });
          return;
        }

        console.log("Courses loaded:", data);
        if (data) {
          setCourses(data as Course[]);
        }
      } catch (error) {
        console.error("Exception fetching courses:", error);
      } finally {
        setLoading(false);
        // Mark content as ready when all async operations complete
        setContentReady(true);
      }
    };

    if (user) {
      fetchCourses();
    } else {
      // If no user, just mark content as ready
      setContentReady(true);
    }
  }, [user, isAdmin]);

  // Function to add a new course
  const handleCourseCreate = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse]);
  };

  // Ensure we're on the client side before rendering pathname-dependent parts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pre-defined fixed classes to avoid layout thrashing
  const visibleClasses = "w-64";
  const hiddenClasses = "w-0 -ml-64 md:w-0 md:-ml-16";

  return (
    <aside
      className={cn(
        "fixed md:relative min-h-screen border-r bg-background overflow-x-hidden",
        "sidebar-transition hardware-accelerated",
        isVisible ? visibleClasses : hiddenClasses,
      )}
      style={{ contain: "layout" }}
    >
      <div className="w-64 contain-layout">
        {/* Show skeleton loader until content is ready */}
        {!contentReady ? (
          <SidebarSkeleton />
        ) : (
          <>
            {/* OVERVIEW Section */}
            <div className="px-4 py-4 space-y-6">
              <SidebarSection title="OVERVIEW">
                <NavItem
                  href="/dashboard"
                  title="Dashboard"
                  icon={<LayoutDashboard className="h-4 w-4 mr-2" />}
                  pathname={isClient ? pathname : null}
                />
                <NavItem
                  href="/analytics"
                  title="Analytics"
                  icon={<BarChart3 className="h-4 w-4 mr-2" />}
                  pathname={isClient ? pathname : null}
                />
                <NavItem
                  href="/calendar"
                  title="Calendar"
                  icon={<CalendarClock className="h-4 w-4 mr-2" />}
                  pathname={isClient ? pathname : null}
                />
              </SidebarSection>

              {/* ADMIN MANAGEMENT Section - Only show for admins */}
              {isAdmin && (
                <SidebarSection title="ADMIN">
                  <NavItem
                    href="/admin-analytics"
                    title="Admin Analytics"
                    icon={<ChartLine className="h-4 w-4 mr-2" />}
                    pathname={isClient ? pathname : null}
                  />
                  <NavItem
                    href="/teachers"
                    title="Teachers"
                    icon={<GraduationCap className="h-4 w-4 mr-2" />}
                    pathname={isClient ? pathname : null}
                  />
                  <NavItem
                    href="/admin-settings"
                    title="Admin Settings"
                    icon={<ShieldCheck className="h-4 w-4 mr-2" />}
                    pathname={isClient ? pathname : null}
                  />
                </SidebarSection>
              )}

              {/* SETTINGS Section - For all users */}
              <SidebarSection title="SETTINGS">
                <NavItem
                  href="/settings"
                  title="Account Settings"
                  icon={<Settings className="h-4 w-4 mr-2" />}
                  pathname={isClient ? pathname : null}
                />
                <NavItem
                  href="/help"
                  title="Help & Support"
                  icon={<HelpCircle className="h-4 w-4 mr-2" />}
                  pathname={isClient ? pathname : null}
                />
              </SidebarSection>
            </div>
            <Separator className="my-2" />

            {/* Courses Section */}
            <div className="px-3 py-2 flex-1 flex flex-col">
              <div className="mb-2 px-3 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  COURSES
                </h3>
                {/* Only show Create Course button to admins */}
                {isAdmin && (
                  <CreateCourseDialog onCourseCreate={handleCourseCreate}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Add Course</span>
                    </Button>
                  </CreateCourseDialog>
                )}
              </div>

              {/* Courses list with loading state */}
              <div className="space-y-1 px-1 overflow-y-auto flex-1 virtualized-list">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No courses found
                  </div>
                ) : (
                  courses.map((course) => (
                    <CourseItem
                      key={course.id}
                      course={course}
                      pathname={isClient ? pathname : null}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
});
Sidebar.displayName = "Sidebar";

export default Sidebar;
