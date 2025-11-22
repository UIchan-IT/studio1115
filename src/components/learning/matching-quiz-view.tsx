
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Word } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, RotateCw, Shuffle, GripVertical } from "lucide-react";
import { updateWordStats, initializeWordProgress } from "@/lib/firestore";
import { useFirestore, useUser } from "@/firebase";

type MatchingRound = {
  words: Word[];
  shuffledDefinitions: { id: string; definition: string }[];
};

type SessionResult = {
    word: Word;
    isCorrect: boolean;
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
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);

  useEffect(() => {
    if (words.length >= 4 && user) {
        const generatedRounds = generateMatchingRounds(words).slice(0, 2);
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
    setSessionResults([]);
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
    if (!user || !currentRound || isSubmitted) return;
    setIsSubmitted(true);
    
    const roundResults: SessionResult[] = [];
    const promises = currentRound.words.map(word => {
        const isCorrect = matches[word.id] === word.id;
        roundResults.push({ word, isCorrect });
        return updateWordStats(firestore, user.uid, word.id, isCorrect);
    });
    
    setSessionResults(prev => [...prev, ...roundResults]);
    Promise.all(promises);
  };

  const handleNextRound = () => {
    if (isSubmitted) { // If already submitted, just move to next round or finish
      if (currentRoundIndex < rounds.length - 1) {
          setCurrentRoundIndex(prev => prev + 1);
          setIsSubmitted(false);
          setMatches({});
          setSelectedWordId(null);
          setSelectedDefinitionId(null);
      } else {
          setIsComplete(true);
      }
      return;
    }

    // Submit the current round's answers before moving on
    if (user && currentRound) {
        setIsSubmitted(true);
        const roundResults: SessionResult[] = [];
        const promises = currentRound.words.map(word => {
            const isCorrect = matches[word.id] === word.id;
            roundResults.push({ word, isCorrect });
            return updateWordStats(firestore, user.uid, word.id, isCorrect);
        });
        setSessionResults(prev => [...prev, ...roundResults]);
        Promise.all(promises);
    }

    // Use a timeout to allow the user to see the results before moving on
    setTimeout(() => {
        if (currentRoundIndex < rounds.length - 1) {
            setCurrentRoundIndex(prev => prev + 1);
            setIsSubmitted(false);
            setMatches({});
            setSelectedWordId(null);
            setSelectedDefinitionId(null);
        } else {
            setIsComplete(true);
        }
    }, 1500); // 1.5 second delay
  };

  const handleRestart = () => {
     if (words.length >= 4) {
        setRounds(generateMatchingRounds(words).slice(0, 2));
    }
    setCurrentRoundIndex(0);
    setMatches({});
    setSelectedWordId(null);
    setSelectedDefinitionId(null);
    setIsSubmitted(false);
    setIsComplete(false);
    setSessionResults([]);
  }

  if (isComplete) {
    const correctCount = sessionResults.filter(r => r.isCorrect).length;
    const totalCount = sessionResults.length;
    return (
        <Card className="w-full max-w-4xl text-center p-8">
            <CardContent className="flex flex-col items-center gap-4">
                <Check className="h-16 w-16 text-green-500 bg-green-100 rounded-full p-2" />
                <h2 className="text-2xl font-bold font-headline">Session Complete!</h2>
                <p className="text-muted-foreground text-xl">Your score: <span className="font-bold text-foreground">{correctCount} / {totalCount}</span></p>

                <Card className="w-full mt-4 text-left">
                    <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold">Results Summary:</h3>
                        <ul className="space-y-2">
                            {sessionResults.map(({word, isCorrect}, index) => (
                                <li key={index} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                    <div className="flex items-center">
                                       {isCorrect ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <X className="h-4 w-4 mr-2 text-red-500" />}
                                        <div>
                                            <p className="font-medium">{word.text}</p>
                                            <p className="text-sm text-muted-foreground">{word.definition}</p>
                                        </div>
                                    </div>
                                    <div className={cn("text-sm font-semibold", isCorrect ? "text-green-600" : "text-red-600")}>
                                        {isCorrect ? "Correct" : "Incorrect"}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

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

  const allMatched = Object.keys(matches).length === currentRound.words.length;

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
                                        isSubmitted && isCorrect && "bg-green-600 border-green-700 text-white hover:bg-green-700",
                                        isSubmitted && !isCorrect && "bg-red-600 border-red-700 text-white hover:bg-red-700"
                                    )}
                                    disabled={isSubmitted}
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
                                        isSubmitted && isMatchedByAWord && isCorrect && "bg-green-600 border-green-700 text-white hover:bg-green-700",
                                        isSubmitted && isMatchedByAWord && !isCorrect && "bg-red-600 border-red-700 text-white hover:bg-red-700"
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
        <div className="flex justify-center items-center mt-6 space-x-4">
            <Button onClick={handleNextRound} disabled={!allMatched || (isSubmitted && !isComplete)} size="lg">
                 {isSubmitted ? (currentRoundIndex < rounds.length -1 ? "Next Round" : "Finish Quiz") : "Check Answers"}
            </Button>
        </div>
    </div>
  );
}
