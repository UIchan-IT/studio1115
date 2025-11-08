"use client";

import { useState, useMemo, useEffect } from "react";
import type { Word } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, X, RotateCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useFirestore } from "@/firebase";
import { updateWordStats } from "@/lib/firestore";
import { useParams } from "next/navigation";

export default function FlashcardView({ words }: { words: Word[] }) {
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const firestore = useFirestore();
  const params = useParams();
  const listId = params.listId as string;
  
  useEffect(() => {
    // Shuffle words on component mount
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  }, [words]);

  const currentWord = useMemo(() => {
    if (shuffledWords.length > 0 && currentIndex < shuffledWords.length) {
      return shuffledWords[currentIndex];
    }
    return null;
  }, [currentIndex, shuffledWords]);
  
  const progress = useMemo(() => {
    if (shuffledWords.length === 0) return 0;
    return ((currentIndex) / shuffledWords.length) * 100;
  }, [currentIndex, shuffledWords]);

  const handleNext = (isKnown: boolean) => {
    if (currentWord) {
      updateWordStats(firestore, listId, currentWord.id, isKnown);
    }
    
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  };
  
  const handleRestart = () => {
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
        <Card className="w-full max-w-2xl text-center p-8">
            <CardContent className="flex flex-col items-center gap-4">
                <Check className="h-16 w-16 text-green-500 bg-green-100 rounded-full p-2" />
                <h2 className="text-2xl font-bold font-headline">Session Complete!</h2>
                <p className="text-muted-foreground">You've reviewed all the words in this session.</p>
                <Button onClick={handleRestart} className="mt-4">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Review Again
                </Button>
            </CardContent>
        </Card>
    );
  }

  if (!currentWord) {
    return <div>Loading cards...</div>;
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-4 space-y-2">
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground text-center">Card {currentIndex + 1} of {shuffledWords.length}</p>
      </div>
      <div className="relative h-80">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            className="absolute w-full h-full"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="relative w-full h-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Front of the card */}
              <div
                className="absolute w-full h-full"
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => setIsFlipped(true)}
              >
                <Card className="w-full h-full flex items-center justify-center cursor-pointer bg-card hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">
                      {currentWord.text}
                    </h2>
                  </CardContent>
                </Card>
              </div>

              {/* Back of the card */}
              <div
                className="absolute w-full h-full"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <Card className="w-full h-full flex flex-col justify-center bg-card">
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-xl md:text-2xl font-semibold">
                      {currentWord.definition}
                    </h3>
                    {currentWord.exampleSentences && currentWord.exampleSentences.length > 0 && (
                      <div className="text-sm text-muted-foreground italic">
                        <p>{currentWord.exampleSentences[0]}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className={cn(
          "flex justify-center gap-4 mt-6 transition-opacity duration-300",
          isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Button
          variant="destructive"
          size="lg"
          className="w-40"
          onClick={() => handleNext(false)}
        >
          <X className="mr-2 h-5 w-5" /> Again
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-40 bg-green-600 hover:bg-green-700"
          onClick={() => handleNext(true)}
        >
          <Check className="mr-2 h-5 w-5" /> Good
        </Button>
      </div>
    </div>
  );
}