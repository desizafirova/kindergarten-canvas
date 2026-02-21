import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';

describe('Logo', () => {
  it('renders logo image', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );

    const logo = screen.getByAltText('Kindergarten Logo');
    expect(logo).toBeInTheDocument();
  });

  it('links to dashboard', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );

    const link = screen.getByLabelText('Go to dashboard');
    expect(link).toHaveAttribute('href', '/admin/dashboard');
  });

  it('has hover opacity transition', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );

    const link = screen.getByLabelText('Go to dashboard');
    expect(link).toHaveClass('hover:opacity-80');
    expect(link).toHaveClass('transition-opacity');
  });

  it('has responsive sizing classes', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );

    const logo = screen.getByAltText('Kindergarten Logo');
    expect(logo).toHaveClass('h-12');
    expect(logo).toHaveClass('lg:h-16');
  });

  it('has proper accessibility label', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );

    const link = screen.getByLabelText('Go to dashboard');
    expect(link).toBeInTheDocument();
  });
});
