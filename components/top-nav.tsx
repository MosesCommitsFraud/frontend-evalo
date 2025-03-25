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
import { useState, useEffect } from "react";

// Define proper type for the toggleSidebar prop
interface TopNavProps {
  toggleSidebarAction: () => void;
}

export function TopNav({ toggleSidebarAction }: TopNavProps) {
  // First, call all hooks unconditionally to maintain hook order
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Always call useAuth - we'll handle the conditional access to its values below
  const auth = useAuth();

  // Use useEffect to set isClient to true after component has mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Now use the auth context safely after all hooks have been called
  // Only use the values when on client side
  const user = isClient ? auth.user : null;
  const signOut = async () => {
    if (isClient) {
      return auth.signOut();
    }
  };

  // Determine if we're on a page that would show the sidebar toggle
  const showSidebarToggle = user && !pathname?.startsWith("/auth/");

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
                viewBox="0 0 562 653"
                fill="currentColor"
              >
                <g transform="translate(0,653) scale(0.1,-0.1)">
                  <path
                    d="M2698 6446 c-58 -16 -202 -97 -1203 -683 -132 -77 -483 -281 -780
                  -454 -339 -197 -558 -330 -588 -358 -59 -55 -103 -144 -117 -236 -7 -47 -10
                  -535 -8 -1490 3 -1592 -3 -1457 77 -1575 47 -71 65 -82 711 -457 289 -167 622
                  -361 740 -430 804 -470 1101 -640 1145 -655 64 -22 179 -23 242 -2 43 15 175
                  89 543 304 201 118 937 546 1455 846 401 232 510 300 555 344 59 58 94 120
                  110 198 7 31 10 554 8 1507 l-3 1460 -28 59 c-40 86 -87 139 -170 189 -39 24
                  -283 167 -542 317 -460 268 -838 488 -1520 886 -187 109 -369 208 -405 221
                  -73 25 -150 28 -222 9z m218 -481 c27 -8 225 -116 439 -241 215 -124 518 -301
                  675 -392 968 -561 982 -570 1042 -633 36 -38 66 -82 80 -117 l23 -57 0 -1255
                  0 -1255 -33 -68 c-53 -107 -98 -143 -397 -316 -148 -87 -605 -352 -1015 -591
                  -410 -238 -765 -441 -790 -451 -104 -40 -223 -33 -324 18 -27 14 -237 134
                  -465 268 -229 133 -492 286 -586 340 -694 401 -995 581 -1033 618 -53 52 -99
                  143 -112 222 -14 83 -13 2374 0 2446 15 77 54 153 109 208 36 35 187 128 587
                  361 296 172 726 422 955 556 495 288 557 322 612 340 57 17 173 17 233 -1z"
                  />
                  <path
                    d="M2735 5390 c-27 -4 -66 -14 -85 -22 -32 -14 -593 -340 -1042 -605
                  -98 -58 -178 -111 -178 -118 0 -13 44 -40 630 -382 212 -124 426 -249 475
                  -278 119 -70 173 -88 265 -88 57 0 90 6 135 25 50 20 796 450 1120 645 90 54
                  123 79 114 87 -29 27 -1175 691 -1229 712 -66 26 -137 34 -205 24z"
                  />
                  <path
                    d="M1008 3843 c-2 -175 0 -332 4 -349 5 -17 18 -40 30 -51 25 -23 232
                  -146 1033 -613 582 -339 572 -334 643 -349 136 -29 181 -13 522 186 1232 719
                  1313 767 1331 797 17 29 19 57 19 364 0 182 -2 332 -4 332 -3 0 -326 -188
                  -806 -470 -556 -326 -815 -474 -854 -488 -22 -8 -71 -17 -107 -19 -126 -10
                  -94 -26 -1089 557 -276 163 -683 400 -712 417 -4 2 -8 -139 -10 -314z"
                  />
                  <path
                    d="M1008 2518 c-2 -391 -3 -387 20 -418 11 -14 68 -54 128 -89 60 -35
                  233 -137 384 -226 591 -348 1093 -637 1133 -652 61 -22 190 -20 253 4 51 20
                  278 150 1039 596 226 132 452 264 503 294 60 35 97 64 107 83 23 44 22 735 0
                  726 -8 -3 -210 -120 -448 -259 -237 -140 -486 -285 -552 -322 -66 -38 -229
                  -133 -362 -211 -134 -79 -264 -151 -290 -160 -67 -24 -193 -22 -258 3 -27 11
                  -169 89 -315 175 -146 85 -416 243 -600 350 -184 108 -424 248 -533 312 -108
                  64 -200 116 -202 116 -3 0 -6 -145 -7 -322z"
                  />
                </g>
              </svg>
            </div>
            <span className="text-xl font-semibold text-emerald-600">
              evalo
            </span>
          </Link>
        </div>

        {/* Action Search Bar in the middle - only show when logged in */}
        {isClient && user && (
          <div className="flex-1 flex justify-center max-w-xl mx-4">
            <ActionSearchBar />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Theme toggle placed to the left of the bell icon */}
          <ThemeToggle />

          {isClient && user && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          )}

          {isClient && user ? (
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
