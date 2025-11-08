"use client";

import {
  addDoc,
  collection,
  serverTimestamp,
  writeBatch,
  doc,
  deleteDoc,
  type Firestore,
} from "firebase/firestore";

// WordList functions
export const createWordList = async (db: Firestore, list: {
  name: string;
  description: string;
  ownerId: string;
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
