"use client";

import SidebarNav from "./sidebar-nav";
import { useCollection, useUser, useFirestore } from "@/firebase";
import type { WordList, UserWordProgress, Word } from "@/lib/definitions";
import { Skeleton } from "../ui/skeleton";
import { useMemo, useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";

interface WordListWithWords extends WordList {
  words: Word[];
}

export default function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const { data: myWordLists, loading: myListsLoading } = useCollection<WordList>(
    "wordLists",
    user ? { whereClauses: [["ownerId", "==", user.uid]] } : { skip: true }
  );

  const { data: publicWordLists, loading: publicListsLoading } = useCollection<WordList>(
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
    const combined = [...myWordLists];
    const myIds = new Set(myWordLists.map(l => l.id));
    publicWordLists.forEach(publicList => {
      if (!myIds.has(publicList.id)) {
        combined.push(publicList);
      }
    });
    return combined.sort((a, b) => (a.name > b.name) ? 1 : -1);
  }, [myWordLists, publicWordLists]);


  useEffect(() => {
    const listsLoading = myListsLoading || publicListsLoading;
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
  }, [allWordLists, firestore, myListsLoading, publicListsLoading]);

  const allWordsWithProgress = useMemo(() => {
    const allWords = wordListsWithWords.flatMap(list => list.words || []);
    if (!userProgressData) return allWords;
    const progressMap = new Map(userProgressData.map(p => [p.id, p]));
    return allWords.map(word => ({
      ...word,
      progress: progressMap.get(word.id)
    }));
  }, [wordListsWithWords, userProgressData]);
  
  const weakWords = useMemo(() => {
    return allWordsWithProgress
      .filter((word) => word.progress && word.progress.mistakeCount > 0)
      .sort((a, b) => (b.progress?.mistakeCount ?? 0) - (a.progress?.mistakeCount ?? 0))
      .slice(0, 5);
  }, [allWordsWithProgress]);

  const loading = myListsLoading || publicListsLoading || wordsLoading || progressLoading;

  if (loading && !isMobile) {
    return (
       <aside className="fixed top-0 left-0 z-40 w-64 h-screen border-r bg-background transition-transform sm:translate-x-0">
          <div className="flex h-full flex-col p-4 space-y-4">
             <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 -m-4 mb-0">
                <Skeleton className="h-6 w-32" />
             </div>
             <Skeleton className="h-8" />
             <Skeleton className="h-8" />
             <Skeleton className="h-8" />
             <div className="mt-auto space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
             </div>
          </div>
       </aside>
    );
  }

  return (
    <SidebarNav wordLists={allWordLists} weakWords={weakWords} isMobile={isMobile}/>
  );
}
