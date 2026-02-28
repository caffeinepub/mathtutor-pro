import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import { Material } from '../backend';

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
