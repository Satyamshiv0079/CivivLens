import { AuthResponse, CivicReport, HealthStatus, IssueCategory, ReportStatus, User, UserDto } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Standard fetch helper with JWT bearer authorization support
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('civiclens_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unexpected error occurred' }));
    throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export interface ReportFilterParams {
  category?: IssueCategory | '';
  status?: ReportStatus | '';
  myOnly?: boolean;
}

export interface ReportStatistics {
  totalReports: number;
  submittedReports: number;
  verifiedReports: number;
  inProgressReports: number;
  resolvedReports: number;
  rejectedReports: number;
  categoryCounts: Record<string, number>;
}

export interface AiCategorizationResult {
  suggestedCategory: IssueCategory;
  confidence: number;
  explanation: string;
}

export interface DuplicateCandidate {
  id: number;
  title: string;
  status: ReportStatus;
  distanceMeters: number;
  similarityScore: number;
  address?: string;
}

export const api = {
  // System Health
  checkHealth: (): Promise<HealthStatus> => request<HealthStatus>('/health'),

  // Authentication
  register: (payload: { name: string; email: string; password: string }): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: (): Promise<UserDto> => request<UserDto>('/auth/me'),

  // Civic Reports
  getReports: (params?: ReportFilterParams): Promise<CivicReport[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.myOnly) searchParams.set('myOnly', 'true');
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<CivicReport[]>(`/reports${query}`);
  },

  getReportById: (id: number): Promise<CivicReport> => request<CivicReport>(`/reports/${id}`),

  createReport: (formData: FormData): Promise<CivicReport> =>
    request<CivicReport>('/reports', {
      method: 'POST',
      body: formData,
    }),

  updateReport: (
    id: number,
    payload: { title?: string; description?: string; category?: IssueCategory }
  ): Promise<CivicReport> =>
    request<CivicReport>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteReport: (id: number): Promise<void> =>
    request<void>(`/reports/${id}`, {
      method: 'DELETE',
    }),

  updateReportStatus: (
    id: number,
    payload: { status: ReportStatus; comment?: string }
  ): Promise<CivicReport> =>
    request<CivicReport>(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getReportStatistics: (): Promise<ReportStatistics> =>
    request<ReportStatistics>('/reports/statistics'),

  // Stage 7: AI-Assisted Features
  aiCategorize: (payload: { title: string; description: string }): Promise<AiCategorizationResult> =>
    request<AiCategorizationResult>('/reports/ai-categorize', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  checkDuplicates: (payload: {
    latitude: number;
    longitude: number;
    category: IssueCategory;
    title: string;
    description?: string;
  }): Promise<DuplicateCandidate[]> =>
    request<DuplicateCandidate[]>('/reports/check-duplicates', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Token management helpers
  setToken: (token: string): void => localStorage.setItem('civiclens_token', token),
  getToken: (): string | null => localStorage.getItem('civiclens_token'),
  removeToken: (): void => localStorage.removeItem('civiclens_token'),

  // User storage helpers
  saveUser: (user: User): void => localStorage.setItem('civiclens_user', JSON.stringify(user)),
  getSavedUser: (): User | null => {
    const raw = localStorage.getItem('civiclens_user');
    return raw ? JSON.parse(raw) : null;
  },
  clearUser: (): void => localStorage.removeItem('civiclens_user'),
};
