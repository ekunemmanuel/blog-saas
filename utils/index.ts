import { getApp } from "firebase/app";
import { collection, getDoc, type Firestore, doc, getFirestore } from "firebase/firestore";

export function formatDate(date: Date, timeZone: string = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "medium",
    dateStyle: "medium",
    timeZone: timeZone,
  }).format(date);
}

// Function to get the local timezone dynamically
export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function fetchDoc<T>({
  // db,
  collectionName,
  id,
}: {
  collectionName: string;
  id: string;
  // db: Firestore;
}) {
  
  const { $firebaseApp } = useNuxtApp();
  const app = getApp($firebaseApp.name);
  const db = getFirestore(app);
  // check if firebase has be initialized
  const docRef = doc(collection(db, collectionName), id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as T;
  }
}
