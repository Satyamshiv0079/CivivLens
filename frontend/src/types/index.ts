export type Role = 'CITIZEN' | 'MODERATOR' | 'ADMIN';

export type IssueCategory =
  | 'POTHOLE'
  | 'GARBAGE'
  | 'BROKEN_STREETLIGHT'
  | 'WATER_LEAKAGE'
  | 'OTHER';

export type ReportStatus =
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export type UserDto = User;

export interface ReportStatusHistoryItem {
  id: number;
  status: ReportStatus;
  comment?: string;
  updatedBy: string;
  createdAt: string;
}

export interface CivicReport {
  id: number;
  title: string;
  description: string;
  category: IssueCategory;
  status: ReportStatus;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address?: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: ReportStatusHistoryItem[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface HealthStatus {
  status: string;
  app: string;
  timestamp: string;
  database: string;
}
