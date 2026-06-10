import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the hooks module BEFORE importing the component
vi.mock('./monitoring.hooks', () => ({
  useCreateMonitoringEntry: () => ({ mutateAsync: vi.fn().mockResolvedValue({ id: 'm1' }), status: 'idle' }),
  usePetMonitoring: () => ({ data: [], isLoading: false })
}));

// Mock PageHeader to avoid deep rendering
vi.mock('@/components/common/PageHeader', () => ({ PageHeader: () => <div /> }));

describe('CreateMonitoringPage component', () => {
  it('renders and shows validation errors when submit with empty fields', async () => {
    const qc = new QueryClient();
    const { default: CreateMonitoringPage } = await import('./pages/CreateMonitoringPage');

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <CreateMonitoringPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const save = screen.getByText('Save Entry');
    fireEvent.click(save);
    expect(await screen.findByText('Pet ID is required')).toBeTruthy();
  });
});
