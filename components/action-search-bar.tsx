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
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

interface Course {
  id: string;
  name: string;
  code: string;
  owner_id: string;
}

interface Event {
  id: string;
  course_id: string;
  event_date: string;
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
  if (path.includes("events"))
    return <CalendarDays className="h-4 w-4 text-purple-500" />;

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 200);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Fetch courses and events from the database
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const supabase = createClient();

        // Check user role first to determine access level
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }

        const isAdmin = profileData?.role === "dean";

        // Fetch courses - deans see all courses, teachers only see their own
        let coursesQuery = supabase
          .from("courses")
          .select("id, name, code, owner_id");

        if (!isAdmin) {
          // Teachers can only access their assigned courses
          coursesQuery = coursesQuery.eq("owner_id", user.id);
        }

        const { data: coursesData, error: coursesError } = await coursesQuery;

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          return;
        }

        setCourses(coursesData || []);

        // Fetch events - deans see all events, teachers only see events for their courses
        let eventsQuery = supabase
          .from("events")
          .select("id, course_id, event_date");

        if (!isAdmin) {
          // For teachers, we need to get only events for their courses
          // We can use the course IDs we just fetched
          const teacherCourseIds =
            coursesData?.map((course) => course.id) || [];

          if (teacherCourseIds.length > 0) {
            eventsQuery = eventsQuery.in("course_id", teacherCourseIds);
          } else {
            // If teacher has no courses, don't fetch any events
            setEvents([]);
            setIsLoading(false);
            return;
          }
        }

        const { data: eventsData, error: eventsError } = await eventsQuery;

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          return;
        }

        setEvents(eventsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Dynamically generate actions from routes and database data
  useEffect(() => {
    // Static routes from app structure
    const getRoutesFromAppStructure = () => {
      // Core routes that are always available
      const routes = [
        "/dashboard",
        "/analytics",
        "/calendar",
        "/settings",
        "/help",
        "/profile",
        "/dashboard/courses",
        "/dashboard/events",
      ];

      // Admin-only routes
      if (user) {
        // We could check user.role here, but for simplicity, we'll include these
        // The server-side permissions will handle access control
        routes.push("/admin-analytics", "/admin-settings", "/teachers");
      }

      return routes;
    };

    // Generate actions from all routes
    const generateActions = () => {
      const appRoutes = getRoutesFromAppStructure();

      // Convert static routes to actions
      const routeActions = appRoutes.map((route) => ({
        id: route,
        label: getLabelFromPath(route),
        icon: getIconForPath(route),
        description: `View ${getLabelFromPath(route).toLowerCase()}`,
        category: getCategoryForPath(route),
        path: route,
      }));

      // Generate course actions from database courses
      const courseActions = courses.map((course) => {
        const basePath = `/dashboard/courses/${course.id}`;
        return {
          id: `course-${course.id}`,
          label: course.name,
          icon: getIconForPath(basePath),
          description: course.code,
          category: "Course",
          path: basePath,
        };
      });

      // Generate course sub-pages (analytics, feedback, etc.)
      const courseSubpageActions = courses.flatMap((course) => {
        const basePath = `/dashboard/courses/${course.id}`;
        return [
          {
            id: `course-${course.id}-analytics`,
            label: `${course.name} Analytics`,
            icon: <BarChart3 className="h-4 w-4 text-blue-500" />,
            description: course.code,
            category: "Course",
            path: `${basePath}/analytics`,
          },
          {
            id: `course-${course.id}-feedback`,
            label: `${course.name} Feedback`,
            icon: <MessageSquare className="h-4 w-4 text-orange-500" />,
            description: course.code,
            category: "Course",
            path: `${basePath}/feedback`,
          },
          {
            id: `course-${course.id}-share`,
            label: `${course.name} Share`,
            icon: <Users className="h-4 w-4 text-indigo-500" />,
            description: course.code,
            category: "Course",
            path: `${basePath}/share`,
          },
        ];
      });

      // Generate event actions
      const eventActions = events.map((event) => {
        const course = courses.find((c) => c.id === event.course_id);
        const eventPath = `/dashboard/events/${event.id}`;
        const eventDate = new Date(event.event_date).toLocaleDateString();

        return {
          id: `event-${event.id}`,
          label: course
            ? `${course.code} Event (${eventDate})`
            : `Event (${eventDate})`,
          icon: <CalendarDays className="h-4 w-4 text-purple-500" />,
          description: "Event",
          category: "Event",
          path: eventPath,
        };
      });

      // Combine all actions
      return [
        ...routeActions,
        ...courseActions,
        ...courseSubpageActions,
        ...eventActions,
      ];
    };

    setAllActions(generateActions());
  }, [courses, events, user]);

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
            ) : isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading results...
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
