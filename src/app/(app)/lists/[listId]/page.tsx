
"use client";

import WordListHeader from "@/components/word-lists/word-list-header";
import WordTableWrapper from "@/components/word-lists/word-table-wrapper";
import { notFound, useParams } from "next/navigation";
import { useDoc, useCollection, useUser } from "@/firebase";
import type { Word, WordList, UserWordProgress } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

export default function WordListPage() {
  const params = useParams();
  const listId = params.listId as string;
  const { user, loading: userLoading } = useUser();

  const { data: wordList, loading: listLoading } = useDoc<WordList>("wordLists", listId, { skip: userLoading });
  const { data: wordsData, loading: wordsLoading } = useCollection<Word>(`wordLists/${listId}/words`, { skip: userLoading });
  const { data: userProgressData, loading: progressLoading } = useCollection<UserWordProgress>(
    user ? `users/${user.uid}/wordProgress` : "",
    { skip: userLoading || !user }
  );

  const wordsWithProgress = useMemo(() => {
    if (!wordsData) return [];
    const progressMap = new Map(userProgressData.map(p => [p.id, p]));
    return wordsData.map(word => ({
      ...word,
      progress: progressMap.get(word.id)
    }));
  }, [wordsData, userProgressData]);

  if (userLoading || listLoading || wordsLoading || progressLoading) {
    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                  <Skeleton className="h-9 w-64 mb-2" />
                  <Skeleton className="h-5 w-80" />
              </div>
              <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
              </div>
            </header>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-36" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
  }

  if (!wordList) {
    notFound();
  }
  
  const fullWordList = { ...wordList, words: wordsWithProgress };

  return (
    <div className="space-y-6">
      <WordListHeader wordList={fullWordList} />
      <WordTableWrapper wordList={fullWordList} />
    </div>
  );
}
