/**
 * Admin Dashboard Page
 * Displays 6 content type cards with counts and navigation
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { useContentCounts } from '@/hooks/useContentCounts';
import { ContentTypeCard } from '@/components/dashboard/ContentTypeCard';

// Content types configuration with icons, paths, and keys
const contentTypes = [
  { key: 'news' as const, icon: '📰', path: '/admin/news' },
  { key: 'careers' as const, icon: '💼', path: '/admin/careers' },
  { key: 'events' as const, icon: '📅', path: '/admin/events' },
  { key: 'deadlines' as const, icon: '⏰', path: '/admin/deadlines' },
  { key: 'gallery' as const, icon: '🖼️', path: '/admin/gallery' },
  { key: 'teachers' as const, icon: '👨‍🏫', path: '/admin/teachers' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { data: counts, loading, error } = useContentCounts();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const handleCreateClick = (path: string) => {
    navigate(`${path}/create`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.nav.dashboard}</h1>

      {error && (
        <div
          className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm"
          role="alert"
          data-testid="api-error-banner"
        >
          {t.errors.networkError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600">{t.common.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="content-cards-grid">
          {contentTypes.map((type) => (
            <ContentTypeCard
              key={type.key}
              icon={type.icon}
              title={t.contentTypes[type.key].title}
              draftCount={counts?.[type.key]?.draft ?? 0}
              publishedCount={counts?.[type.key]?.published ?? 0}
              onCardClick={() => handleCardClick(type.path)}
              onCreateClick={() => handleCreateClick(type.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
