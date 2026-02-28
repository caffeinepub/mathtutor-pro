import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile, UpiPayment, ApprovalStatus, Student, Session, Material, UpiPaymentStatus, StripeSessionStatus } from '../backend';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Approvals
export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

// Payments
export function useGetAllPayments() {
  const { actor, isFetching } = useActor();

  return useQuery<UpiPayment[]>({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingPayments() {
  const { actor, isFetching } = useActor();

  return useQuery<UpiPayment[]>({
    queryKey: ['pendingPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApprovePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, uniqueCode }: { paymentId: bigint; uniqueCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveUpiPayment(paymentId, uniqueCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
    },
  });
}

// Backward-compatible alias
export const useApproveUpiPayment = useApprovePayment;

export function useRejectPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, rejectionNote }: { paymentId: bigint; rejectionNote?: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectUpiPayment(paymentId, rejectionNote ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
    },
  });
}

// Backward-compatible alias
export const useRejectUpiPayment = useRejectPayment;

export function useSubmitUpiPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      courseName: string;
      sessionType: string;
      pricePerHour: bigint;
      hours: bigint;
      totalAmount: bigint;
      upiTransactionId: string;
      fullName: string;
      email: string;
      phone: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitUpiPayment(
        params.courseName,
        params.sessionType,
        params.pricePerHour,
        params.hours,
        params.totalAmount,
        params.upiTransactionId,
        params.fullName,
        params.email,
        params.phone
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
    },
  });
}

// Sessions
export function useGetSessionsForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Session[]>({
    queryKey: ['sessions', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return actor.getSessionsForStudent(studentPrincipal);
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useAddSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentPrincipal: Principal;
      date: string;
      time: string;
      durationHours: bigint;
      meetLink: string;
      topic?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSession(
        params.studentPrincipal,
        params.date,
        params.time,
        params.durationHours,
        params.meetLink,
        params.topic ?? null
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.studentPrincipal.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['mySessions'] });
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['mySessions'] });
    },
  });
}

// Materials
export function useGetMaterialsForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Material[]>({
    queryKey: ['materials', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return actor.getMaterialsForStudent(studentPrincipal);
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useAddMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentPrincipal: Principal;
      title: string;
      description?: string;
      fileData?: Uint8Array;
      fileLink?: string;
      relatedCourse: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMaterial(
        params.studentPrincipal,
        params.title,
        params.description ?? null,
        params.fileData ?? null,
        params.fileLink ?? null,
        params.relatedCourse
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials', variables.studentPrincipal.toString()] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useDeleteMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMaterial(materialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

// Attendance
export function useGetAttendanceForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['attendance', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return actor.getAttendanceForStudent(studentPrincipal);
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useGetAttendanceSummary(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['attendanceSummary', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return null;
      return actor.getAttendanceSummary(studentPrincipal);
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentPrincipal: Principal;
      sessionId: bigint;
      status: 'present' | 'absent';
    }) => {
      if (!actor) throw new Error('Actor not available');
      const status = params.status === 'present'
        ? { __kind__: 'present' as const, present: null }
        : { __kind__: 'absent' as const, absent: null };
      return actor.markAttendance(params.studentPrincipal, params.sessionId, status as any);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.studentPrincipal.toString()] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary', variables.studentPrincipal.toString()] });
    },
  });
}

// Admin check
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Products
export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Students (admin)
export function useAllStudents() {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['allStudents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

// Update student (admin)
export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      principal: Principal;
      fullName: string;
      email: string;
      phone: string;
      course: string;
      sessionType: string;
      hours: bigint;
      paymentStatus: { __kind__: 'upi'; upi: UpiPaymentStatus } | { __kind__: 'stripe'; stripe: StripeSessionStatus };
      transactionId: string;
      enrollmentDate: bigint;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStudent(
        params.principal,
        params.fullName,
        params.email,
        params.phone,
        params.course,
        params.sessionType,
        params.hours,
        params.paymentStatus,
        params.transactionId,
        params.enrollmentDate,
        params.isActive
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
      queryClient.invalidateQueries({ queryKey: ['myEnrollment'] });
    },
  });
}

// My Enrollment (student)
export function useMyEnrollment() {
  const { actor, isFetching } = useActor();

  return useQuery<Student | null>({
    queryKey: ['myEnrollment'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyEnrollment();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Student sessions (for authenticated student using their own principal)
export function useMyStudentSessions(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Session[]>({
    queryKey: ['mySessions', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return actor.getSessionsForStudent(studentPrincipal);
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

// Finish student registration
export function useFinishStudentRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      fullName: string;
      email: string;
      phone: string;
      course: string;
      sessionType: string;
      hours: bigint;
      paymentType: { __kind__: 'upi'; upi: UpiPaymentStatus } | { __kind__: 'stripe'; stripe: StripeSessionStatus };
      transactionId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.finishStudentRegistration(
        params.fullName,
        params.email,
        params.phone,
        params.course,
        params.sessionType,
        params.hours,
        params.paymentType,
        params.transactionId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEnrollment'] });
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
    },
  });
}
