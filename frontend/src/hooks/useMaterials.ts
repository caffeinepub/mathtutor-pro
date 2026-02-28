import { useGetMaterialsForStudent, useAddMaterial, useDeleteMaterial } from './useQueries';
import { Principal } from '@dfinity/principal';

export { useGetMaterialsForStudent, useAddMaterial, useDeleteMaterial };

export function useMaterialsForStudent(principalStr: string | null) {
  const principal = principalStr ? Principal.fromText(principalStr) : null;
  return useGetMaterialsForStudent(principal);
}
