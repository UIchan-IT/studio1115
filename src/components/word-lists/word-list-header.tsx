import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Book, Brain, FileUp, PlusCircle, Trash2 } from "lucide-react";
import type { WordList } from "@/lib/definitions";

export default function WordListHeader({ wordList }: { wordList: WordList }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline">{wordList.name}</h1>
        <p className="text-muted-foreground">
          Manage and learn the words in this list.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href={`/lists/${wordList.id}/flashcards`}>
            <Book className="mr-2 h-4 w-4" />
            Flashcards
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/lists/${wordList.id}/quiz`}>
            <Brain className="mr-2 h-4 w-4" />
            Start Quiz
          </Link>
        </Button>
      </div>
    </header>
  );
}
