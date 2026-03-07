import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { TeacherCard } from '@/components/public/TeacherCard';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number | null;
}

export function TeachersPage() {
  const t = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchTeachers = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await api.get('/api/v1/public/teachers', {
          signal: abortController.signal,
        });

        if (response.data.status === 'success') {
          setTeachers(response.data.data.teachers);
        } else {
          setIsError(true);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return;
        }

        console.error('Error fetching published teachers:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();

    return () => {
      abortController.abort();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t.publicTeachers.sectionTitle}
          </h1>
          <p className="text-gray-600">{t.publicTeachers.loading}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t.publicTeachers.sectionTitle}
          </h1>
          <p className="text-red-600">{t.publicTeachers.error}</p>
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t.publicTeachers.sectionTitle}
          </h1>
          <p className="text-gray-600">{t.publicTeachers.emptyState}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t.publicTeachers.sectionTitle}
        </h1>

        {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </div>
    </div>
  );
}
