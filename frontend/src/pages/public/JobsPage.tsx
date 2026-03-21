import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { JobCard, type PublicJob } from '@/components/public/JobCard';
import { JobApplicationModal } from '@/components/public/JobApplicationModal';

export function JobsPage() {
  const t = useTranslation();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchJobs = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await api.get('/api/v1/public/jobs', {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setJobs(response.data.data.jobs);
        } else {
          setIsError(true);
        }
      } catch (error: unknown) {
        const err = error as { name?: string; code?: string };
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
    return () => abortController.abort();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicJobs.sectionTitle}</h1>
          <p className="text-gray-600">{t.publicJobs.loading}</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicJobs.sectionTitle}</h1>
          <p className="text-red-600">{t.publicJobs.error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicJobs.sectionTitle}</h1>
          {jobs.length === 0 ? (
            <p className="text-gray-600">{t.publicJobs.emptyState}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={() => setSelectedJob({ id: job.id, title: job.title })}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <JobApplicationModal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
      />
    </>
  );
}
