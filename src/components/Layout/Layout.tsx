import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  children: React.ReactNode;
}

export function Layout({
  children,
}: Props) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "transition-all duration-300 border-r border-slate-200 bg-white shadow-sm z-20",
            isSidebarOpen ? "w-72" : "w-0 overflow-hidden"
          )}
        >
          <Sidebar className="w-72" />
        </aside>
      )}

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-r-0">
          <Sidebar onNavItemClick={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <DashboardHeader
          onMenuClick={() => {
            if (isMobile) {
              setIsMobileMenuOpen(true);
            } else {
              setIsSidebarOpen(!isSidebarOpen);
            }
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
