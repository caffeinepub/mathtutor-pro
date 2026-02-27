import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Material } from '../backend';

export function useGetMaterialsForStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Material[]>({
    queryKey: ['materials', studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      return actor.getMaterialsForStudent(studentId);
    },
    enabled: !!actor && !isFetching && studentId !== null,
  });
}

export function useAddMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      title: string;
      description: string | null;
      fileData: Uint8Array | null;
      fileLink: string | null;
      relatedCourse: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMaterial(
        params.studentId,
        params.title,
        params.description,
        params.fileData,
        params.fileLink,
        params.relatedCourse
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials', variables.studentId.toString()] });
    },
  });
}

export function useDeleteMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { materialId: bigint; studentId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMaterial(params.materialId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials', variables.studentId.toString()] });
    },
  });
}
