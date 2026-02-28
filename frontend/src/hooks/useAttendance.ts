import { useGetAttendanceForStudent, useGetAttendanceSummary, useMarkAttendance } from './useQueries';
import { Principal } from '@dfinity/principal';

export { useGetAttendanceForStudent, useGetAttendanceSummary, useMarkAttendance };

export function useAttendanceForStudent(principalStr: string | null) {
  const principal = principalStr ? Principal.fromText(principalStr) : null;
  return useGetAttendanceForStudent(principal);
}
