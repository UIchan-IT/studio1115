"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, List, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WordList, Word } from "@/lib/definitions";
import { createWordList } from "@/lib/firestore";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, { message: "List name is required." }),
  description: z.string().optional(),
});

export default function WordLists({
  initialWordLists,
}: {
  initialWordLists: (WordList & { words: Word[] })[];
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create a list.",
      });
      return;
    }
    setIsCreating(true);
    try {
      await createWordList(firestore, {
        name: values.name,
        description: values.description || "",
        ownerId: user.uid,
      });
      toast({
        title: "List Created",
        description: `"${values.name}" has been successfully created.`,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create word list:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Could not create the new word list.",
      });
    } finally {
      setIsCreating(false);
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-headline">Your Lists</h2>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New List
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Word List</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., French Vocabulary, Scientific Terms" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What is this list about?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create List"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialWordLists.map((list) => (
            <Card key={list.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" /> {list.name}
                </CardTitle>
                <CardDescription>{list.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground">
                  <BookOpen className="inline-block mr-2 h-4 w-4" />
                  {list.words?.length || 0} words
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/lists/${list.id}`}>Open List</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {initialWordLists.length === 0 && (
            <Card className="md:col-span-3 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed">
              <p className="text-lg font-medium">No word lists yet!</p>
              <p className="text-muted-foreground">Get started by creating your first list.</p>
               <DialogTrigger asChild>
                  <Button className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create a List
                  </Button>
               </DialogTrigger>
            </Card>
          )}
        </div>
      </section>
    </Dialog>
  );
}
