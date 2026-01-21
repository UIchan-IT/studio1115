
"use client";

import { useAdmin, useCollection } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserProfile } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, Eye } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { placeholderImages } from "@/lib/placeholder-images.json";
import { formatDistanceToNow } from 'date-fns';


export default function AdminPage() {
    const router = useRouter();
    const { isAdmin, loading: adminLoading } = useAdmin();
    const { data: users, loading: usersLoading } = useCollection<UserProfile>('users', { skip: adminLoading || !isAdmin });

    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, adminLoading, router]);

    const isLoading = adminLoading || usersLoading;

    if (isLoading) {
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

    if (!isAdmin) {
        return null; // or a dedicated "access denied" component
    }

    return (
        <div className="container mx-auto space-y-6">
             <header>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Manage users and monitor learning progress across the application.
                </p>
            </header>
            
            <Card>
                 <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">
                                    <Users className="h-5 w-5" />
                                </TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                             <Avatar>
                                                <AvatarImage src={placeholderImages.find(p => p.id === 'user-avatar')?.imageUrl} />
                                                <AvatarFallback>{user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>{user.displayName || 'N/A'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                           {user.createdAt && typeof (user.createdAt as any)?.toDate === 'function' ? formatDistanceToNow((user.createdAt as any).toDate(), { addSuffix: true }) : 'Unknown'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
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
