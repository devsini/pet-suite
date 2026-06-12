import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';

export function useSupabaseQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>(queryKey, queryFn, options);
}
