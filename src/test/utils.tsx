import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { render, type RenderOptions } from '@testing-library/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
});

interface CustomRenderOptions extends RenderOptions {
  route?: string;
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement, options?: CustomRenderOptions) {
  const wrapper = ({ children }: { children: ReactNode }) => <AllProviders>{children}</AllProviders>;

  return render(ui, { wrapper, ...options });
}
