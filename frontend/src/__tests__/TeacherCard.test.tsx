import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeacherCard } from '@/components/public/TeacherCard';

describe('TeacherCard', () => {
  it('displays teacher full name', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: null,
      photoUrl: null,
    };

    render(<TeacherCard teacher={mockTeacher} />);

    expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
  });

  it('displays teacher position', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Иван',
      lastName: 'Стефанов',
      position: 'Директор',
      bio: null,
      photoUrl: null,
    };

    render(<TeacherCard teacher={mockTeacher} />);

    expect(screen.getByText('Директор')).toBeInTheDocument();
  });

  it('displays teacher photo when photoUrl is provided', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: null,
      photoUrl: 'https://res.cloudinary.com/example/teacher.jpg',
    };

    render(<TeacherCard teacher={mockTeacher} />);

    const img = screen.getByAltText('Мария Петрова - Учител') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://res.cloudinary.com/example/teacher.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('displays placeholder when photoUrl is null', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Иван',
      lastName: 'Стефанов',
      position: 'Директор',
      bio: null,
      photoUrl: null,
    };

    render(<TeacherCard teacher={mockTeacher} />);

    // Should show initials placeholder
    expect(screen.getByText('ИС')).toBeInTheDocument();

    // Should NOT show an img element
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('displays bio when bio is provided', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: '<p>Опитен учител с 10 години стаж в предучилищно образование</p>',
      photoUrl: null,
    };

    render(<TeacherCard teacher={mockTeacher} />);

    expect(screen.getByText(/Опитен учител с 10 години стаж/)).toBeInTheDocument();
  });

  it('does not display bio section when bio is null', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: null,
      photoUrl: null,
    };

    const { container } = render(<TeacherCard teacher={mockTeacher} />);

    // Should not have bio content
    const bioElement = container.querySelector('.prose');
    expect(bioElement).not.toBeInTheDocument();
  });

  it('does not display bio section when bio is empty string', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: '',
      photoUrl: null,
    };

    const { container } = render(<TeacherCard teacher={mockTeacher} />);

    // Should not have bio content
    const bioElement = container.querySelector('.prose');
    expect(bioElement).not.toBeInTheDocument();
  });

  it('renders bio HTML safely', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: '<p><strong>Опитен</strong> учител с <em>10 години</em> стаж</p>',
      photoUrl: null,
    };

    render(<TeacherCard teacher={mockTeacher} />);

    // Bio should be rendered with HTML
    expect(screen.getByText(/Опитен/)).toBeInTheDocument();
    expect(screen.getByText(/10 години/)).toBeInTheDocument();
  });

  it('uses article semantic element for card', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: null,
      photoUrl: null,
    };

    const { container } = render(<TeacherCard teacher={mockTeacher} />);

    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });

  it('includes proper alt text for images', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Анна',
      lastName: 'Георгиева',
      position: 'Помощник-възпитател',
      bio: null,
      photoUrl: 'https://example.com/photo.jpg',
    };

    render(<TeacherCard teacher={mockTeacher} />);

    const img = screen.getByAltText('Анна Георгиева - Помощник-възпитател');
    expect(img).toBeInTheDocument();
  });

  it('renders complete card with all fields', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: '<p>Опитен учител с 10 години стаж</p>',
      photoUrl: 'https://res.cloudinary.com/example/teacher.jpg',
    };

    render(<TeacherCard teacher={mockTeacher} />);

    // Full name
    expect(screen.getByText('Мария Петрова')).toBeInTheDocument();

    // Position
    expect(screen.getByText('Учител')).toBeInTheDocument();

    // Bio
    expect(screen.getByText(/Опитен учител с 10 години стаж/)).toBeInTheDocument();

    // Photo
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://res.cloudinary.com/example/teacher.jpg');
  });

  it('renders minimal card with only required fields', () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Иван',
      lastName: 'Стефанов',
      position: 'Директор',
      bio: null,
      photoUrl: null,
    };

    render(<TeacherCard teacher={mockTeacher} />);

    // Full name
    expect(screen.getByText('Иван Стефанов')).toBeInTheDocument();

    // Position
    expect(screen.getByText('Директор')).toBeInTheDocument();

    // Placeholder initials
    expect(screen.getByText('ИС')).toBeInTheDocument();

    // No bio
    const { container } = render(<TeacherCard teacher={mockTeacher} />);
    const bioElement = container.querySelector('.prose');
    expect(bioElement).not.toBeInTheDocument();
  });
});
