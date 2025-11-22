
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import type { UserWordProgress, Word, WordList } from "@/lib/definitions";
import { useMemo, useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { History, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface WordWithProgress extends Word {
  listName: string;
}

export default function HistoryPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [allWordsWithList, setAllWordsWithList] = useState<WordWithProgress[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 10;

  const { data: userProgressData, loading: progressLoading } = useCollection<UserWordProgress>(
    user ? `users/${user.uid}/wordProgress` : "",
    { skip: !user }
  );

  useEffect(() => {
    if (user && firestore) {
      const fetchAllData = async () => {
        setDataLoading(true);
        const myListsQuery = query(collection(firestore, "wordLists"), where("ownerId", "==", user.uid));
        const publicListsQuery = query(collection(firestore, "wordLists"), where("isPublic", "==", true));

        const [myListsSnapshot, publicListsSnapshot] = await Promise.all([
          getDocs(myListsQuery),
          getDocs(publicListsQuery),
        ]);

        const myLists = myListsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WordList));
        const publicLists = publicListsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WordList));

        const combinedLists = [...myLists];
        const myIds = new Set(myLists.map(l => l.id));
        publicLists.forEach(publicList => {
          if (!myIds.has(publicList.id)) {
            combinedLists.push(publicList);
          }
        });

        const allWordsData: WordWithProgress[] = [];
        for (const list of combinedLists) {
           const wordsSnapshot = await getDocs(collection(firestore, "wordLists", list.id, "words"));
           const words = wordsSnapshot.docs.map(doc => ({ 
               id: doc.id, 
               ...doc.data(),
               listName: list.name,
            } as WordWithProgress));
           allWordsData.push(...words);
        }
        
        setAllWordsWithList(allWordsData);
        setDataLoading(false);
      }
      fetchAllData();
    } else if (!userLoading) {
      setDataLoading(false);
    }
  }, [user, firestore, userLoading]);

  const wordsWithProgress = useMemo(() => {
    if (!userProgressData || allWordsWithList.length === 0) return [];
    
    const progressMap = new Map(userProgressData.map(p => [p.id, p]));
    
    return allWordsWithList
      .map(word => ({
        ...word,
        progress: progressMap.get(word.id)
      }))
      .filter(word => word.progress); // Only show words that have been tested at least once
  }, [allWordsWithList, userProgressData]);
  
  const totalPages = Math.ceil(wordsWithProgress.length / wordsPerPage);
  const paginatedWords = wordsWithProgress.slice(
    (currentPage - 1) * wordsPerPage,
    currentPage * wordsPerPage
  );

  const isLoading = userLoading || dataLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="space-y-8">
          <header>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </header>
          <Card>
            <CardContent className="p-0">
               <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <History className="h-8 w-8" />
            Learning History
          </h1>
          <p className="text-muted-foreground">
            Review your performance for every word you've been tested on.
          </p>
        </header>

        {wordsWithProgress.length > 0 ? (
           <div>
            <Card>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Word</TableHead>
                        <TableHead>Definition</TableHead>
                        <TableHead>From List</TableHead>
                        <TableHead className="text-center">Mistakes</TableHead>
                        <TableHead className="text-center">Test Count</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedWords.map(word => (
                        <TableRow key={word.id}>
                            <TableCell className="font-medium">{word.text}</TableCell>
                            <TableCell className="text-muted-foreground">{word.definition}</TableCell>
                            <TableCell className="text-muted-foreground">
                                <Link href={`/lists/${allWordsWithList.find(w => w.id === word.id) ? allWordsWithList.find(w => w.id === word.id)!.listName : ''}`} className="hover:underline">
                                    {word.listName}
                                </Link>
                            </TableCell>
                            <TableCell className="text-center font-semibold text-destructive">{word.progress?.mistakeCount ?? 0}</TableCell>
                            <TableCell className="text-center">{word.progress?.testCount ?? 0}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
            </Card>
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
                <p className="text-lg font-medium">No History Yet</p>
                <p className="text-muted-foreground">Complete a quiz or flashcard session to see your history.</p>
                <Button asChild className="mt-4">
                  <Link href={`/dashboard`}>Back to Dashboard</Link>
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
