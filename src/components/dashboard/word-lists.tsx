"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, List, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WordList } from "@/lib/definitions";

export default function WordLists({
  initialWordLists,
}: {
  initialWordLists: WordList[];
}) {
  const [wordLists, setWordLists] = useState(initialWordLists);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold font-headline">Your Lists</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New List
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wordLists.map((list) => (
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
                {list.words.length} words
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/lists/${list.id}`}>Open List</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {wordLists.length === 0 && (
          <Card className="md:col-span-3 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed">
            <p className="text-lg font-medium">No word lists yet!</p>
            <p className="text-muted-foreground">Get started by creating your first list.</p>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create a List
            </Button>
          </Card>
        )}
      </div>
    </section>
  );
}
