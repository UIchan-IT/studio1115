
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
  runTransaction,
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
    const userRef = doc(db, "users", userId);

    try {
        await runTransaction(db, async (transaction) => {
            const progressDoc = await transaction.get(progressRef);
            
            let newMasteryLevel;
            const currentMastery = progressDoc.exists() ? progressDoc.data().masteryLevel : 0;

            if (isCorrect) {
                newMasteryLevel = Math.min(currentMastery + 1, 5);
            } else {
                newMasteryLevel = Math.max(currentMastery - 1, 0);
            }
            
            const updates: any = {
                lastReviewed: serverTimestamp(),
                testCount: increment(1),
                masteryLevel: newMasteryLevel,
            };

            if (!isCorrect) {
                updates.mistakeCount = increment(1);
            }

            transaction.set(progressRef, updates, { merge: true });

            // If the word is now "learned" (mastery level >= 4) for the first time, increment user's count
            if (currentMastery < 4 && newMasteryLevel >= 4) {
                 transaction.update(userRef, { learnedWordsCount: increment(1) });
            }
            // If the word was "learned" and is now not, decrement
            else if (currentMastery >= 4 && newMasteryLevel < 4) {
                 transaction.update(userRef, { learnedWordsCount: increment(-1) });
            }
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
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
