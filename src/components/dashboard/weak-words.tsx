"use client";

import { useMemo } from "react";
import type { Word } from "@/lib/definitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function WeakWords({ words }: { words: Word[] }) {
  const weakWords = useMemo(() => {
    return words
      .filter((word) => word.progress && word.progress.mistakeCount > 0)
      .sort((a, b) => (b.progress?.mistakeCount ?? 0) - (a.progress?.mistakeCount ?? 0))
      .slice(0, 5);
  }, [words]);

  return (
    <section>
      <h2 className="text-2xl font-bold font-headline mb-4">Words to Review</h2>
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Weakest Words</CardTitle>
          <CardDescription>Focus on these words that you've made the most mistakes on.</CardDescription>
        </CardHeader>
        <CardContent>
          {weakWords.length > 0 ? (
            <ul className="space-y-4">
              {weakWords.map((word) => (
                <li
                  key={word.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{word.text}</p>
                    <p className="text-sm text-muted-foreground">{word.definition}</p>
                  </div>
                  <div className="text-sm text-destructive font-semibold flex items-center gap-1">
                     {word.progress?.mistakeCount} mistakes
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-lg font-medium">No Mistakes Yet!</p>
                <p className="text-muted-foreground">Start a quiz or flashcard session to track your progress.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
