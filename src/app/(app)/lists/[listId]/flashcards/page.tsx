import { getWordListById } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import FlashcardView from "@/components/learning/flashcard-view";
import { Button } from "@/components/ui/button";

export default async function FlashcardsPage({
  params,
}: {
  params: { listId: string };
}) {
  const wordList = await getWordListById(params.listId);

  if (!wordList) {
    notFound();
  }

  return (
    <div className="container mx-auto h-full flex flex-col">
       <header className="mb-8">
          <Button asChild variant="ghost" className="-ml-4">
            <Link href={`/lists/${params.listId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {wordList.name}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold font-headline">Flashcards</h1>
          <p className="text-muted-foreground">Review words from your list: <span className="font-semibold text-foreground">{wordList.name}</span></p>
        </header>
      <div className="flex-grow flex items-center justify-center">
        <FlashcardView words={wordList.words} />
      </div>
    </div>
  );
}
