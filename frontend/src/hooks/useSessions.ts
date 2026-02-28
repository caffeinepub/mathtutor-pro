import { useGetSessionsForStudent, useAddSession, useDeleteSession } from './useQueries';
import { Principal } from '@dfinity/principal';

export { useGetSessionsForStudent, useAddSession, useDeleteSession };

export function useSessionsForStudent(principalStr: string | null) {
  const principal = principalStr ? Principal.fromText(principalStr) : null;
  return useGetSessionsForStudent(principal);
}
