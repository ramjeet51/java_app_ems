// ---------------------------------------------------------------------------
// Shared types mirroring the Spring Boot backend's DTOs / entities.
// Keep in sync with backend/src/main/java/com/ems/backend/dto/**
// ---------------------------------------------------------------------------

export type Role = 'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_MANAGER' | 'ROLE_EMPLOYEE';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  userId: number;
  fullName: string;
  email: string;
  roles: Role[];
  employeeId?: number | null;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  enabled: boolean;
  roles: Role[];
  employeeId?: number | null;
  employeeId?: number | null;
}

export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';

export interface EmployeeResponse {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  status: EmploymentStatus;
  dateOfJoining: string; // ISO date
  dateOfBirth?: string;
  baseSalary: number;
  managerId?: number | null;
  managerName?: string | null;
  address?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRequest {
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  status: EmploymentStatus;
  dateOfJoining: string;
  dateOfBirth?: string;
  baseSalary: number;
  managerId?: number | null;
  address?: string;
  profileImageUrl?: string;
}

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'WORK_FROM_HOME'
  | 'ON_LEAVE'
  | 'HOLIDAY';

export interface AttendanceResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  attendanceDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceRequest {
  employeeId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  remarks?: string;
}

export type LeaveType =
  | 'SICK'
  | 'CASUAL'
  | 'ANNUAL'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'UNPAID'
  | 'BEREAVEMENT';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedById?: number | null;
  approvedByName?: string | null;
  reviewerComment?: string;
  appliedAt: string;
  reviewedAt?: string | null;
}

export interface LeaveRequest {
  employeeId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveReviewRequest {
  decision: 'APPROVED' | 'REJECTED';
  reviewerEmployeeId: number;
  comment?: string;
}

export type PayrollStatus = 'PENDING' | 'PROCESSED' | 'PAID' | 'FAILED';

export interface PayrollResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  payPeriod: string;
  basicSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  status: PayrollStatus;
  processedAt?: string | null;
  createdAt: string;
}

export interface PayrollRequest {
  employeeId: number;
  payPeriod: string;
  basicSalary: number;
  allowances?: number;
  bonus?: number;
  deductions?: number;
  tax?: number;
}

export type ReviewStatus = 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED';

export interface PerformanceReviewResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  reviewerId: number;
  reviewerName: string;
  reviewPeriod: string;
  reviewDate: string;
  productivityScore: number;
  qualityScore: number;
  teamworkScore: number;
  communicationScore: number;
  overallRating: number;
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface PerformanceReviewRequest {
  employeeId: number;
  reviewerId: number;
  reviewPeriod: string;
  reviewDate: string;
  productivityScore: number;
  qualityScore: number;
  teamworkScore: number;
  communicationScore: number;
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  status?: ReviewStatus;
}

export interface ActivityLogResponse {
  id: number;
  actorEmail: string;
  action: string;
  entityType?: string;
  entityId?: number | null;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index
  size: number;
}

export interface DashboardSummaryResponse {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  presentToday: number;
  pendingLeaveRequests: number;
  employeesByDepartment: Record<string, number>;
  attendanceLast7Days: Record<string, number>;
  recentActivity: RecentActivityItem[];
}

export interface RecentActivityItem {
  action: string;
  actorEmail: string;
  details?: string;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  fullName: string;
  email: string;
  password: string;
  roles: string[];
  employeeId?: number | null;
}
