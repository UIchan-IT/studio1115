
"use client";

import { useCollection, useDoc, useUser } from "@/firebase";
import type { Stats, WordList, Word, UserWordProgress, UserProfile } from "@/lib/definitions";
import StatsCards from "@/components/dashboard/stats-cards";
import WordLists from "@/components/dashboard/word-lists";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, getDocs } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useState, useEffect } from "react";
import WeakWords from "@/components/dashboard/weak-words";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WordListWithWords extends WordList {
  words: Word[];
}

function calculateStats(wordLists: WordListWithWords[], allProgress: UserWordProgress[], userProfile: UserProfile | null): Stats {
  if (!wordLists || !allProgress) {
    return { totalWords: 0, wordsLearned: 0, needsReview: 0, score: 0 };
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
  const score = userProfile?.score ?? 0;
  
  return { totalWords, wordsLearned, needsReview, score };
}


export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>('users', user?.uid ?? '', { skip: userLoading || !user });
  
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


  const stats = useMemo(() => {
    if (!user) return { totalWords: 0, wordsLearned: 0, needsReview: 0, score: 0 };
    // Only calculate stats for the user's own lists
    const myListsWithWords = wordListsWithWords.filter(l => l.ownerId === user?.uid);
    return calculateStats(myListsWithWords, userProgressData, userProfile);
  }, [wordListsWithWords, userProgressData, user, userProfile]);

  const weakWords = useMemo(() => {
    if (!userProgressData || wordListsWithWords.length === 0) return [];
    
    const allWords = wordListsWithWords.flatMap(list => list.words || []);
    const progressMap = new Map(userProgressData.map(p => [p.id, p]));
    
    return allWords
      .map(word => ({
        ...word,
        progress: progressMap.get(word.id)
      }))
      .filter(word => word.progress && word.progress.testCount > 0) // Must have been tested at least once
      .sort((a, b) => (b.progress?.mistakeCount ?? 0) - (a.progress?.mistakeCount ?? 0))
      .slice(0, 10);
  }, [wordListsWithWords, userProgressData]);
  
  const isLoading = userLoading || myListsLoading || publicListsLoading || wordsLoading || progressLoading || profileLoading;

  if (isLoading) {
    return (
       <div className="container mx-auto">
         <div className="space-y-8">
           <header>
             <Skeleton className="h-9 w-64 mb-2" />
             <Skeleton className="h-5 w-80" />
           </header>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
           </div>
           <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <Skeleton className="h-9 w-48 mb-4" />
                <Skeleton className="h-56" />
              </div>
              <div>
                <Skeleton className="h-9 w-48 mb-4" />
                <Skeleton className="h-56" />
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <WordLists initialWordLists={wordListsWithWords} />
            </div>
            <div>
                 <h2 className="text-2xl font-bold font-headline mb-4">Weak Words</h2>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Top 10 to Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <WeakWords words={weakWords} />
                    </CardContent>
                 </Card>
            </div>
        </div>

      </div>
    </div>
  );
}
