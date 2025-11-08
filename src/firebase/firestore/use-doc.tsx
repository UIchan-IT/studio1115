'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useDoc<T extends DocumentData>(
  collectionName: string,
  docId: string
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedDocRef = useMemo(() => {
    if (!firestore || !collectionName || !docId) return null;
    return doc(firestore, collectionName, docId);
  }, [firestore, collectionName, docId]);


  useEffect(() => {
    if (!memoizedDocRef) {
        setLoading(false);
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
