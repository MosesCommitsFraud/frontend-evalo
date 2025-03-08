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
} from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";

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

// Sample data for courses and other navigable items
const allActions = [
  {
    id: "course-1",
    label: "Introduction to Programming",
    icon: <BookOpen className="h-4 w-4 text-emerald-600" />,
    description: "CS101",
    category: "Course",
    path: "/dashboard/courses/course-1",
  },
  {
    id: "course-2",
    label: "Data Structures & Algorithms",
    icon: <BookOpen className="h-4 w-4 text-emerald-600" />,
    description: "CS201",
    category: "Course",
    path: "/dashboard/courses/course-2",
  },
  {
    id: "course-3",
    label: "Web Development",
    icon: <BookOpen className="h-4 w-4 text-emerald-600" />,
    description: "CS301",
    category: "Course",
    path: "/dashboard/courses/course-3",
  },
  {
    id: "course-4",
    label: "Machine Learning Basics",
    icon: <BookOpen className="h-4 w-4 text-emerald-600" />,
    description: "CS401",
    category: "Course",
    path: "/dashboard/courses/course-4",
  },
  {
    id: "analytics",
    label: "Analytics Dashboard",
    icon: <BarChart3 className="h-4 w-4 text-blue-500" />,
    description: "View all data",
    category: "Page",
    path: "/dashboard",
  },
  {
    id: "feedback",
    label: "Feedback Overview",
    icon: <MessageSquare className="h-4 w-4 text-orange-500" />,
    category: "Feature",
    path: "/dashboard/feedback",
  },
  {
    id: "calendar",
    label: "Course Calendar",
    icon: <CalendarDays className="h-4 w-4 text-purple-500" />,
    category: "Feature",
    path: "/dashboard/calendar",
  },
  {
    id: "students",
    label: "Student Management",
    icon: <Users className="h-4 w-4 text-indigo-500" />,
    category: "Page",
    path: "/students",
  },
  {
    id: "teachers",
    label: "Teacher Directory",
    icon: <GraduationCap className="h-4 w-4 text-green-500" />,
    category: "Page",
    path: "/dashboard/teachers",
  },
];

function ActionSearchBar() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 200);
  const router = useRouter();

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
  }, [debouncedQuery, isFocused]);

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
                    }`}
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
