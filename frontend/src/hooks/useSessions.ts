import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Session } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetSessionsForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Session[]>({
    queryKey: ['sessions', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || studentPrincipal === null) return [];
      return actor.getSessionsForStudent(studentPrincipal);
    },
    enabled: !!actor && !isFetching && studentPrincipal !== null,
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
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.studentPrincipal.toString()] });
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: bigint; studentPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSession(params.sessionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.studentPrincipal.toString()] });
    },
  });
}
