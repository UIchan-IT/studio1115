"use client";

import { useCollection, useUser } from "@/firebase";
import type { Stats, WordList, Word } from "@/lib/definitions";
import StatsCards from "@/components/dashboard/stats-cards";
import WordLists from "@/components/dashboard/word-lists";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useState, useEffect } from "react";

interface WordListWithWords extends WordList {
  words: Word[];
}

function calculateStats(wordLists: WordListWithWords[]): Stats {
  if (!wordLists) {
    return { totalWords: 0, wordsLearned: 0, needsReview: 0 };
  }
  const allWords = wordLists.flatMap(list => list.words || []);
  const totalWords = allWords.length;
  const wordsLearned = allWords.filter(word => word.masteryLevel && word.masteryLevel >= 4).length;
  const needsReview = allWords.filter(word => word.masteryLevel && word.masteryLevel > 0 && word.masteryLevel < 4).length;
  
  return { totalWords, wordsLearned, needsReview };
}


export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  
  const { data: wordListsData, loading: listsLoading } = useCollection<WordList>(
    "wordLists",
    user ? { whereClauses: [["ownerId", "==", user.uid]] } : { skip: true }
  );

  const [wordListsWithWords, setWordListsWithWords] = useState<WordListWithWords[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);

  useEffect(() => {
    if (wordListsData.length > 0) {
      const fetchAllWords = async () => {
        setWordsLoading(true);
        const listsWithWords = await Promise.all(wordListsData.map(async (list) => {
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
  }, [wordListsData, firestore, listsLoading]);


  const stats = useMemo(() => {
    return calculateStats(wordListsWithWords);
  }, [wordListsWithWords]);
  
  const isLoading = userLoading || listsLoading || wordsLoading;

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
            <div>
              <div className="flex items-center justify-between mb-4">
                 <Skeleton className="h-9 w-48" />
                 <Skeleton className="h-10 w-40" />
              </div>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-56" />
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
        
        <WordLists initialWordLists={wordListsWithWords} />
      </div>
    </div>
  );
}
