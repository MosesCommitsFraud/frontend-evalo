"use client";

import React from "react";
import { TopNav } from "@/components/top-nav";
import { Sidebar } from "@/components/sidebar"; // Import the new consolidated sidebar

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex-1 flex">
        {/* Single consolidated sidebar component */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 p-6 max-w-[1200px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
