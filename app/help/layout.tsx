"use client";

import React, { useState } from "react";
import { TopNav } from "@/components/top-nav";
import { Sidebar } from "@/components/sidebar";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebarAction = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav toggleSidebarAction={toggleSidebarAction} />
      <div className="flex-1 flex">
        {/* Sidebar with visibility toggle */}
        <Sidebar isVisible={sidebarVisible} />

        {/* Main content area */}
        <main className="flex-1 p-6 transition-all duration-300 ease-in-out">
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
