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

// Icon mapping for dynamic icon selection
const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="h-4 w-4 text-gray-500" />,
  analytics: <BarChart3 className="h-4 w-4 text-blue-500" />,
  calendar: <CalendarDays className="h-4 w-4 text-purple-500" />,
  courses: <BookOpen className="h-4 w-4 text-emerald-600" />,
  teachers: <GraduationCap className="h-4 w-4 text-green-500" />,
  resources: <FileText className="h-4 w-4 text-orange-500" />,
  feedback: <MessageSquare className="h-4 w-4 text-orange-500" />,
  settings: <Settings className="h-4 w-4 text-gray-500" />,
  help: <HelpCircle className="h-4 w-4 text-gray-500" />,
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

  // Generate actions dynamically based on app structure
  useEffect(() => {
    // Core navigation actions (static part)
    const coreActions: Action[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: iconMap.dashboard,
        description: "Main dashboard",
        category: "Page",
        path: "/dashboard",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: iconMap.analytics,
        description: "View all data",
        category: "Page",
        path: "/dashboard/analytics",
      },
      {
        id: "calendar",
        label: "Calendar",
        icon: iconMap.calendar,
        description: "All events",
        category: "Page",
        path: "/dashboard/calendar",
      },
    ];

    // Management actions
    const managementActions: Action[] = [
      {
        id: "teachers",
        label: "Teacher Management",
        icon: iconMap.teachers,
        description: "Manage teachers",
        category: "Management",
        path: "/dashboard/teachers",
      },
      {
        id: "resources",
        label: "Resources",
        icon: iconMap.resources,
        description: "Course resources",
        category: "Management",
        path: "/dashboard/resources",
      },
    ];

    // Settings actions
    const settingsActions: Action[] = [
      {
        id: "settings",
        label: "Settings",
        icon: iconMap.settings,
        description: "System settings",
        category: "Settings",
        path: "/dashboard/settings",
      },
      {
        id: "help",
        label: "Help & Support",
        icon: iconMap.help,
        description: "Get assistance",
        category: "Settings",
        path: "/dashboard/help",
      },
    ];

    // Fetch course data - in a real app, this would come from an API
    // For this example, we'll use mock data
    const coursesActions: Action[] = [
      {
        id: "course-1",
        label: "Introduction to Programming",
        icon: iconMap.courses,
        description: "CS101",
        category: "Course",
        path: "/dashboard/courses/course-1",
      },
      {
        id: "course-2",
        label: "Data Structures & Algorithms",
        icon: iconMap.courses,
        description: "CS201",
        category: "Course",
        path: "/dashboard/courses/course-2",
      },
      {
        id: "course-3",
        label: "Web Development",
        icon: iconMap.courses,
        description: "CS301",
        category: "Course",
        path: "/dashboard/courses/course-3",
      },
      {
        id: "course-4",
        label: "Machine Learning Basics",
        icon: iconMap.courses,
        description: "CS401",
        category: "Course",
        path: "/dashboard/courses/course-4",
      },
      {
        id: "course-5",
        label: "Database Systems",
        icon: iconMap.courses,
        description: "CS202",
        category: "Course",
        path: "/dashboard/courses/course-5",
      },
    ];

    // In a real app, you would fetch this data dynamically:
    // 1. From an API endpoint that provides available routes
    // 2. From a global state/context
    // 3. From a navigation map defined elsewhere

    // Combine all actions
    setAllActions([
      ...coreActions,
      ...managementActions,
      ...settingsActions,
      ...coursesActions,
    ]);
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
