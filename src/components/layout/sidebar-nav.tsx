"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  List,
} from "lucide-react";

import { LexicalLeapLogo } from "../icons";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import type { WordList } from "@/lib/definitions";
import { useSidebar } from "@/hooks/use-sidebar";

export default function SidebarNav({ wordLists, isMobile }: { wordLists: WordList[], isMobile: boolean }) {
  const pathname = usePathname();
  const { isSidebarOpen } = useSidebar();

  const mainNav = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
  ];

  const sidebarClasses = cn(
    "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform",
    isMobile ? "" : "sm:translate-x-0",
    isMobile 
      ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") 
      : "-translate-x-full"
  );

  return (
    <aside className={sidebarClasses}>
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
            <LexicalLeapLogo className="h-6 w-6" />
            <span>Lexical Leap</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 space-y-4">
            <div className="space-y-1">
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</h3>
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Word Lists
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              {wordLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname.startsWith(`/lists/${list.id}`) && "bg-muted text-primary"
                  )}
                >
                  <List className="h-4 w-4" />
                  {list.name}
                </Link>
              ))}
            </div>
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}
