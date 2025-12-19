import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GeneratedSpeech, SavedSpeech } from '../types';

export const saveSpeechToDb = async (userId: string, speech: GeneratedSpeech): Promise<string> => {
  if (!db) throw new Error("Database not initialized");

  const docRef = await addDoc(collection(db, "speeches"), {
    userId,
    title: speech.title,
    content: speech.content,
    timestamp: speech.timestamp,
    createdAt: Date.now()
  });
  
  return docRef.id;
};

export const getSavedSpeeches = async (userId: string): Promise<SavedSpeech[]> => {
  if (!db) return [];

  const q = query(
    collection(db, "speeches"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const speeches: SavedSpeech[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    speeches.push({
      id: doc.id,
      userId: data.userId,
      title: data.title,
      content: data.content,
      timestamp: data.timestamp,
      createdAt: data.createdAt
    });
  });

  return speeches;
};

export const deleteSpeechFromDb = async (speechId: string): Promise<void> => {
  if (!db) return;
  await deleteDoc(doc(db, "speeches", speechId));
};
