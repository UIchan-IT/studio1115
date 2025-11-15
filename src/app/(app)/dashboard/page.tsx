"use client";

import { useCollection, useUser } from "@/firebase";
import type { Stats, WordList, Word, UserWordProgress } from "@/lib/definitions";
import StatsCards from "@/components/dashboard/stats-cards";
import WordLists from "@/components/dashboard/word-lists";
import WeakWords from "@/components/dashboard/weak-words";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useState, useEffect } from "react";

interface WordListWithWords extends WordList {
  words: Word[];
}

function calculateStats(wordLists: WordListWithWords[], allProgress: UserWordProgress[]): Stats {
  if (!wordLists || !allProgress) {
    return { totalWords: 0, wordsLearned: 0, needsReview: 0 };
  }
  
  const allWords = wordLists.flatMap(list => list.words || []);
  const progressMap = new Map(allProgress.map(p => [p.id, p]));

  const wordsWithProgress = allWords.map(word => ({
    ...word,
    progress: progressMap.get(word.id),
  }));

  const totalWords = wordsWithProgress.length;
  const wordsLearned = wordsWithProgress.filter(word => word.progress && word.progress.masteryLevel >= 4).length;
  const needsReview = wordsWithProgress.filter(word => word.progress && word.progress.masteryLevel > 0 && word.progress.masteryLevel < 4).length;
  
  return { totalWords, wordsLearned, needsReview };
}


export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  
  const { data: myWordListsData, loading: myListsLoading } = useCollection<WordList>(
    "wordLists",
    user ? { whereClauses: [["ownerId", "==", user.uid]] } : { skip: true }
  );
  
  const { data: publicWordListsData, loading: publicListsLoading } = useCollection<WordList>(
    "wordLists",
    { whereClauses: [["isPublic", "==", true]] }
  );
  
  const { data: userProgressData, loading: progressLoading } = useCollection<UserWordProgress>(
    user ? `users/${user.uid}/wordProgress` : "",
    { skip: !user }
  );

  const [wordListsWithWords, setWordListsWithWords] = useState<WordListWithWords[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  
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

  const allWordsWithProgress = useMemo(() => {
    const allWords = wordListsWithWords.flatMap(list => list.words || []);
    if (!userProgressData) return allWords;
    const progressMap = new Map(userProgressData.map(p => [p.id, p]));
    return allWords.map(word => ({
      ...word,
      progress: progressMap.get(word.id)
    }));
  }, [wordListsWithWords, userProgressData]);


  useEffect(() => {
    const listsLoading = myListsLoading || publicListsLoading;
    if (allWordLists.length > 0) {
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
  }, [allWordLists, firestore, myListsLoading, publicListsLoading]);


  const stats = useMemo(() => {
    if (!user) return { totalWords: 0, wordsLearned: 0, needsReview: 0 };
    // Only calculate stats for the user's own lists
    const myListsWithWords = wordListsWithWords.filter(l => l.ownerId === user?.uid);
    return calculateStats(myListsWithWords, userProgressData);
  }, [wordListsWithWords, userProgressData, user]);
  
  const isLoading = userLoading || myListsLoading || publicListsLoading || wordsLoading || progressLoading;

  if (isLoading) {
    return (
       <div className="container mx-auto">
         <div className="space-y-8">
           <header>
             <Skeleton className="h-9 w-64 mb-2" />
             <Skeleton className="h-5 w-80" />
           </header>
           <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
           </div>
           <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-10 w-40" />
              </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-56" />
                    <Skeleton className="h-56" />
                </div>
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-9 w-48 mb-4" />
                <Skeleton className="h-80" />
              </div>
           </div>
         </div>
       </div>
    )
  }


  return (
    <div className="container mx-auto">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">
            Here's an overview of your vocabulary progress.
          </p>
        </header>

        <StatsCards stats={stats} />
        
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <WordLists initialWordLists={wordListsWithWords} />
            </div>
            <div className="lg:col-span-1">
                <WeakWords words={allWordsWithProgress} />
            </div>
        </div>

      </div>
    </div>
  );
}
