'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type Firestore,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseCollectionOptions {
  whereClauses?: [string, '==', any][];
  skip?: boolean;
}

export function useCollection<T extends DocumentData>(
  collectionName: string,
  options: UseCollectionOptions = {}
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { whereClauses, skip } = options;

  const memoizedQuery = useMemo(() => {
    if (skip || !collectionName) return null;
    let q: Query<DocumentData, DocumentData> = collection(firestore, collectionName);
    if (whereClauses) {
      whereClauses.forEach(([field, op, value]) => {
        if(value !== undefined) {
          q = query(q, where(field, op, value));
        }
      });
    }
    return q;
  }, [firestore, collectionName, JSON.stringify(whereClauses), skip]);


  useEffect(() => {
    if (!memoizedQuery) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot) => {
        const newData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(newData);
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
  }, [memoizedQuery]);

  return { data, loading, error };
}
