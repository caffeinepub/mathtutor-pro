import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Session } from '../backend';

export function useGetSessionsForStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Session[]>({
    queryKey: ['sessions', studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      return actor.getSessionsForStudent(studentId);
    },
    enabled: !!actor && !isFetching && studentId !== null,
  });
}

export function useAddSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      date: string;
      time: string;
      durationHours: bigint;
      meetLink: string;
      topic: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSession(
        params.studentId,
        params.date,
        params.time,
        params.durationHours,
        params.meetLink,
        params.topic
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.studentId.toString()] });
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: bigint; studentId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSession(params.sessionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.studentId.toString()] });
    },
  });
}
