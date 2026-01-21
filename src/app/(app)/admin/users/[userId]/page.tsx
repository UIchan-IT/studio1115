
"use client";

import { useAdmin, useDoc, useCollection } from "@/firebase";
import { useParams, useRouter, notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { UserProfile, UserWordProgress, Word } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WeakWords from "@/components/dashboard/weak-words";
import { placeholderImages } from "@/lib/placeholder-images.json";
import { useFirestore } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


interface WordList {
    id: string;
    name: string;
    words: Word[];
}

export default function UserDetailPage() {
    const params = useParams();
    const userId = params.userId as string;
    const router = useRouter();
    const { isAdmin, loading: adminLoading } = useAdmin();

    const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>('users', userId, { skip: adminLoading });
    const { data: userProgressData, loading: progressLoading } = useCollection<UserWordProgress>(`users/${userId}/wordProgress`, { skip: adminLoading });
    
    const [allWords, setAllWords] = useState<Word[]>([]);
    const [wordsLoading, setWordsLoading] = useState(true);
    const firestore = useFirestore();


    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, adminLoading, router]);

    useEffect(() => {
        const fetchAllWords = async () => {
            if (!firestore || adminLoading) return;
            setWordsLoading(true);
            const wordListsSnapshot = await getDocs(collection(firestore, 'wordLists'));
            const wordsData: Word[] = [];

            for (const listDoc of wordListsSnapshot.docs) {
                const wordsSnapshot = await getDocs(collection(firestore, 'wordLists', listDoc.id, 'words'));
                const words = wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Word));
                wordsData.push(...words);
            }
            setAllWords(wordsData);
            setWordsLoading(false);
        };
        fetchAllWords();
    }, [firestore, adminLoading]);


    const weakWords = useMemo(() => {
        if (!userProgressData || allWords.length === 0) return [];
        
        const progressMap = new Map(userProgressData.map(p => [p.id, p]));
        
        return allWords
            .map(word => ({
                ...word,
                progress: progressMap.get(word.id)
            }))
            .filter(word => word.progress && word.progress.testCount > 0) // Must have been tested at least once
            .sort((a, b) => (b.progress?.mistakeCount ?? 0) - (a.progress?.mistakeCount ?? 0))
            .slice(0, 10);
    }, [allWords, userProgressData]);


    const isLoading = adminLoading || userProfileLoading || progressLoading || wordsLoading;
    
    if (isLoading) {
        return (
             <div className="container mx-auto space-y-6">
                 <Skeleton className="h-9 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader className="items-center text-center">
                            <Skeleton className="h-24 w-24 rounded-full mb-4" />
                            <Skeleton className="h-7 w-32" />
                            <Skeleton className="h-5 w-48" />
                        </CardHeader>
                    </Card>
                    <Card className="md:col-span-2">
                         <CardHeader>
                            <Skeleton className="h-7 w-48 mb-2" />
                             <Skeleton className="h-5 w-64" />
                         </CardHeader>
                        <CardContent>
                             <Skeleton className="h-56 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!userProfile) {
        return notFound();
    }


    return (
        <div className="container mx-auto space-y-6">
            <Button asChild variant="ghost" className="-ml-4">
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Users
                </Link>
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="md:col-span-1">
                    <CardHeader className="items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                             <AvatarImage src={placeholderImages.find(p => p.id === 'user-avatar')?.imageUrl} alt="User Avatar" />
                             <AvatarFallback>{userProfile.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl">{userProfile.displayName || 'User'}</CardTitle>
                        <CardDescription>{userProfile.email}</CardDescription>
                    </CardHeader>
                 </Card>

                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Top 10 Weak Words</CardTitle>
                        <CardDescription>Words this user struggles with the most.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WeakWords words={weakWords} />
                    </CardContent>
                 </Card>
            </div>
        </div>
    )

}
