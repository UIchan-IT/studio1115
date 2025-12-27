"use client";

import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BadgesPage() {
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
        <Card>
            <CardContent className="p-8 text-center">
                <p className="text-lg font-medium">Coming Soon!</p>
                <p className="text-muted-foreground">The badge system is under construction. Keep learning to be the first to earn them!</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
