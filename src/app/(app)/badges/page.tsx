
"use client";

import { Award, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useUser } from "@/firebase";
import type { Badge, UserBadge } from "@/lib/definitions";
import { allBadges } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function BadgesPage() {
    const { user } = useUser();
    const { data: earnedBadges, loading } = useCollection<UserBadge>(
        user ? `users/${user.uid}/badges` : "",
        { skip: !user }
    );

    const earnedBadgeMap = new Map(earnedBadges.map(b => [b.id, b]));

    const badgesWithStatus = allBadges.map(badge => ({
        ...badge,
        isEarned: earnedBadgeMap.has(badge.id),
        earnedOn: earnedBadgeMap.get(badge.id)?.earnedOn
    }));

    if (loading) {
        return (
             <div className="container mx-auto">
                <header className="mb-8">
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        )
    }

  return (
    <div className="container mx-auto">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Your Badges
          </h1>
          <p className="text-muted-foreground">
            Achievements and milestones you've unlocked on your learning journey.
          </p>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {badgesWithStatus.map(badge => (
                <Card key={badge.id} className={cn("flex flex-col text-center transition-all", !badge.isEarned && "bg-muted/50")}>
                    <CardHeader className="items-center">
                        <div className={cn("p-4 rounded-full mb-2 w-20 h-20 flex items-center justify-center", badge.isEarned ? "bg-amber-400 text-white" : "bg-muted-foreground/20 text-muted-foreground")}>
                            {badge.isEarned ? <Award className="h-10 w-10" /> : <Lock className="h-10 w-10" />}
                        </div>
                        <CardTitle className={cn("text-lg", !badge.isEarned && "text-muted-foreground")}>{badge.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription>{badge.description}</CardDescription>
                         {badge.isEarned && badge.earnedOn && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Earned on {new Date((badge.earnedOn as any).seconds * 1000).toLocaleDateString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
