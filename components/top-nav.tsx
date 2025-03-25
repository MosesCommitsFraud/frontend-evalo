"use client";

import Link from "next/link";
import {
  BellIcon,
  Menu,
  Settings,
  User,
  LogOut,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import ActionSearchBar from "@/components/action-search-bar";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { dataService } from "@/lib/data-service";

// Define proper type for the toggleSidebar prop
interface TopNavProps {
  toggleSidebarAction: () => void;
}

// Define type for notification
interface FeedbackNotification {
  id: string;
  event_id: string;
  course_name: string;
  student_name: string | null;
  content: string;
  tone: "positive" | "negative" | "neutral";
  created_at: string;
}

export function TopNav({ toggleSidebarAction }: TopNavProps) {
  // First, call all hooks unconditionally to maintain hook order
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // State for profile avatar
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);

  // State for notifications
  const [notifications, setNotifications] = useState<FeedbackNotification[]>(
    [],
  );
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

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

  // Fetch user's profile avatar when user is authenticated
  useEffect(() => {
    const fetchProfileAvatar = async () => {
      if (!user) {
        setProfileAvatarUrl(null);
        setLoadingAvatar(false);
        return;
      }

      setLoadingAvatar(true);
      try {
        const { data, error } = await dataService.getProfile();

        if (error) {
          console.error("Error fetching profile for avatar:", error);
          setProfileAvatarUrl(null);
        } else if (data && data.avatar_url) {
          console.log("Fetched profile avatar URL:", data.avatar_url);
          setProfileAvatarUrl(data.avatar_url);
        } else {
          setProfileAvatarUrl(null);
        }
      } catch (err) {
        console.error("Exception fetching profile avatar:", err);
        setProfileAvatarUrl(null);
      } finally {
        setLoadingAvatar(false);
      }
    };

    if (isClient && user) {
      fetchProfileAvatar();
    } else {
      setProfileAvatarUrl(null);
      setLoadingAvatar(false);
    }
  }, [isClient, user]);

  // Fetch unseen notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setIsLoadingNotifications(false);
        return;
      }

      setIsLoadingNotifications(true);
      try {
        const { data, error } =
          await dataService.getUnseenFeedbackNotifications();

        if (error) {
          console.error("Error fetching notifications:", error);
          setNotifications([]);
        } else if (data && data.length > 0) {
          // Transform the data to match our notification interface
          const formattedNotifications: FeedbackNotification[] = data.map(
            (item) => ({
              id: item.id,
              event_id: item.event_id,
              course_name: item.events.courses.name,
              student_name: item.student_name,
              content: item.content,
              tone: item.tone,
              created_at: item.created_at,
            }),
          );
          setNotifications(formattedNotifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Exception fetching notifications:", err);
        setNotifications([]);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    if (isClient && user) {
      fetchNotifications();

      // Set up polling for new notifications (every 1 minute to be more responsive)
      const pollingInterval = setInterval(fetchNotifications, 60 * 1000);
      return () => clearInterval(pollingInterval);
    } else {
      setNotifications([]);
      setIsLoadingNotifications(false);
    }
  }, [isClient, user]);

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

  // Get avatar URL - prioritize profile avatar over user metadata
  const getAvatarUrl = (): string | null => {
    // First check profile avatar (from database)
    if (profileAvatarUrl) {
      return profileAvatarUrl;
    }

    // Fall back to user metadata (from auth)
    if (!user) return null;
    return user.user_metadata?.avatar_url || null;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Format relative time for notifications
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  };

  // Handle marking all notifications as seen
  const handleMarkAllAsSeen = async () => {
    try {
      await dataService.markAllNotificationsAsSeen();
      setNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as seen:", error);
    }
  };

  // Handle clicking on a notification
  const handleNotificationClick = async (
    notification: FeedbackNotification,
  ) => {
    try {
      // Mark just this notification as seen
      await dataService.markNotificationAsSeen(notification.id);

      // Remove it from the list
      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id),
      );

      // You could also navigate to the specific event page
      // Example: router.push(`/events/${notification.event_id}`);
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
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
            <div className="h-8 w-8 text-emerald-600 flex items-center">
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
            <DropdownMenu
              open={notificationMenuOpen}
              onOpenChange={(open) => {
                setNotificationMenuOpen(open);
                if (!open && notifications.length > 0) {
                  // Mark notifications as seen when closing the dropdown
                  handleMarkAllAsSeen();
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground relative"
                >
                  <BellIcon className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={handleMarkAllAsSeen}
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoadingNotifications ? (
                  <div className="px-4 py-3 text-sm text-center">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-center text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <DropdownMenuGroup className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start p-3 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex w-full justify-between">
                          <span className="font-medium">
                            {notification.course_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm gap-2 mt-1">
                          {notification.student_name && (
                            <span className="text-muted-foreground">
                              {notification.student_name}:
                            </span>
                          )}
                          <span
                            className={`text-sm ${
                              notification.tone === "positive"
                                ? "text-green-600"
                                : notification.tone === "negative"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {notification.content.length > 80
                              ? `${notification.content.substring(0, 80)}...`
                              : notification.content}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/feedback"
                    className="w-full text-center cursor-pointer"
                  >
                    View all feedback
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    <AvatarImage
                      src={getAvatarUrl() || ""}
                      alt="User avatar"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-emerald-100 text-emerald-800">
                      {loadingAvatar ? "..." : getUserInitials()}
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
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
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
