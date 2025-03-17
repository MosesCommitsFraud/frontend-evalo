"use client";

import Link from "next/link";
import { BellIcon, Menu, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import ActionSearchBar from "@/components/action-search-bar";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

// Define proper type for the toggleSidebar prop
interface TopNavProps {
  toggleSidebarAction: () => void;
}

export function TopNav({ toggleSidebarAction }: TopNavProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  // Determine if we're on a page that would show the sidebar toggle
  const showSidebarToggle = user && !pathname.startsWith("/auth/");

  // Get initials from user's full name or email
  const getUserInitials = (): string => {
    if (!user) return "?";

    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
    }

    // If no full name, use first letter of email
    return user.email?.charAt(0).toUpperCase() || "?";
  };

  // Get display name
  const getDisplayName = (): string => {
    if (!user) return "Guest";
    return user.user_metadata?.full_name || user.email || "User";
  };

  // Get avatar URL
  const getAvatarUrl = (): string | null => {
    if (!user) return null;
    return user.user_metadata?.avatar_url || null;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarAction}
              className="mr-1 text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 text-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <circle cx="50" cy="50" r="8" />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="45"
                  ry="17"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="45"
                  ry="17"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  transform="rotate(60 50 50)"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="45"
                  ry="17"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  transform="rotate(-60 50 50)"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-emerald-600">
              evalo
            </span>
          </Link>
        </div>

        {/* Action Search Bar in the middle - only show when logged in */}
        {user && (
          <div className="flex-1 flex justify-center max-w-xl mx-4">
            <ActionSearchBar />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Theme toggle placed to the left of the bell icon */}
          <ThemeToggle />

          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          )}

          {user ? (
            // Show user menu when logged in
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl() || ""} alt="User avatar" />
                    <AvatarFallback className="bg-emerald-100 text-emerald-800">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Show login button when not logged in
            <Button asChild variant="default">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
