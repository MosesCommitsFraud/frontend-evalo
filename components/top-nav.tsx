"use client";

import Link from "next/link";
import { BellIcon, Search, Settings, User } from "lucide-react";
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

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 w-full max-w-md">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-600 px-2 py-1">
              <span className="text-lg font-bold text-white">evalo</span>
            </div>
          </Link>
          <div className="w-full relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="w-full pl-8 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2">
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
