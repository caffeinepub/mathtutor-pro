import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Material } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetMaterialsForStudent(studentPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Material[]>({
    queryKey: ['materials', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || studentPrincipal === null) return [];
      return actor.getMaterialsForStudent(studentPrincipal);
    },
    enabled: !!actor && !isFetching && studentPrincipal !== null,
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
      queryClient.invalidateQueries({ queryKey: ['materials', variables.studentPrincipal.toString()] });
    },
  });
}

export function useDeleteMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { materialId: bigint; studentPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMaterial(params.materialId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials', variables.studentPrincipal.toString()] });
    },
  });
}
