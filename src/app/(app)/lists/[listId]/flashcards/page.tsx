
"use client";

import { useDoc, useCollection, useUser } from "@/firebase";
import type { Word, WordList, UserWordProgress } from "@/lib/definitions";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

import FlashcardView from "@/components/learning/flashcard-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardsPage() {
  const params = useParams();
  const listId = params.listId as string;
  const { user, loading: userLoading } = useUser();

  const { data: wordList, loading: listLoading } = useDoc<WordList>("wordLists", listId, { skip: userLoading || !user });
  const { data: wordsData, loading: wordsLoading } = useCollection<Word>(`wordLists/${listId}/words`, { skip: userLoading || !user });
  const { data: userProgressData, loading: progressLoading } = useCollection<UserWordProgress>(
    user ? `users/${user.uid}/wordProgress` : "",
    { skip: userLoading || !user }
  );

  const words = useMemo(() => {
    if (!wordsData || !userProgressData) return [];
    const progressMap = new Map(userProgressData.map(p => [p.id, p]));
    return wordsData.map(word => ({
      ...word,
      progress: progressMap.get(word.id)
    }));
  }, [wordsData, userProgressData]);


  const isLoading = userLoading || listLoading || wordsLoading || progressLoading;

  if (isLoading) {
     return (
       <div className="container mx-auto h-full flex flex-col">
         <header className="mb-8">
           <Skeleton className="h-8 w-48 mb-4" />
           <Skeleton className="h-10 w-64 mb-2" />
           <Skeleton className="h-5 w-96" />
         </header>
         <div className="flex-grow flex items-center justify-center">
            <Skeleton className="w-full max-w-2xl h-96" />
         </div>
       </div>
     );
  }

  if (!wordList) {
    notFound();
  }

  return (
    <div className="container mx-auto h-full flex flex-col">
       <header className="mb-8">
          <Button asChild variant="ghost" className="-ml-4">
            <Link href={`/lists/${listId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {wordList.name}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold font-headline">Flashcards</h1>
          <p className="text-muted-foreground">Review words from your list: <span className="font-semibold text-foreground">{wordList.name}</span></p>
        </header>
      <div className="flex-grow flex items-center justify-center">
        <FlashcardView words={words} />
      </div>
    </div>
  );
}
