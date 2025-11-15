"use client";

import type { Word } from "@/lib/definitions";
import { AlertCircle } from "lucide-react";

export default function WeakWords({ words }: { words: Word[] }) {

  if (words.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
            <AlertCircle className="h-6 w-6 mb-1" />
            <p>No mistakes yet. Start a quiz!</p>
        </div>
      )
  }

  return (
    <ul className="space-y-3">
        {words.map((word) => (
        <li
            key={word.id}
            className="text-sm"
        >
            <div>
            <p className="font-semibold text-foreground truncate">{word.text}</p>
            <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{word.definition}</span>
                <span className="font-semibold text-destructive">
                    {word.progress?.mistakeCount}
                </span>
            </div>
            </div>
        </li>
        ))}
    </ul>
  );
}
