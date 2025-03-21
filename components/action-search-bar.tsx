"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  BarChart3,
  CalendarDays,
  MessageSquare,
  Users,
  GraduationCap,
  LayoutDashboard,
  Settings,
  FileText,
  HelpCircle,
} from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

// Type for an action item
interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  category?: string;
  path: string;
}

interface SearchResult {
  actions: Action[];
}

// Helper function to get icon based on path pattern
const getIconForPath = (path: string) => {
  if (path.includes("dashboard") && path.split("/").length === 2)
    return <LayoutDashboard className="h-4 w-4 text-gray-500" />;
  if (path.includes("analytics"))
    return <BarChart3 className="h-4 w-4 text-blue-500" />;
  if (path.includes("calendar"))
    return <CalendarDays className="h-4 w-4 text-purple-500" />;
  if (path.includes("courses"))
    return <BookOpen className="h-4 w-4 text-emerald-600" />;
  if (path.includes("teacher"))
    return <GraduationCap className="h-4 w-4 text-green-500" />;
  if (path.includes("feedback"))
    return <MessageSquare className="h-4 w-4 text-orange-500" />;
  if (path.includes("settings"))
    return <Settings className="h-4 w-4 text-gray-500" />;
  if (path.includes("help"))
    return <HelpCircle className="h-4 w-4 text-gray-500" />;
  if (path.includes("student"))
    return <Users className="h-4 w-4 text-indigo-500" />;

  return <FileText className="h-4 w-4 text-gray-500" />;
};

// Function to generate a nice label from a path
const getLabelFromPath = (path: string) => {
  // Remove leading slash and split into parts
  const parts = path.replace(/^\//, "").split("/");

  // Get the last meaningful part
  let lastPart = parts[parts.length - 1];

  // Handle dynamic routes with [param]
  if (lastPart.startsWith("[") && lastPart.endsWith("]")) {
    // If we're dealing with a dynamic route, use the parent route name instead
    lastPart = parts[parts.length - 2] || "Item";
  }

  // Format the label (capitalize, replace hyphens with spaces)
  return lastPart
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Function to determine category based on path
const getCategoryForPath = (path: string) => {
  if (path === "/dashboard") return "Dashboard";
  if (path.includes("courses")) return "Course";
  if (path.includes("admin")) return "Admin";
  if (path.includes("settings")) return "Settings";
  if (path.includes("calendar")) return "Calendar";
  if (path.includes("analytics")) return "Analytics";
  if (path.includes("teachers")) return "Management";
  if (path.includes("events")) return "Event";
  return "Page";
};

function ActionSearchBar() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [allActions, setAllActions] = useState<Action[]>([]);
  const debouncedQuery = useDebounce(query, 200);
  const router = useRouter();
  const pathname = usePathname();

  // Dynamically generate actions from routes
  useEffect(() => {
    // Function to scan directory structure and extract routes
    const getRoutesFromAppStructure = () => {
      // In a real Next.js app, you could use a more automated approach
      // For now, we'll extract routes from the file structure we can see
      const routes = [
        "/dashboard",
        "/admin-analytics",
        "/calendar",
        "/teachers",
        "/settings",
        "/help",
        "/student-share",
        "/dashboard/courses",
        "/dashboard/events",
        "/dashboard/analytics",
      ];

      return routes;
    };

    // Generate course-specific routes
    const generateCourseRoutes = () => {
      const courseData = [
        { id: "course-1", name: "Introduction to Programming", code: "CS101" },
        { id: "course-2", name: "Data Structures & Algorithms", code: "CS201" },
        { id: "course-3", name: "Web Development", code: "CS301" },
        { id: "course-4", name: "Machine Learning Basics", code: "CS401" },
        { id: "course-5", name: "Database Systems", code: "CS202" },
      ];

      // Map each course to its routes
      return courseData.flatMap((course) => {
        const basePath = `/dashboard/courses/${course.id}`;
        return [
          {
            id: `course-${course.id}`,
            path: basePath,
            name: course.name,
            code: course.code,
          },
          {
            id: `course-${course.id}-analytics`,
            path: `${basePath}/analytics`,
            name: `${course.name} Analytics`,
            code: course.code,
          },
          {
            id: `course-${course.id}-feedback`,
            path: `${basePath}/feedback`,
            name: `${course.name} Feedback`,
            code: course.code,
          },
          {
            id: `course-${course.id}-calendar`,
            path: `${basePath}/calendar`,
            name: `${course.name} Calendar`,
            code: course.code,
          },
          {
            id: `course-${course.id}-settings`,
            path: `${basePath}/settings`,
            name: `${course.name} Settings`,
            code: course.code,
          },
        ];
      });
    };

    // Get app routes and course routes
    const appRoutes = getRoutesFromAppStructure();
    const courseRoutes = generateCourseRoutes();

    // Convert routes to actions
    const routeActions = appRoutes.map((route) => ({
      id: route,
      label: getLabelFromPath(route),
      icon: getIconForPath(route),
      description: `View ${getLabelFromPath(route).toLowerCase()}`,
      category: getCategoryForPath(route),
      path: route,
    }));

    // Convert course routes to actions
    const courseActions = courseRoutes.map((course) => ({
      id: course.id,
      label: course.name,
      icon: getIconForPath(course.path),
      description: course.code,
      category: "Course",
      path: course.path,
    }));

    // Add event-specific routes if needed
    const eventRoutes = [
      {
        id: "event-1",
        name: "Lecture on React",
        path: "/dashboard/events/event-1",
      },
      {
        id: "event-2",
        name: "Assignment Deadline",
        path: "/dashboard/events/event-2",
      },
      {
        id: "event-3",
        name: "Project Demo",
        path: "/dashboard/events/event-3",
      },
    ];

    const eventActions = eventRoutes.map((event) => ({
      id: event.id,
      label: event.name,
      icon: <CalendarDays className="h-4 w-4 text-purple-500" />,
      description: "Event",
      category: "Event",
      path: event.path,
    }));

    // Combine all actions
    setAllActions([...routeActions, ...courseActions, ...eventActions]);
  }, []);

  // Update search results when query changes
  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      // Limit to 6 actions when showing all
      setResult({ actions: allActions.slice(0, 6) });
      return;
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredActions = allActions
      .filter((action) => {
        const searchableText = `${action.label.toLowerCase()} ${action.description?.toLowerCase() || ""}`;
        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 6); // Limit to max 6 results

    setResult({ actions: filteredActions });
    setSelectedIndex(-1); // Reset selection when results change
  }, [debouncedQuery, isFocused, allActions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!result) return;

    const { actions } = result;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < actions.length - 1 ? prevIndex + 1 : prevIndex,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < actions.length) {
          navigateToAction(actions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsFocused(false);
        break;
    }
  };

  const navigateToAction = (action: Action) => {
    setQuery("");
    setIsFocused(false);
    router.push(action.path);
  };

  const container = {
    hidden: { opacity: 0, y: -5 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: {
        duration: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: {
        duration: 0.15,
      },
    },
  };

  const handleFocus = () => {
    setSelectedIndex(-1);
    setIsFocused(true);
  };

  // Dynamically highlight active items based on current path
  const isActiveItem = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="relative max-w-md w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search courses, features..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-9 h-9 bg-gray-50 dark:bg-gray-900"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
      </div>

      <AnimatePresence>
        {isFocused && result && (
          <motion.div
            className="absolute z-50 w-full border rounded-md shadow-lg bg-background mt-1"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {result.actions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              <motion.ul className="py-1">
                {result.actions.map((action, index) => (
                  <motion.li
                    key={action.id}
                    className={`px-3 py-2 flex items-center justify-between hover:bg-accent cursor-pointer ${
                      index === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : ""
                    } ${isActiveItem(action.path) ? "font-semibold" : ""}`}
                    variants={item}
                    layout
                    onClick={() => navigateToAction(action)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{action.icon}</span>
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                      {action.description && (
                        <span className="text-xs text-muted-foreground">
                          {action.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        {action.category}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
            <div className="mt-1 px-3 py-2 border-t text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ActionSearchBar;
