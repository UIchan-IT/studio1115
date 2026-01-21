
"use client";

import { useCollection, useUser } from "@/firebase";
import type { UserProfile } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";
import { placeholderImages } from "@/lib/placeholder-images.json";
import { Badge } from "@/components/ui/badge";

const RankIndicator = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Badge variant="default" className="bg-amber-400 hover:bg-amber-400 text-white"><Medal className="mr-1 h-4 w-4" />1st</Badge>;
    if (rank === 2) return <Badge variant="default" className="bg-slate-400 hover:bg-slate-400 text-white"><Medal className="mr-1 h-4 w-4" />2nd</Badge>;
    if (rank === 3) return <Badge variant="default" className="bg-amber-600 hover:bg-amber-600 text-white"><Medal className="mr-1 h-4 w-4" />3rd</Badge>;
    return <span className="font-semibold">{rank}</span>;
}


export default function RankingPage() {
    const { user, loading: userLoading } = useUser();
    const { data: users, loading: usersLoading } = useCollection<UserProfile>('users', { skip: userLoading || !user });
    
    const rankedUsers = useMemo(() => {
        return [...users].sort((a, b) => (b.totalTestCount ?? 0) - (a.totalTestCount ?? 0));
    }, [users]);

    if (userLoading || usersLoading) {
        return (
             <div className="container mx-auto space-y-6">
                <header>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </header>
                <Card>
                    <CardContent>
                        <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto space-y-6">
             <header>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <Trophy className="h-8 w-8 text-primary" />
                    Leaderboard
                </h1>
                <p className="text-muted-foreground">
                    See who has tested the most words.
                </p>
            </header>
            
            <Card>
                 <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] text-center">Rank</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Words Tested</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {rankedUsers.length > 0 ? (
                                rankedUsers.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="text-center">
                                            <RankIndicator rank={index + 1} />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={placeholderImages.find(p => p.id === 'user-avatar')?.imageUrl} />
                                                    <AvatarFallback>{user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p>{user.displayName || 'Anonymous User'}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-lg">{user.totalTestCount ?? 0}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                         </TableBody>
                    </Table>
                 </CardContent>
            </Card>
        </div>
    )
}
