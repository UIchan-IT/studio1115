import { getWordListById } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import QuizView from "@/components/learning/quiz-view";
import { Button } from "@/components/ui/button";

export default async function QuizPage({
  params,
}: {
  params: { listId: string };
}) {
  const wordList = await getWordListById(params.listId);

  if (!wordList || wordList.words.length < 4) {
    return (
       <div className="container mx-auto">
         <header className="mb-8">
            <Button asChild variant="ghost" className="-ml-4">
              <Link href={`/lists/${wordList?.id ?? '/dashboard'}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
              </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">Quiz</h1>
            <p className="text-muted-foreground">Test your knowledge on <span className="font-semibold text-foreground">{wordList?.name}</span></p>
          </header>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-lg font-medium">Not Enough Words for a Quiz</p>
            <p className="text-muted-foreground">You need at least 4 words in this list to start a quiz.</p>
            <Button asChild className="mt-4">
              <Link href={`/lists/${wordList?.id ?? '/dashboard'}`}>Add More Words</Link>
            </Button>
          </div>
       </div>
    )
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
          <h1 className="text-3xl font-bold font-headline">Quiz</h1>
          <p className="text-muted-foreground">Test your knowledge on <span className="font-semibold text-foreground">{wordList.name}</span></p>
        </header>
      <div className="flex-grow flex items-center justify-center">
        <QuizView words={wordList.words} />
      </div>
    </div>
  );
}
