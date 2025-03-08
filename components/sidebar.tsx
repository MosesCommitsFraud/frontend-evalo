"use client";

import React, { memo } from "react";
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
  Calendar1,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CreateCourseDialog from "@/components/create-course-dialog";

// Mock course data - would come from your API
const courses = [
  { id: "course-1", name: "Introduction to Programming", code: "CS101" },
  { id: "course-2", name: "Data Structures & Algorithms", code: "CS201" },
  { id: "course-3", name: "Web Development", code: "CS301" },
  { id: "course-4", name: "Machine Learning Basics", code: "CS401" },
  { id: "course-5", name: "Database Systems", code: "CS202" },
];

// Memoized nav item component to prevent unnecessary re-renders
const NavItem = memo(
  ({
    href,
    title,
    icon,
    pathname,
  }: {
    href: string;
    title: string;
    icon: React.ReactNode;
    pathname: string;
  }) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

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
  },
);
NavItem.displayName = "NavItem";

// Memoized course item component
const CourseItem = memo(
  ({
    course,
    pathname,
  }: {
    course: { id: string; name: string; code: string };
    pathname: string;
  }) => {
    const href = `/dashboard/courses/${course.id}`;
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
      <Link
        key={course.id}
        href={href}
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors-only",
          isActive ? "bg-accent text-accent-foreground" : "transparent",
        )}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        <span className="truncate">{course.name}</span>
      </Link>
    );
  },
);
CourseItem.displayName = "CourseItem";

// Memoized section component
const SidebarSection = memo(
  ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-3">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  ),
);
SidebarSection.displayName = "SidebarSection";

// Main Sidebar component
export const Sidebar = memo(({ isVisible = true }: { isVisible?: boolean }) => {
  const pathname = usePathname();

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
        {/* OVERVIEW Section */}
        <div className="px-4 py-4 space-y-6">
          <SidebarSection title="OVERVIEW">
            <NavItem
              href="/dashboard"
              title="Dashboard"
              icon={<LayoutDashboard className="h-4 w-4 mr-2" />}
              pathname={pathname}
            />
            <NavItem
              href="/analytics"
              title="Analytics"
              icon={<BarChart3 className="h-4 w-4 mr-2" />}
              pathname={pathname}
            />
            <NavItem
              href="/calendar"
              title="Calendar"
              icon={<Calendar1 className="h-4 w-4 mr-2" />}
              pathname={pathname}
            />
          </SidebarSection>

          {/* MANAGEMENT Section */}
          <SidebarSection title="MANAGEMENT">
            <NavItem
              href="/admin-analytics"
              title="Analytics"
              icon={<ChartLine className="h-4 w-4 mr-2" />}
              pathname={pathname}
            />
            <NavItem
              href="/teachers"
              title="Teachers"
              icon={<GraduationCap className="h-4 w-4 mr-2" />}
              pathname={pathname}
            />
          </SidebarSection>

          {/* SETTINGS Section */}
          <SidebarSection title="SETTINGS">
            <NavItem
              href="/admin-settings"
              title="Admin Settings"
              icon={<Settings className="h-4 w-4 mr-2" />}
              pathname={pathname}
            />
            <NavItem
              href="/help"
              title="Help & Support"
              icon={<HelpCircle className="h-4 w-4 mr-2" />}
              pathname={pathname}
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
            <CreateCourseDialog>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Add Course</span>
              </Button>
            </CreateCourseDialog>
          </div>

          {/* Virtualized course list for better performance */}
          <div className="space-y-1 px-1 overflow-y-auto flex-1 virtualized-list">
            {courses.map((course) => (
              <CourseItem key={course.id} course={course} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
});
Sidebar.displayName = "Sidebar";

export default Sidebar;
