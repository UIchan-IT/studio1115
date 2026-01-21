
"use client";

import SidebarNav from "./sidebar-nav";
import { useCollection, useUser, useFirestore, useAuth, useAdmin } from "@/firebase";
import type { WordList, Word } from "@/lib/definitions";
import { Skeleton } from "../ui/skeleton";
import { useMemo, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { updateWordStats } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { signInAnonymously, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";


interface WordListWithWords extends WordList {
  words: Word[];
}

export default function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const { toast } = useToast();
  
  const [wordListsWithWords, setWordListsWithWords] = useState<WordListWithWords[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [isAutoTesting, setIsAutoTesting] = useState(false);
  const [isAnonymousTesting, setIsAnonymousTesting] = useState(false);
  const [isFourQuestionTesting, setIsFourQuestionTesting] = useState(false);


  const { data: myWordLists, loading: myListsLoading } = useCollection<WordList>(
    "wordLists",
    { whereClauses: [["ownerId", "==", user?.uid]], skip: userLoading || !user }
  );

  const { data: publicWordLists, loading: publicListsLoading } = useCollection<WordList>(
    "wordLists",
    { whereClauses: [["isPublic", "==", true]], skip: userLoading }
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
    const totalQuestions = runs * questionsPerRun;
    
    toast({ title: "Starting Auto-Test...", description: `${totalQuestions} total questions will be simulated.`});

    let promises = [];
    for (let i = 0; i < runs; i++) {
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, questionsPerRun);

        for (const word of selectedWords) {
            // ~30% chance to be incorrect
            const isCorrect = Math.random() > 0.3;
            promises.push(updateWordStats(firestore, user.uid, word.id, isCorrect));
        }
    }
    
    await Promise.all(promises);
    
    toast({
        title: "Debug Test Complete",
        description: `${totalQuestions} questions simulated across ${runs} runs.`,
    });
    setIsAutoTesting(false);
  };
  
    const handleAnonymousTest = async () => {
    setIsAnonymousTesting(true);
    toast({ title: "Starting Anonymous Test...", description: "Signing in anonymously and preparing test..." });

    try {
      // 1. Sign out current user if any, then sign in anonymously
      if (auth.currentUser) {
        await signOut(auth);
      }
      const userCredential = await signInAnonymously(auth);
      const anonUser = userCredential.user;

      // 2. Fetch public lists and their words
      const publicListsQuery = collection(firestore, "wordLists");
      const publicListsSnapshot = await getDocs(publicListsQuery);
      const publicLists = publicListsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WordList));

      const publicWords = (await Promise.all(publicLists.map(async (list) => {
        const wordsSnapshot = await getDocs(collection(firestore, "wordLists", list.id, "words"));
        return wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Word));
      }))).flat();

      if (publicWords.length < 1) {
        toast({ variant: "destructive", title: "Test Canceled", description: "No public words available to test." });
        setIsAnonymousTesting(false);
        return;
      }
      
      // 3. Run the test
      const runs = 10;
      const questionsPerRun = 10;
      const totalQuestions = runs * questionsPerRun;
      toast({ title: "Running Quiz Simulation", description: `${totalQuestions} questions will be simulated.` });

      let promises = [];
      for (let i = 0; i < runs; i++) {
        const shuffled = [...publicWords].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, questionsPerRun);
        for (const word of selectedWords) {
          const isCorrect = Math.random() > 0.3; // ~30% incorrect rate
          promises.push(updateWordStats(firestore, anonUser.uid, word.id, isCorrect));
        }
      }
      await Promise.all(promises);

      toast({ title: "Anonymous Test Complete", description: "10 quizzes of 10 questions each were simulated." });

    } catch (error) {
      console.error("Anonymous test failed:", error);
      toast({ variant: "destructive", title: "Test Failed", description: "An error occurred during the anonymous test." });
    } finally {
      // 4. Sign out and redirect
      await signOut(auth);
      router.push('/login');
      setIsAnonymousTesting(false);
    }
  };

  const handleFourQuestionTest = async () => {
    if (!user || allWords.length < 4) {
      toast({
        variant: "destructive",
        title: "Cannot run test",
        description: "No user logged in or not enough words available (need at least 4).",
      });
      return;
    }
    setIsFourQuestionTesting(true);
    toast({ title: "Starting 4-Question Test..." });

    try {
      const shuffled = [...allWords].sort(() => 0.5 - Math.random());
      const selectedWords = shuffled.slice(0, 4);

      const promises = selectedWords.map(word => {
        const isCorrect = Math.random() > 0.3; // ~70% chance to be correct
        return updateWordStats(firestore, user.uid, word.id, isCorrect);
      });
      
      await Promise.all(promises);

      toast({
        title: "4-Question Test Complete",
        description: `Simulated answers for 4 random words.`,
      });
    } catch (error) {
      console.error("4-question test failed:", error);
      toast({
        variant: "destructive",
        title: "Test Failed",
        description: "An error occurred during the 4-question test.",
      });
    } finally {
      setIsFourQuestionTesting(false);
    }
  };


  const loading = userLoading || myListsLoading || publicListsLoading || wordsLoading || adminLoading;

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
        isAdmin={isAdmin}
        onAutoTest={handleAutoTest}
        isAutoTesting={isAutoTesting}
        onAnonymousTest={handleAnonymousTest}
        isAnonymousTesting={isAnonymousTesting}
        onFourQuestionTest={handleFourQuestionTest}
        isFourQuestionTesting={isFourQuestionTesting}
    />
  );
}
