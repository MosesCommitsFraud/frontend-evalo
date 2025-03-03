"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  GraduationCap,
  Users,
  Settings,
  LifeBuoy,
  BookOpen,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CreateCourseDialog from "@/components/create-course-dialog";

// Mock courses data (would come from your API)
const courses = [
  { id: "course-1", name: "Introduction to Programming", code: "CS101" },
  { id: "course-2", name: "Data Structures & Algorithms", code: "CS201" },
  { id: "course-3", name: "Web Development", code: "CS301" },
  { id: "course-4", name: "Machine Learning Basics", code: "CS401" },
  { id: "course-5", name: "Database Systems", code: "CS202" },
];

const navSections = [
  {
    section: "Overview (Admin)",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    section: "Management (Admin)",
    items: [
      { title: "Students", href: "/students", icon: Users },
      { title: "Teachers", href: "/dashboard/teachers", icon: GraduationCap },
    ],
  },
  {
    section: "Courses (Dozent)",
    items: courses.map((course) => ({
      title: course.name,
      href: `/dashboard/courses/${course.id}`,
      icon: BookOpen,
    })),
  },
  {
    section: "Settings (Admin)",
    items: [
      { title: "Admin Settings", href: "/settings/admin", icon: Settings },
      { title: "Help & Support", href: "/settings/help", icon: LifeBuoy },
    ],
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mt-4 px-4 space-y-6">
      {navSections.map((section) => (
        <div key={section.section}>
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
            {section.section}
          </h2>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "transparent",
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  {section.section !== "Courses (Dozent)" && (
                    <ChevronRight className="ml-auto h-4 w-4 opacity-70" />
                  )}
                </Link>
              );
            })}
            {section.section === "Courses (Dozent)" && (
              <div className="px-3 py-2">
                <CreateCourseDialog>
                  <Button
                    variant="outline"
                    className="w-full text-green-600 hover:bg-green-50 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Course
                  </Button>
                </CreateCourseDialog>
              </div>
            )}
          </div>
        </div>
      ))}
      <Separator className="my-4" />
    </div>
  );
}
