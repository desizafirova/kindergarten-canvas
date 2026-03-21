import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { bg } from 'date-fns/locale';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import type { PublicJob } from '@/components/public/JobCard';
import { JobApplicationModal } from '@/components/public/JobApplicationModal';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslation();
  const [job, setJob] = useState<PublicJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const abortController = new AbortController();

    const fetchJob = async () => {
      setIsLoading(true);
      setIsError(false);
      setIsNotFound(false);
      try {
        const response = await api.get(`/api/v1/public/jobs/${id}`, {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setJob(response.data.data.job);
        } else {
          setIsError(true);
        }
      } catch (error: unknown) {
        const err = error as { name?: string; code?: string; response?: { status?: number } };
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        if (err.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
    return () => abortController.abort();
  }, [id]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600">{t.publicJobs.loading}</p>
        </div>
      </section>
    );
  }

  if (isNotFound || (!isLoading && !job && !isError)) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600 mb-4">{t.publicJobs.notFound}</p>
          <Link to="/jobs" className="text-primary hover:underline">{t.publicJobs.backToList}</Link>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-red-600 mb-4">{t.publicJobs.error}</p>
          <Link to="/jobs" className="text-primary hover:underline">{t.publicJobs.backToList}</Link>
        </div>
      </section>
    );
  }

  if (!job) return null;

  const isDeadlineExpired = job.applicationDeadline
    ? isPast(new Date(job.applicationDeadline))
    : false;
  const formattedDeadline = job.applicationDeadline
    ? format(new Date(job.applicationDeadline), 'dd.MM.yyyy', { locale: bg })
    : null;

  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/jobs" className="text-sm text-primary hover:underline mb-6 inline-block">
            ← {t.publicJobs.backToList}
          </Link>
          <article>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
            {formattedDeadline && (
              <p className="text-sm text-gray-500 mb-6">
                {t.publicJobs.deadlineLabel} {formattedDeadline}
              </p>
            )}
            <div
              className="prose prose-gray max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
            {job.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.publicJobs.requirementsTitle}</h2>
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </div>
            )}
            <div className="mt-8">
              {isDeadlineExpired ? (
                <div>
                  <button
                    type="button"
                    disabled
                    className="bg-gray-200 text-gray-400 text-sm font-medium py-3 px-8 rounded cursor-not-allowed"
                  >
                    {t.publicJobs.applyButton}
                  </button>
                  <p className="text-sm text-red-500 mt-2">{t.publicJobs.deadlineExpired}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsApplicationModalOpen(true)}
                  className="bg-primary text-white text-sm font-medium py-3 px-8 rounded hover:bg-primary/90 transition-colors"
                >
                  {t.publicJobs.applyButton}
                </button>
              )}
            </div>
          </article>
        </div>
      </section>
      <JobApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        job={job ? { id: job.id, title: job.title } : null}
      />
    </>
  );
}
