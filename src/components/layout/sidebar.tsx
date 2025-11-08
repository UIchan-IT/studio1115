"use client";

import SidebarNav from "./sidebar-nav";
import { useCollection, useUser } from "@/firebase";
import type { WordList } from "@/lib/definitions";
import { Skeleton } from "../ui/skeleton";
import { useMemo } from "react";

export default function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { user } = useUser();
  const { data: myWordLists, loading: myListsLoading } = useCollection<WordList>(
    "wordLists",
    user ? { whereClauses: [["ownerId", "==", user.uid]] } : { skip: true }
  );

  const { data: publicWordLists, loading: publicListsLoading } = useCollection<WordList>(
    "wordLists",
    { whereClauses: [["isPublic", "==", true]] }
  );

  const allWordLists = useMemo(() => {
    const combined = [...myWordLists];
    const myIds = new Set(myWordLists.map(l => l.id));
    publicWordLists.forEach(publicList => {
      if (!myIds.has(publicList.id)) {
        combined.push(publicList);
      }
    });
    return combined.sort((a, b) => (a.name > b.name) ? 1 : -1);
  }, [myWordLists, publicWordLists]);

  const loading = myListsLoading || publicListsLoading;

  if (loading && !isMobile) {
    return (
       <aside className="fixed top-0 left-0 z-40 w-64 h-screen border-r bg-background transition-transform sm:translate-x-0">
          <div className="flex h-full flex-col p-4 space-y-4">
             <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 -m-4 mb-0">
                <Skeleton className="h-6 w-32" />
             </div>
             <Skeleton className="h-8" />
             <Skeleton className="h-8" />
             <Skeleton className="h-8" />
          </div>
       </aside>
    );
  }

  return (
    <SidebarNav wordLists={allWordLists} isMobile={isMobile}/>
  );
}