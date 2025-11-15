
"use client";

import { useState, useEffect } from "react";
import type { Word } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, RotateCw, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useFirestore, useUser } from "@/firebase";
import { updateWordStats, initializeWordProgress } from "@/lib/firestore";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type QuizQuestion = {
  questionWord: Word;
  options: Word[];
  correctAnswerId: string;
};

function generateQuiz(words: Word[], count: number): QuizQuestion[] {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, count);

  return selectedWords.map((correctWord) => {
    const otherOptions = shuffled
      .filter((w) => w.id !== correctWord.id)
      .slice(0, 3);
    const options = [correctWord, ...otherOptions].sort(
      () => 0.5 - Math.random()
    );
    return {
      questionWord: correctWord,
      options,
      correctAnswerId: correctWord.id,
    };
  });
}

export default function QuizView({ words }: { words: Word[] }) {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isAutoTesting, setIsAutoTesting] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const params = useParams();
  const listId = params.listId as string;
  const { toast } = useToast();

  useEffect(() => {
    if (words.length > 0 && user) {
        const quizSize = Math.min(words.length, 10);
        const questions = generateQuiz(words, quizSize);
        setQuizQuestions(questions);

        const wordsInQuiz = new Set<Word>();
        questions.forEach(q => {
            wordsInQuiz.add(q.questionWord);
            q.options.forEach(opt => wordsInQuiz.add(opt));
        });

        wordsInQuiz.forEach(word => {
            if (!word.progress) {
                initializeWordProgress(firestore, user.uid, word.id);
            }
        });
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
  }, [words, user, firestore]);
  
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = quizQuestions.length > 0 ? ((currentQuestionIndex) / quizQuestions.length) * 100 : 0;

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerId(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (isAnswered || !user) return;
    const isCorrect = answerId === currentQuestion.correctAnswerId;
    
    setSelectedAnswerId(answerId);
    setIsAnswered(true);
    
    updateWordStats(firestore, user.uid, currentQuestion.questionWord.id, isCorrect);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
        handleNextQuestion();
    }, 100);
  };
  
  const handleRestart = () => {
    const quizSize = Math.min(words.length, 10);
    setQuizQuestions(generateQuiz(words, quizSize));
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
  }

  const runAutoTest = async (runs: number) => {
    if (!user) return;
    setIsAutoTesting(true);

    for (let i = 0; i < runs; i++) {
        const quizSize = Math.min(words.length, 10);
        const autoTestQuestions = generateQuiz(words, quizSize);
        
        for (const question of autoTestQuestions) {
            // 30% chance to be incorrect
            const isCorrect = Math.random() > 0.3;
            await updateWordStats(firestore, user.uid, question.questionWord.id, isCorrect);
        }
    }
    
    toast({
        title: "Debug Test Complete",
        description: `${runs} runs of ${Math.min(words.length, 10)} questions completed.`,
    });
    setIsAutoTesting(false);
    // We can re-run the normal quiz setup to reflect new progress, or just leave it.
    // For now, we'll just stop the loading indicator.
  };

  if (isComplete) {
    return (
        <Card className="w-full max-w-2xl text-center p-8">
            <CardContent className="flex flex-col items-center gap-4">
                <Check className="h-16 w-16 text-green-500 bg-green-100 rounded-full p-2" />
                <h2 className="text-2xl font-bold font-headline">Quiz Complete!</h2>
                <p className="text-muted-foreground text-xl">Your score:</p>
                <p className="text-4xl font-bold">{score} / {quizQuestions.length}</p>
                <Button onClick={handleRestart} className="mt-4">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Take Quiz Again
                </Button>
            </CardContent>
        </Card>
    );
  }

  if (!currentQuestion) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-4 space-y-2">
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground text-center">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground mb-2">What is the definition of:</p>
          <h2 className="text-center text-3xl font-bold font-headline mb-6">
            {currentQuestion.questionWord.text}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => {
              const isCorrect = option.id === currentQuestion.correctAnswerId;
              const isSelected = option.id === selectedAnswerId;
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className={cn(
                    "h-auto py-4 whitespace-normal justify-start text-left",
                    isAnswered && isCorrect && "bg-green-100 border-green-500 text-green-800 hover:bg-green-200",
                    isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-500 text-red-800 hover:bg-red-200"
                  )}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={isAnswered || isAutoTesting}
                >
                  {option.definition}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center mt-6 h-10">
        <div className="flex-1 text-left">
             <Button
                variant="outline"
                onClick={() => runAutoTest(5)}
                disabled={isAutoTesting}
             >
                {isAutoTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Debug: 5x Auto-Test
             </Button>
        </div>
        <div className="flex-1 text-center">
            {isAnswered && (
                <>
                {selectedAnswerId === currentQuestion.correctAnswerId ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Correct!</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-destructive">
                        <X className="h-5 w-5" />
                        <span className="font-medium">Incorrect.</span>
                    </div>
                )}
                </>
            )}
        </div>
        <div className="flex-1" />
      </div>
    </div>
  );
}

    