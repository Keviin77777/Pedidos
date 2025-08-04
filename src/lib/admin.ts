
'use client';

// ======== TYPES ========

interface ContentRequest {
  id: string;
  title: string;
  type: string;
  notes?: string;
  requestedAt: string;
  status: 'Pendente' | 'Adicionado';
}

interface ProblemReport {
  id: string;
  title: string;
  problem: string;
  reportedAt: string;
  status: 'Aberto' | 'Resolvido';
}

// ======== LOCAL STORAGE HELPERS ========

const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
   if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};


// ======== CONTENT REQUESTS ========

const REQUESTS_KEY = 'cineassist_content_requests';

export const getContentRequests = (): ContentRequest[] => {
  return getFromStorage<ContentRequest>(REQUESTS_KEY);
};

export const saveContentRequest = (request: Omit<ContentRequest, 'id' | 'requestedAt' | 'status'>): void => {
  const requests = getContentRequests();
  const newRequest: ContentRequest = {
    ...request,
    id: `REQ${Date.now()}`,
    requestedAt: new Date().toISOString(),
    status: 'Pendente',
  };
  requests.unshift(newRequest); // Add to the beginning
  saveToStorage(REQUESTS_KEY, requests);
};

export const updateContentRequestStatus = (id: string, status: ContentRequest['status']): void => {
    const requests = getContentRequests();
    const index = requests.findIndex(req => req.id === id);
    if (index !== -1) {
        requests[index].status = status;
        saveToStorage(REQUESTS_KEY, requests);
    }
}


// ======== PROBLEM REPORTS ========

const REPORTS_KEY = 'cineassist_problem_reports';

export const getProblemReports = (): ProblemReport[] => {
  return getFromStorage<ProblemReport>(REPORTS_KEY);
};

export const saveProblemReport = (report: Omit<ProblemReport, 'id' | 'reportedAt' | 'status'>): void => {
  const reports = getProblemReports();
  const newReport: ProblemReport = {
    ...report,
    id: `REP${Date.now()}`,
    reportedAt: new Date().toISOString(),
    status: 'Aberto',
  };
  reports.unshift(newReport); // Add to the beginning
  saveToStorage(REPORTS_KEY, reports);
};

export const updateProblemReportStatus = (id: string, status: ProblemReport['status']): void => {
    const reports = getProblemReports();
    const index = reports.findIndex(rep => rep.id === id);
    if (index !== -1) {
        reports[index].status = status;
        saveToStorage(REPORTS_KEY, reports);
    }
}
