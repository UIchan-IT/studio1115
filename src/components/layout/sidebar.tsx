"use client";

import SidebarNav from "./sidebar-nav";
import { useCollection, useUser, useFirestore } from "@/firebase";
import type { WordList, Word } from "@/lib/definitions";
import { Skeleton } from "../ui/skeleton";
import { useMemo, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { updateWordStats } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface WordListWithWords extends WordList {
  words: Word[];
}

export default function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [wordListsWithWords, setWordListsWithWords] = useState<WordListWithWords[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [isAutoTesting, setIsAutoTesting] = useState(false);

  const { data: myWordLists, loading: myListsLoading } = useCollection<WordList>(
    "wordLists",
    user ? { whereClauses: [["ownerId", "==", user.uid]] } : { skip: true }
  );

  const { data: publicWordLists, loading: publicListsLoading } = useCollection<WordList>(
    "wordLists",
    { whereClauses: [["isPublic", "==", true]] }
  );

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

  const allWords = useMemo(() => {
      return wordListsWithWords.flatMap(list => list.words || []);
  }, [wordListsWithWords])


  const handleAutoTest = async () => {
    if (!user || allWords.length === 0) {
        toast({ variant: "destructive", title: "Cannot run test", description: "No user or words available."});
        return;
    }
    setIsAutoTesting(true);
    const runs = 5;
    const questionsPerRun = 10;
    
    toast({ title: "Starting Auto-Test...", description: `${runs * questionsPerRun} total questions will be simulated.`});

    for (let i = 0; i < runs; i++) {
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, questionsPerRun);

        for (const word of selectedWords) {
            // ~30% chance to be incorrect
            const isCorrect = Math.random() > 0.3;
            await updateWordStats(firestore, user.uid, word.id, isCorrect);
        }
    }
    
    toast({
        title: "Debug Test Complete",
        description: `${runs} runs of ${questionsPerRun} questions completed.`,
    });
    setIsAutoTesting(false);
  };


  const loading = myListsLoading || publicListsLoading || wordsLoading;

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
             <div className="mt-auto space-y-2 border-t pt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
             </div>
          </div>
       </aside>
    );
  }

  return (
    <SidebarNav
        wordLists={allWordLists}
        isMobile={isMobile}
        onAutoTest={handleAutoTest}
        isAutoTesting={isAutoTesting}
    />
  );
}
