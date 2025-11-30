
"use client";

import { useDoc, useCollection, useUser } from "@/firebase";
import type { Word, WordList, UserWordProgress } from "@/lib/definitions";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MatchingQuizView from "@/components/learning/matching-quiz-view";

export default function MatchingQuizPage() {
  const params = useParams();
  const listId = params.listId as string;
  const { user } = useUser();

  const { data: wordList, loading: listLoading } = useDoc<WordList>("wordLists", listId);
  const { data: wordsData, loading: wordsLoading } = useCollection<Word>(`wordLists/${listId}/words`);
  const { data: userProgressData, loading: progressLoading } = useCollection<UserWordProgress>(
    user ? `users/${user.uid}/wordProgress` : "",
    { skip: !user }
  );

  const words = useMemo(() => {
    if (!wordsData || !userProgressData) return [];
    const progressMap = new Map(userProgressData.map(p => [p.id, p]));
    return wordsData.map(word => ({
      ...word,
      progress: progressMap.get(word.id)
    }));
  }, [wordsData, userProgressData]);
  
  const isLoading = listLoading || wordsLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto h-full flex flex-col">
        <header className="mb-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </header>
        <div className="flex-grow flex items-center justify-center">
           <Skeleton className="w-full max-w-4xl h-96" />
        </div>
      </div>
    );
  }

  if (!wordList || words.length < 10) {
    return (
       <div className="container mx-auto">
         <header className="mb-8">
            <Button asChild variant="ghost" className="-ml-4">
              <Link href={`/lists/${wordList?.id ?? '/dashboard'}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
              </Link>
            </Button>
            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl font-bold font-headline">Matching Quiz</h1>
              <span className="font-mono text-xs text-muted-foreground">10x10 v0.1.1</span>
            </div>
            <p className="text-muted-foreground">Test your knowledge on <span className="font-semibold text-foreground">{wordList?.name}</span></p>
          </header>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-lg font-medium">Not Enough Words for a Matching Quiz</p>
            <p className="text-muted-foreground">You need at least 10 words in this list to start this quiz.</p>
            <Button asChild className="mt-4">
              <Link href={`/lists/${wordList?.id ?? '/dashboard'}`}>Add More Words</Link>
            </Button>
          </div>
       </div>
    )
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
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-bold font-headline">Matching Quiz</h1>
            <span className="font-mono text-xs text-muted-foreground">10x10 v0.1.1</span>
          </div>
          <p className="text-muted-foreground">Match the words to their definitions from the list: <span className="font-semibold text-foreground">{wordList.name}</span></p>
        </header>
      <div className="flex-grow flex items-center justify-center">
        <MatchingQuizView words={words} />
      </div>
    </div>
  );
}

    