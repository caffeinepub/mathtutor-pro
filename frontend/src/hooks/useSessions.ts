import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import { Session } from '../backend';

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
