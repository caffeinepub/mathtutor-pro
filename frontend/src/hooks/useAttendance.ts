import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Attendance, AttendanceSummary, AttendanceStatus } from '../backend';

export function useGetAttendanceForStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Attendance[]>({
    queryKey: ['attendance', studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      return actor.getAttendanceForStudent(studentId);
    },
    enabled: !!actor && !isFetching && studentId !== null,
  });
}

export function useGetAttendanceSummary(studentId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceSummary>({
    queryKey: ['attendanceSummary', studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) {
        return { totalSessions: BigInt(0), presentCount: BigInt(0), absentCount: BigInt(0) };
      }
      return actor.getAttendanceSummary(studentId);
    },
    enabled: !!actor && !isFetching && studentId !== null,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      sessionId: bigint;
      status: AttendanceStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAttendance(params.studentId, params.sessionId, params.status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.studentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary', variables.studentId.toString()] });
    },
  });
}
