import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  ApprovalStatus,
  UserApprovalInfo,
  UpiPayment,
  UserProfile,
  Session,
  Material,
  Attendance,
  AttendanceSummary,
  AttendanceStatus,
} from '../backend';
import { Principal } from '@dfinity/principal';

// ── User Profile ──────────────────────────────────────────────────────────────

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

// ── Approvals ─────────────────────────────────────────────────────────────────

export function useListApprovals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !actorFetching,
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
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Payments ──────────────────────────────────────────────────────────────────

export function useGetAllPayments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UpiPayment[]>({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPendingPayments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UpiPayment[]>({
    queryKey: ['pendingPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingPayments();
    },
    enabled: !!actor && !actorFetching,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
    },
  });
}

/** Approve a UPI payment (canonical name) */
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
    },
  });
}

/** Alias kept for backward compatibility */
export const useApproveUpiPayment = useApprovePayment;

/** Reject a UPI payment (canonical name) */
export function useRejectPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, rejectionNote }: { paymentId: bigint; rejectionNote: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectUpiPayment(paymentId, rejectionNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
    },
  });
}

/** Alias kept for backward compatibility */
export const useRejectUpiPayment = useRejectPayment;

// ── Sessions ──────────────────────────────────────────────────────────────────

export function useGetSessionsForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Session[]>({
    queryKey: ['sessions', studentPrincipal?.toString() ?? 'none'],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return actor.getSessionsForStudent(studentPrincipal);
    },
    enabled: !!actor && !actorFetching && !!studentPrincipal,
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
      topic: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSession(
        params.studentPrincipal,
        params.date,
        params.time,
        params.durationHours,
        params.meetLink,
        params.topic
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sessions', variables.studentPrincipal.toString()],
      });
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
    },
  });
}

// ── Materials ─────────────────────────────────────────────────────────────────

export function useGetMaterialsForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Material[]>({
    queryKey: ['materials', studentPrincipal?.toString() ?? 'none'],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return actor.getMaterialsForStudent(studentPrincipal);
    },
    enabled: !!actor && !actorFetching && !!studentPrincipal,
  });
}

export function useAddMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentPrincipal: Principal;
      title: string;
      description: string | null;
      fileData: Uint8Array | null;
      fileLink: string | null;
      relatedCourse: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMaterial(
        params.studentPrincipal,
        params.title,
        params.description,
        params.fileData,
        params.fileLink,
        params.relatedCourse
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['materials', variables.studentPrincipal.toString()],
      });
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

// ── Attendance ────────────────────────────────────────────────────────────────

export function useGetAttendanceForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Attendance[]>({
    queryKey: ['attendance', studentPrincipal?.toString() ?? 'none'],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return actor.getAttendanceForStudent(studentPrincipal);
    },
    enabled: !!actor && !actorFetching && !!studentPrincipal,
  });
}

export function useGetAttendanceSummary(studentPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AttendanceSummary>({
    queryKey: ['attendanceSummary', studentPrincipal?.toString() ?? 'none'],
    queryFn: async () => {
      if (!actor || !studentPrincipal) throw new Error('No principal');
      return actor.getAttendanceSummary(studentPrincipal);
    },
    enabled: !!actor && !actorFetching && !!studentPrincipal,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentPrincipal: Principal;
      sessionId: bigint;
      status: AttendanceStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAttendance(params.studentPrincipal, params.sessionId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary'] });
    },
  });
}

// ── Admin check ───────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Products (used for health check) ─────────────────────────────────────────

export function useGetProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}
