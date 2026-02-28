import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UpiPayment, ApprovalStatus, Session, Material, Attendance, AttendanceSummary, AttendanceStatus, UserApprovalInfo } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

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

// ─── Approval ────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
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

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['listApprovals'],
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
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
    },
  });
}

// ─── UPI Payments ────────────────────────────────────────────────────────────

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

export function useApproveUpiPayment() {
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

export function useRejectUpiPayment() {
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

// ─── Sessions ─────────────────────────────────────────────────────────────────

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
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

// ─── Materials ────────────────────────────────────────────────────────────────

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
    onSuccess: () => {
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

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useGetAttendanceForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Attendance[]>({
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

  return useQuery<AttendanceSummary>({
    queryKey: ['attendanceSummary', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) throw new Error('No principal');
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

// ─── Admin check ──────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Products (used for health check) ────────────────────────────────────────

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
