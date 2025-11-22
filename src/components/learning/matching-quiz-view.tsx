"use client";

import { useState, useEffect, useMemo } from "react";
import type { Word } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, RotateCw, Shuffle } from "lucide-react";
import { updateWordStats, initializeWordProgress } from "@/lib/firestore";
import { useFirestore, useUser } from "@/firebase";

type MatchingRound = {
  words: Word[];
  shuffledDefinitions: { id: string; definition: string }[];
};

function generateMatchingRounds(words: Word[]): MatchingRound[] {
  const shuffledWords = [...words].sort(() => 0.5 - Math.random());
  const rounds: MatchingRound[] = [];
  for (let i = 0; i < shuffledWords.length; i += 4) {
    const roundWords = shuffledWords.slice(i, i + 4);
    if (roundWords.length === 4) {
        const shuffledDefinitions = [...roundWords]
            .sort(() => 0.5 - Math.random())
            .map(w => ({ id: w.id, definition: w.definition }));
        rounds.push({ words: roundWords, shuffledDefinitions });
    }
  }
  return rounds;
}

export default function MatchingQuizView({ words }: { words: Word[] }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [rounds, setRounds] = useState<MatchingRound[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // { wordId: definitionId }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (words.length >= 4 && user) {
        const generatedRounds = generateMatchingRounds(words);
        setRounds(generatedRounds);
        
        const wordsInRounds = new Set<Word>();
        generatedRounds.forEach(r => r.words.forEach(w => wordsInRounds.add(w)));

        wordsInRounds.forEach(word => {
            if (!word.progress) {
                initializeWordProgress(firestore, user.uid, word.id);
            }
        });
    }
    // Reset state on new words prop
    setCurrentRoundIndex(0);
    setMatches({});
    setSelectedWordId(null);
    setSelectedDefinitionId(null);
    setIsSubmitted(false);
    setIsComplete(false);
  }, [words, user, firestore]);

  const currentRound = rounds[currentRoundIndex];

  const handleWordSelect = (wordId: string) => {
    if (isSubmitted || matches[wordId]) return;
    if (selectedWordId === wordId) {
        setSelectedWordId(null); // Deselect
    } else {
        setSelectedWordId(wordId);
    }
  };

  const handleDefinitionSelect = (defId: string) => {
    if (isSubmitted || Object.values(matches).includes(defId)) return;
     if (selectedDefinitionId === defId) {
        setSelectedDefinitionId(null); // Deselect
    } else {
        setSelectedDefinitionId(defId);
    }
  };

  useEffect(() => {
    if (selectedWordId && selectedDefinitionId) {
        setMatches(prev => ({...prev, [selectedWordId]: selectedDefinitionId}));
        setSelectedWordId(null);
        setSelectedDefinitionId(null);
    }
  }, [selectedWordId, selectedDefinitionId]);
  
  const handleUnmatch = (wordId: string) => {
      if(isSubmitted) return;
      const newMatches = {...matches};
      delete newMatches[wordId];
      setMatches(newMatches);
  }

  const handleSubmit = () => {
    if (!user) return;
    setIsSubmitted(true);
    const promises = currentRound.words.map(word => {
        const isCorrect = matches[word.id] === word.id;
        return updateWordStats(firestore, user.uid, word.id, isCorrect);
    });
    Promise.all(promises);
  };

  const handleNextRound = () => {
    if (currentRoundIndex < rounds.length - 1) {
        setCurrentRoundIndex(prev => prev + 1);
        setIsSubmitted(false);
        setMatches({});
    } else {
        setIsComplete(true);
    }
  };

  const handleRestart = () => {
     if (words.length >= 4) {
        setRounds(generateMatchingRounds(words));
    }
    setCurrentRoundIndex(0);
    setMatches({});
    setSelectedWordId(null);
    setSelectedDefinitionId(null);
    setIsSubmitted(false);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
        <Card className="w-full max-w-4xl text-center p-8">
            <CardContent className="flex flex-col items-center gap-4">
                <Check className="h-16 w-16 text-green-500 bg-green-100 rounded-full p-2" />
                <h2 className="text-2xl font-bold font-headline">Session Complete!</h2>
                <p className="text-muted-foreground">You've finished all the matching rounds.</p>
                <Button onClick={handleRestart} className="mt-4">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Review Again
                </Button>
            </CardContent>
        </Card>
    );
  }

  if (!currentRound) {
    return (
        <Card className="w-full max-w-4xl p-8">
            <CardContent className="text-center">
                <p>Loading matching quiz...</p>
            </CardContent>
        </Card>
    );
  }

  const allMatched = Object.keys(matches).length === 4;

  return (
    <div className="w-full max-w-4xl">
        <p className="text-sm text-muted-foreground text-center mb-4">Round {currentRoundIndex + 1} of {rounds.length}</p>
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                    {/* Words Column */}
                    <div className="space-y-4">
                        {currentRound.words.map(word => {
                            const isMatched = !!matches[word.id];
                            const isSelected = selectedWordId === word.id;
                            let isCorrect = false;
                            if (isSubmitted && isMatched) {
                                isCorrect = matches[word.id] === word.id;
                            }
                            
                            return (
                                <Button
                                    key={word.id}
                                    variant="outline"
                                    onClick={() => isMatched ? handleUnmatch(word.id) : handleWordSelect(word.id)}
                                    className={cn(
                                        "w-full h-auto py-4 justify-center text-center",
                                        isSelected && "ring-2 ring-primary",
                                        isMatched && !isSubmitted && "bg-muted text-muted-foreground",
                                        isSubmitted && isMatched && isCorrect && "bg-green-500 border-green-700 text-white hover:bg-green-600",
                                        isSubmitted && isMatched && !isCorrect && "bg-red-500 border-red-700 text-white hover:bg-red-600"
                                    )}
                                    disabled={isSubmitted && isMatched}
                                >
                                    {word.text}
                                </Button>
                            )
                        })}
                    </div>
                    {/* Definitions Column */}
                    <div className="space-y-4">
                       {currentRound.shuffledDefinitions.map(def => {
                           const isMatchedByAWord = Object.values(matches).includes(def.id);
                           const isSelected = selectedDefinitionId === def.id;
                           const matchedWordId = Object.keys(matches).find(key => matches[key] === def.id);
                           let isCorrect = false;
                           if (isSubmitted && matchedWordId) {
                               isCorrect = def.id === matchedWordId;
                           }

                           return (
                                <Button
                                    key={def.id}
                                    variant="outline"
                                    onClick={() => handleDefinitionSelect(def.id)}
                                    className={cn(
                                        "w-full h-auto py-4 justify-start text-left whitespace-normal",
                                        isSelected && "ring-2 ring-primary",
                                        isMatchedByAWord && !isSubmitted && "bg-muted text-muted-foreground",
                                        isSubmitted && isMatchedByAWord && isCorrect && "bg-green-500 border-green-700 text-white hover:bg-green-600",
                                        isSubmitted && isMatchedByAWord && !isCorrect && "bg-red-500 border-red-700 text-white hover:bg-red-600"
                                    )}
                                    disabled={isSubmitted || isMatchedByAWord}
                                >
                                   {def.definition}
                                </Button>
                           )
                       })}
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="flex justify-center mt-6">
            {!isSubmitted ? (
                 <Button onClick={handleSubmit} disabled={!allMatched} size="lg">
                    Check Answers
                 </Button>
            ) : (
                 <Button onClick={handleNextRound} size="lg">
                    Next Round
                 </Button>
            )}
        </div>
    </div>
  );
}
