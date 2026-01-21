
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import type { UserWordProgress, Word, WordList } from "@/lib/definitions";
import { useMemo, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface WordListWithWords extends WordList {
  words: Word[];
}

export default function ReviewPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [wordListsWithWords, setWordListsWithWords] = useState<WordListWithWords[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 5;

  const { data: myWordListsData, loading: myListsLoading } = useCollection<WordList>(
    "wordLists",
    { whereClauses: [["ownerId", "==", user?.uid]], skip: userLoading || !user }
  );

  const { data: publicWordListsData, loading: publicListsLoading } = useCollection<WordList>(
    "wordLists",
    { whereClauses: [["isPublic", "==", true]], skip: userLoading || !user }
  );
  
  const { data: userProgressData, loading: progressLoading } = useCollection<UserWordProgress>(
    user ? `users/${user.uid}/wordProgress` : "",
    { skip: userLoading || !user }
  );

  const allWordLists = useMemo(() => {
    const combined = [...myWordListsData];
    const myIds = new Set(myWordListsData.map(l => l.id));
    publicWordListsData.forEach(publicList => {
      if (!myIds.has(publicList.id)) {
        combined.push(publicList);
      }
    });
    return combined;
  }, [myWordListsData, publicWordListsData]);


  useEffect(() => {
    const listsLoading = myListsLoading || publicListsLoading;
    if (allWordLists.length > 0 && firestore && !userLoading) {
      const fetchAllWords = async () => {
        setWordsLoading(true);
        const listsWithWords = await Promise.all(allWordLists.map(async (list) => {
          const wordsSnapshot = await getDocs(collection(firestore, "wordLists", list.id, "words"));
          const words = wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Word));
          return { ...list, words };
        }));
        setWordListsWithWords(listsWithWords);
        setWordsLoading(false);
      };
      fetchAllWords();
    } else if (!listsLoading && !userLoading) {
      setWordListsWithWords([]);
      setWordsLoading(false);
    }
  }, [allWordLists, firestore, myListsLoading, publicListsLoading, userLoading]);


  const weakWords = useMemo(() => {
    if (!userProgressData || wordListsWithWords.length === 0) return [];
    
    const allWords = wordListsWithWords.flatMap(list => list.words || []);
    const progressMap = new Map(userProgressData.map(p => [p.id, p]));
    
    return allWords
      .map(word => ({
        ...word,
        progress: progressMap.get(word.id)
      }))
      .filter((word) => word.progress && word.progress.mistakeCount > 0)
      .sort((a, b) => (b.progress?.mistakeCount ?? 0) - (a.progress?.mistakeCount ?? 0));
  }, [wordListsWithWords, userProgressData]);
  
  const totalPages = Math.ceil(weakWords.length / wordsPerPage);
  const paginatedWords = weakWords.slice(
    (currentPage - 1) * wordsPerPage,
    currentPage * wordsPerPage
  );

  const isLoading = userLoading || myListsLoading || publicListsLoading || wordsLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="space-y-8">
          <header>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </header>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Target className="h-8 w-8" />
            Review Weak Words
          </h1>
          <p className="text-muted-foreground">
            Focus on the words you've had the most trouble with.
          </p>
        </header>

        {weakWords.length > 0 ? (
           <div className="space-y-4">
            {paginatedWords.map(word => (
              <Card key={word.id}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <CardTitle>{word.text}</CardTitle>
                         <div className="text-sm font-semibold text-destructive flex items-center gap-2">
                             <span>Mistakes: {word.progress?.mistakeCount}</span>
                         </div>
                    </div>
                  <CardDescription>{word.definition}</CardDescription>
                </CardHeader>
              </Card>
            ))}
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
           </div>
        ) : (
             <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg mt-16">
                <AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No Weak Words Found</p>
                <p className="text-muted-foreground">You haven't made any mistakes yet. Keep up the great work!</p>
                <Button asChild className="mt-4">
                  <Link href={`/dashboard`}>Back to Dashboard</Link>
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
