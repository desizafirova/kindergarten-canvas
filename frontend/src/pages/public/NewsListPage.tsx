import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import axios from 'axios';
import { useTranslation } from '@/lib/i18n';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
}

export function NewsListPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchNews = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await axios.get('/api/v1/public/news', {
          signal: abortController.signal,
        });

        if (response.data.status === 'success') {
          setNewsItems(response.data.data.news);
        } else {
          setIsError(true);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (axios.isCancel(error)) {
          return;
        }

        console.error('Error fetching published news:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();

    return () => {
      abortController.abort();
    };
  }, []);

  const handleCardClick = (id: number) => {
    navigate(`/news/${id}`);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent, id: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(`/news/${id}`);
    }
  };

  const getExcerpt = (content: string): string => {
    // Remove HTML tags and get first 150 characters
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 150
      ? textContent.substring(0, 150) + '...'
      : textContent;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t.publicNews.sectionTitle}
          </h1>
          <p className="text-gray-600">{t.publicNews.loading}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t.publicNews.sectionTitle}
          </h1>
          <p className="text-red-600">{t.publicNews.error}</p>
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t.publicNews.sectionTitle}
          </h1>
          <p className="text-gray-600">{t.publicNews.emptyState}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t.publicNews.sectionTitle}
        </h1>

        {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <article
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(item.id)}
              onKeyDown={(e) => handleCardKeyDown(e, item.id)}
              aria-label={`Отвори новина: ${item.title}`}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {/* Image */}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="aspect-video object-cover w-full"
                />
              )}

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {item.title}
                </h2>

                <p className="text-gray-600 mb-4">
                  {getExcerpt(item.content)}
                </p>

                <time className="text-sm text-gray-500">
                  {format(new Date(item.publishedAt), 'dd.MM.yyyy', { locale: bg })}
                </time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
