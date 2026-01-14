'use client';

import { useUser } from './use-user';
import { useDoc } from '../firestore/use-doc';

// Simple hook to check for admin privileges.
// It checks for the existence of a document in the /admins collection
// with the same ID as the user's UID.
export function useAdmin() {
  const { user } = useUser();
  const { data: adminDoc, loading } = useDoc(
    'admins',
    user?.uid,
    { skip: !user } // Skip the query if there is no user.
  );

  const isAdmin = !!adminDoc;

  return { isAdmin, loading };
}
