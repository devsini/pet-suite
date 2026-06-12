import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

export function useSupabaseMutation<TData, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation<TData, TError, TVariables>(mutationFn, options);
}
