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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CreateCourseDialog from "@/components/create-course-dialog";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    action: {
      icon: Plus,
      tooltip: "Add Course",
    },
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

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mt-4 px-4">
      <div className="space-y-1 py-2">
        <TooltipProvider>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <div
                key={item.href}
                className="flex items-center justify-between"
              >
                <Link
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
                </Link>

                {item.action && item.action.tooltip === "Add Course" ? (
                  // Wrap the CreateCourseDialog with TooltipTrigger to avoid nested asChild conflicts.
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CreateCourseDialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <item.action.icon className="h-4 w-4" />
                          <span className="sr-only">{item.action.tooltip}</span>
                        </Button>
                      </CreateCourseDialog>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.action.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : item.action ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <item.action.icon className="h-4 w-4" />
                        <span className="sr-only">{item.action.tooltip}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.action.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
