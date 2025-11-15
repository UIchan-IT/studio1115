"use client";

import AppSidebar from "@/components/layout/sidebar";
import AppHeader from "@/components/layout/header";
import { SidebarProvider } from "@/hooks/use-sidebar.tsx";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect only if not loading, user is null, and user is not anonymous.
    // Anonymous users are allowed for debugging/testing purposes.
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);


  // Show skeleton loader while checking for auth state or if there's no user yet (and not anonymous)
  if (loading || (!user && user?.isAnonymous === false)) {
    return (
       <div className="flex h-screen bg-background">
        <div className="hidden sm:block w-64 border-r bg-background p-4">
          <div className="flex h-14 items-center px-2 lg:px-4 mb-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-4">
             <Skeleton className="h-8" />
             <Skeleton className="h-8" />
          </div>
        </div>
        <div className="flex flex-col flex-1">
           <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex-1" />
            <Skeleton className="h-8 w-8 rounded-full" />
           </header>
          <main className="flex-1 p-4 md:p-8">
            <Skeleton className="h-full w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1 sm:ml-64">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
