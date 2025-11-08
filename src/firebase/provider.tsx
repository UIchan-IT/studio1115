'use client';
import React, { createContext, useContext } from 'react';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This is a workaround to prevent Firebase from being initialized multiple times.
// We store the initialized services in a global variable to ensure they are singletons.
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase() {
  if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  } else if (getApps().length) {
    app = getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
  }

  // On the server, we need to initialize the app every time.
  if (typeof window === 'undefined') {
    const serverApp = initializeApp(firebaseConfig, `server-${Date.now()}`);
    return {
      app: serverApp,
      auth: getAuth(serverApp),
      firestore: getFirestore(serverApp),
    }
  }

  return { app, auth, firestore };
}

type FirebaseContextType = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({
  children,
  app,
  auth,
  firestore,
}: {
  children: React.ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => {
    const { app } = useFirebase();
    if (!app) {
        throw new Error('Firebase app is not initialized');
    }
    return app;
}

export const useFirestore = () => {
    const { firestore } = useFirebase();
    if (!firestore) {
        throw new Error('Firestore is not initialized');
    }
    return firestore;
}

export const useAuth = () => {
    const { auth } = useFirebase();
    if (!auth) {
        throw new Error('Firebase Auth is not initialized');
    }
    return auth;
}
