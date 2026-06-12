import { toast, type ToastOptions } from 'react-hot-toast';

export function useToast() {
  return {
    success: (message: string, options?: ToastOptions) => toast.success(message, options),
    error: (message: string, options?: ToastOptions) => toast.error(message, options),
    info: (message: string, options?: ToastOptions) => toast(message, { ...options, icon: 'ℹ️' }),
    promise: <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }, options?: ToastOptions) =>
      toast.promise(promise, messages, options)
  };
}
