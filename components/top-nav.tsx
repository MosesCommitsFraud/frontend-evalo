"use client";

import Link from "next/link";
import { BellIcon, Menu, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function TopNav({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 w-full max-w-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-1 text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            {/* Inline SVG as fallback */}
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
          <div className="w-full relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="w-full pl-8 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle placed to the left of the bell icon */}
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <BellIcon className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User avatar" />
                  <AvatarFallback className="bg-emerald-100 text-emerald-800">
                    JS
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Smith</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john.smith@university.edu
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
