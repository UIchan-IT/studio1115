"use client";

import { useUser, useFirestore } from "@/firebase";
import type { UserWordProgress, Word, WordList } from "@/lib/definitions";
import { useMemo, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, AlertCircle } from "lucide-react";
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
  
  const [allWordLists, setAllWordLists] = useState<WordList[]>([]);
  const [listsLoading, setListsLoading] = useState(true);

  const { data: userProgressData, loading: progressLoading } = useCollection<UserWordProgress>(
    user ? `users/${user.uid}/wordProgress` : "",
    { skip: !user }
  );

  useEffect(() => {
    if (user && firestore) {
      const fetchLists = async () => {
        setListsLoading(true);
        const myListsQuery = query(collection(firestore, "wordLists"), where("ownerId", "==", user.uid));
        const publicListsQuery = query(collection(firestore, "wordLists"), where("isPublic", "==", true));

        const [myListsSnapshot, publicListsSnapshot] = await Promise.all([
          getDocs(myListsQuery),
          getDocs(publicListsQuery),
        ]);

        const myLists = myListsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WordList));
        const publicLists = publicListsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WordList));

        const combined = [...myLists];
        const myIds = new Set(myLists.map(l => l.id));
        publicLists.forEach(publicList => {
          if (!myIds.has(publicList.id)) {
            combined.push(publicList);
          }
        });
        setAllWordLists(combined);
        setListsLoading(false);
      }
      fetchLists();
    } else if (!userLoading) {
      setListsLoading(false);
    }
  }, [user, firestore, userLoading]);

  useEffect(() => {
    if (allWordLists.length > 0 && firestore) {
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
    } else if (!listsLoading) {
      setWordListsWithWords([]);
      setWordsLoading(false);
    }
  }, [allWordLists, firestore, listsLoading]);

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


  const isLoading = userLoading || listsLoading || wordsLoading || progressLoading;

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
            {weakWords.map(word => (
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
