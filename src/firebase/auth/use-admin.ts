
'use client';

import { useUser } from './use-user';
import { useDoc } from '../firestore/use-doc';

// Simple hook to check for admin privileges.
// It checks for the existence of a document in the /admins collection
// with the same ID as the user's UID.
export function useAdmin() {
  const { user, loading: userLoading } = useUser();
  const { data: adminDoc, loading: docLoading } = useDoc(
    'admins',
    user?.uid ?? '', // Ensure docId is always a string
    { skip: userLoading || !user } // Skip if user is loading or not available
  );

  const isAdmin = !!adminDoc;

  return { isAdmin, loading: userLoading || docLoading };
}
