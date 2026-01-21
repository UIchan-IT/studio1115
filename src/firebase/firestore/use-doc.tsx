
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseDocOptions {
  skip?: boolean;
}

export function useDoc<T extends DocumentData>(
  collectionName: string,
  docId: string,
  options: UseDocOptions = {}
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { skip } = options;

  const memoizedDocRef = useMemo(() => {
    if (skip || !firestore || !collectionName || !docId) return null;
    return doc(firestore, collectionName, docId);
  }, [firestore, collectionName, docId, skip]);


  useEffect(() => {
    if (!memoizedDocRef) {
        setData(null);
        setLoading(true); // If skipped, remain in a loading state
        return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, loading, error };
}
