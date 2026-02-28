import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useTranslation } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
}

export function NewsDetailPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchNewsDetail = async () => {
      if (!id) {
        setNotFound(true);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setNotFound(false);

      try {
        const response = await axios.get(`/api/v1/public/news/${id}`, {
          signal: abortController.signal,
        });

        if (response.data.status === 'success') {
          setNewsItem(response.data.data.news);
        } else {
          setIsError(true);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (axios.isCancel(error)) {
          return;
        }

        console.error('Error fetching news detail:', error);

        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsDetail();

    return () => {
      abortController.abort();
    };
  }, [id]);

  const handleBackClick = () => {
    navigate('/news');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-gray-600">{t.publicNews.loading}</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-red-600 mb-4">{t.publicNews.notFound}</p>
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={20} />
            {t.publicNews.backToList}
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-red-600 mb-4">{t.publicNews.error}</p>
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={20} />
            {t.publicNews.backToList}
          </button>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back button */}
        <button
          onClick={handleBackClick}
          aria-label="Връщане към списъка с новини"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          {t.publicNews.backToList}
        </button>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image */}
          {newsItem.imageUrl && (
            <img
              src={newsItem.imageUrl}
              alt={newsItem.title}
              className="aspect-video object-cover rounded-lg w-full"
            />
          )}

          {/* Content */}
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {newsItem.title}
            </h1>

            <time className="text-sm text-gray-600 block mb-6">
              {format(new Date(newsItem.publishedAt), 'dd.MM.yyyy', { locale: bg })}
            </time>

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(newsItem.content, {
                  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
                  ALLOWED_ATTR: ['href', 'target', 'rel'],
                })
              }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
