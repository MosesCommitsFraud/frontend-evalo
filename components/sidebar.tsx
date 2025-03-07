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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Main navigation items
const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: GraduationCap,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

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
        "transition-all duration-300 ease-in-out",
        "w-64 shrink-0 border-r h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto",
        isVisible ? "block md:block" : "hidden",
      )}
    >
      {/* Main Navigation */}
      <div className="px-4 py-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Courses Section */}
      <div className="px-3 py-2">
        <div className="mb-2 px-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Courses</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add Course</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Course</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
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
                  <BookOpen className="mr-2 h-4 w-4 text-emerald-600" />
                  <span>{course.name}</span>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
