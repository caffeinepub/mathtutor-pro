import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Attendance, AttendanceSummary, AttendanceStatus } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetAttendanceForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Attendance[]>({
    queryKey: ['attendance', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || studentPrincipal === null) return [];
      return actor.getAttendanceForStudent(studentPrincipal);
    },
    enabled: !!actor && !isFetching && studentPrincipal !== null,
  });
}

export function useGetAttendanceSummary(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceSummary>({
    queryKey: ['attendanceSummary', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || studentPrincipal === null) {
        return { totalSessions: BigInt(0), presentCount: BigInt(0), absentCount: BigInt(0) };
      }
      return actor.getAttendanceSummary(studentPrincipal);
    },
    enabled: !!actor && !isFetching && studentPrincipal !== null,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.studentPrincipal.toString()] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary', variables.studentPrincipal.toString()] });
    },
  });
}
