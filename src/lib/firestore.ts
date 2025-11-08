"use client";

import {
  addDoc,
  collection,
  serverTimestamp,
  writeBatch,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  type Firestore,
} from "firebase/firestore";
import type { Word, WordList } from "./definitions";

// WordList functions
export const createWordList = async (db: Firestore, list: {
  name: string;
  description: string;
  ownerId: string;
  isPublic: boolean;
}) => {
  return addDoc(collection(db, "wordLists"), {
    ...list,
    createdAt: serverTimestamp(),
  });
};

// Word functions
export const addWord = async (db: Firestore, listId: string, word: { text: string, definition: string }) => {
    return addDoc(collection(db, "wordLists", listId, "words"), {
        ...word,
        exampleSentences: [],
        masteryLevel: 0,
        lastReviewed: null,
        mistakeCount: 0,
        testCount: 0,
    });
}

export const addWords = async (db: Firestore, listId: string, words: { text: string, definition: string }[]) => {
    const batch = writeBatch(db);
    const wordsCollection = collection(db, "wordLists", listId, "words");

    words.forEach(word => {
        const docRef = doc(wordsCollection);
        batch.set(docRef, {
            ...word,
            exampleSentences: [],
            masteryLevel: 0,
            lastReviewed: null,
            mistakeCount: 0,
            testCount: 0,
        });
    });

    return batch.commit();
}

export const deleteWords = async (db: Firestore, listId: string, wordIds: string[]) => {
    const batch = writeBatch(db);
    wordIds.forEach(wordId => {
        const docRef = doc(db, "wordLists", listId, "words", wordId);
        batch.delete(docRef);
    });
    return batch.commit();
}

export const updateWordStats = async (db: Firestore, listId: string, wordId: string, isCorrect: boolean) => {
    const wordRef = doc(db, "wordLists", listId, "words", wordId);
    
    const updates: any = {
        lastReviewed: serverTimestamp(),
        testCount: increment(1),
    };

    if (!isCorrect) {
        updates.mistakeCount = increment(1);
    }
    // Logic for masteryLevel can be added here if needed

    return updateDoc(wordRef, updates);
}