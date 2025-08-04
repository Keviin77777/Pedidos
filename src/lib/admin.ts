
'use client';

import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  CollectionReference,
} from 'firebase/firestore';

// ======== TYPES ========

export interface ContentRequest {
  id: string;
  title: string;
  type: string;
  logo?: string | null;
  notes?: string;
  requestedAt: string; // Storing as ISO string for simplicity
  status: 'Pendente' | 'Adicionado';
}

export interface ProblemReport {
  id: string;
  title: string;
  problem: string;
  reportedAt: string; // Storing as ISO string
  status: 'Aberto' | 'Resolvido';
}

type FirebaseContentRequest = Omit<ContentRequest, 'id' | 'requestedAt'> & { requestedAt: Timestamp };
type FirebaseProblemReport = Omit<ProblemReport, 'id' | 'reportedAt'> & { reportedAt: Timestamp };

// ======== COLLECTIONS ========
const requestsCollection = collection(db, 'content-requests');
const reportsCollection = collection(db, 'problem-reports');

// ======== REALTIME LISTENERS ========

const createOnSnapshotListener = <T extends { reportedAt: string } | { requestedAt: string }>(
  col: CollectionReference,
  orderByField: 'reportedAt' | 'requestedAt',
  setData: (data: T[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(col, orderBy(orderByField, 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      // Convert Firestore Timestamp to ISO string
      const timestamp = (data[orderByField] as Timestamp).toDate().toISOString();
      items.push({ ...data, id, [orderByField]: timestamp } as T);
    });
    setData(items);
  }, (error) => {
    console.error(`Error listening to ${col.id} collection:`, error);
    onError(error);
  });
  
  return unsubscribe;
};

export const onRequestsUpdated = (
  callback: (requests: ContentRequest[]) => void,
  onError: (error: Error) => void
) => {
  return createOnSnapshotListener<ContentRequest>(requestsCollection, 'requestedAt', callback, onError);
};

export const onProblemReportsUpdated = (
  callback: (reports: ProblemReport[]) => void,
  onError: (error: Error) => void
) => {
  // Firestore timestamps for reports are in 'reportedAt'
  return createOnSnapshotListener<ProblemReport>(reportsCollection, 'reportedAt', callback, onError);
};


// ======== CONTENT REQUESTS ========

export const saveContentRequest = async (request: Omit<ContentRequest, 'id' | 'requestedAt' | 'status'>): Promise<void> => {
  const newRequest: FirebaseContentRequest = {
    ...request,
    requestedAt: Timestamp.now(),
    status: 'Pendente',
  };
  await addDoc(requestsCollection, newRequest);
};

export const updateContentRequestStatus = async (id: string, status: ContentRequest['status']): Promise<void> => {
    const requestDoc = doc(db, 'content-requests', id);
    await updateDoc(requestDoc, { status });
}

export const deleteContentRequest = async (id: string): Promise<void> => {
    const requestDoc = doc(db, 'content-requests', id);
    await deleteDoc(requestDoc);
};


// ======== PROBLEM REPORTS ========

export const saveProblemReport = async (report: Omit<ProblemReport, 'id' | 'reportedAt' | 'status'>): Promise<void> => {
  const newReport: FirebaseProblemReport = {
    ...report,
    reportedAt: Timestamp.now(),
    status: 'Aberto',
  };
  await addDoc(reportsCollection, newReport);
};

export const updateProblemReportStatus = async (id: string, status: ProblemReport['status']): Promise<void> => {
    const reportDoc = doc(db, 'problem-reports', id);
    await updateDoc(reportDoc, { status });
}
