"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Globe,
  ChevronDown
} from "lucide-react";

import { LexicalLeapLogo } from "../icons";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import type { WordList, Word } from "@/lib/definitions";
import { useSidebar } from "@/hooks/use-sidebar.tsx";
import WeakWords from "../dashboard/weak-words";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SidebarNav({ wordLists, weakWords, isMobile }: { wordLists: WordList[], weakWords: Word[], isMobile: boolean }) {
  const pathname = usePathname();
  const { isSidebarOpen } = useSidebar();

  const sidebarClasses = cn(
    "fixed top-0 left-0 z-40 w-64 h-screen border-r bg-background transition-transform -translate-x-full sm:translate-x-0",
    isMobile && (isSidebarOpen ? "translate-x-0" : "-translate-x-full"),
  );

  return (
    <aside className={cn(sidebarClasses, isMobile && "w-full")}>
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
                  {list.isPublic ? <Globe className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  <span className="truncate">{list.name}</span>
                </Link>
              ))}
            </div>
            
            <Accordion type="single" collapsible className="w-full" defaultValue="review">
              <AccordionItem value="review" className="border-b-0">
                 <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline hover:text-primary [&[data-state=open]>svg]:text-primary">
                    Review
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 px-2 pt-2">
                    <WeakWords words={weakWords} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}

const mainNav = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
  ];
