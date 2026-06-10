import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';
import { describe, it, expect } from 'vitest';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(<PageHeader title="Title" description="Description" />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
