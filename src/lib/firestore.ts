
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
  setDoc,
  getDoc,
  type Firestore,
} from "firebase/firestore";

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
        });
    });

    return batch.commit();
}

export const deleteWords = async (db: Firestore, listId:string, wordIds: string[]) => {
    const batch = writeBatch(db);
    wordIds.forEach(wordId => {
        const docRef = doc(db, "wordLists", listId, "words", wordId);
        batch.delete(docRef);
        // Note: This doesn't delete the user progress for the word.
        // A more robust solution would use a Cloud Function to clean up progress data.
    });
    return batch.commit();
}

export const updateWordStats = async (db: Firestore, userId: string, wordId: string, isCorrect: boolean) => {
    const progressRef = doc(db, "users", userId, "wordProgress", wordId);
    
    const updates: any = {
        lastReviewed: serverTimestamp(),
        testCount: increment(1),
    };

    if (!isCorrect) {
        updates.mistakeCount = increment(1);
    }
    // Logic for masteryLevel can be added here if needed

    // Use set with merge to create the document if it doesn't exist, and update if it does.
    return setDoc(progressRef, updates, { merge: true });
}

export const initializeWordProgress = async (db: Firestore, userId: string, wordId: string) => {
    const progressRef = doc(db, "users", userId, "wordProgress", wordId);
    return setDoc(progressRef, {
        masteryLevel: 0,
        mistakeCount: 0,
        testCount: 0,
        lastReviewed: null,
    }, { merge: true });
};

// Badge functions
export const awardBadge = async (db: Firestore, userId: string, badgeId: string) => {
    const badgeRef = doc(db, "users", userId, "badges", badgeId);
    const badgeDoc = await getDoc(badgeRef);

    // Award badge only if it hasn't been earned before
    if (!badgeDoc.exists()) {
        return setDoc(badgeRef, {
            earnedOn: serverTimestamp(),
        });
    }
};
