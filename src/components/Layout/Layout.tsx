import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export function Layout({
  children,
}: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          "border-r bg-gray-50/40 transition-all duration-300",
          isSidebarOpen ? "w-72" : "w-0 overflow-hidden"
        )}
      >
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
