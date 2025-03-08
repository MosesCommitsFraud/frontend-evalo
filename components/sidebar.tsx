"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
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

export function Sidebar({ isVisible = true }: { isVisible?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed md:relative h-[calc(100vh-4rem)] border-r bg-background",
        "transition-all duration-300 ease-in-out",
        "overflow-y-auto",
        isVisible ? "w-64" : "w-0 -ml-64 md:w-0 md:-ml-16",
      )}
    >
      <div className="w-64">
        {" "}
        {/* Fixed width inner container */}
        {/* OVERVIEW Section */}
        <div className="px-4 py-4 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-3">
              OVERVIEW
            </h3>
            <div className="space-y-1">
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
            </div>
          </div>

          {/* MANAGEMENT Section */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-3">
              MANAGEMENT
            </h3>
            <div className="space-y-1">
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
            </div>
          </div>

          {/* SETTINGS Section */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-3">
              SETTINGS
            </h3>
            <div className="space-y-1">
              <NavItem
                href="/settings"
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
            </div>
          </div>
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
          <div className="space-y-1 px-1 overflow-y-auto flex-1">
            {courses.map((course) => {
              const href = `/dashboard/courses/${course.id}`;
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={course.id}
                  href={href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "transparent",
                  )}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>{course.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Helper component for nav items
function NavItem({
  href,
  title,
  icon,
  pathname,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  pathname: string;
}) {
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "transparent",
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
}
