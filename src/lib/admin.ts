
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

const createOnSnapshotListener = <T>(
  col: collection,
  setData: (data: T[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(col, orderBy('requestedAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      // Convert Firestore Timestamp to ISO string
      const requestedAt = (data.requestedAt as Timestamp).toDate().toISOString();
      items.push({ ...data, id, requestedAt } as T);
    });
    setData(items);
  }, (error) => {
    console.error("Error listening to collection:", error);
    onError(error);
  });
};

export const onRequestsUpdated = (
  callback: (requests: ContentRequest[]) => void,
  onError: (error: Error) => void
) => {
  return createOnSnapshotListener<ContentRequest>(requestsCollection, callback, onError);
};

export const onProblemReportsUpdated = (
  callback: (reports: ProblemReport[]) => void,
  onError: (error: Error) => void
) => {
  return createOnSnapshotListener<ProblemReport>(reportsCollection, callback, onError);
};


// ======== CONTENT REQUESTS ========

export const getContentRequests = async (): Promise<ContentRequest[]> => {
  const q = query(requestsCollection, orderBy('requestedAt', 'desc'));
  const snapshot = await getDocs(q);
  const requests: ContentRequest[] = [];
  snapshot.forEach(doc => {
      const data = doc.data() as FirebaseContentRequest;
      requests.push({
          id: doc.id,
          ...data,
          requestedAt: data.requestedAt.toDate().toISOString(),
      });
  });
  return requests;
};

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

export const getProblemReports = async (): Promise<ProblemReport[]> => {
  const q = query(reportsCollection, orderBy('reportedAt', 'desc'));
  const snapshot = await getDocs(q);
  const reports: ProblemReport[] = [];
  snapshot.forEach(doc => {
      const data = doc.data() as FirebaseProblemReport;
      reports.push({
          id: doc.id,
          ...data,
          reportedAt: data.reportedAt.toDate().toISOString(),
      });
  });
  return reports;
};

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
