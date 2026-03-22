import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface HealthData {
  status: string;
  uptime: number;
  version: string;
}

interface MetricsData {
  requestCountLastHour: number;
  requestCountLast24h: number;
  averageResponseTimeMs: number;
  errorRate: number;
}

interface EnvConfigEntry {
  name: string;
  status: 'configured' | 'missing';
}

interface ErrorLogEntry {
  timestamp: string;
  level: string;
  message: string;
  method?: string;
  url?: string;
  userId?: number | null;
  errorType?: string;
}

interface DeveloperData {
  health: HealthData;
  metrics: MetricsData;
  envConfig: EnvConfigEntry[];
  recentErrors: ErrorLogEntry[];
}

export default function DeveloperPage() {
  const [data, setData] = useState<DeveloperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/v1/admin/developer');
      setData(response.data.data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Нямате достъп до тази страница. Изисква се роля Разработчик.');
      } else {
        setError('Грешка при зареждане на данните.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Зареждане...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Разработчик</h1>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
        >
          Обнови
        </button>
      </div>

      {/* System Health */}
      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="text-lg font-semibold">Системно здраве</h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              data.health.status === 'ok'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {data.health.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Версия: {data.health.version}</p>
        <p className="text-sm text-muted-foreground">
          Uptime: {Math.floor(data.health.uptime / 3600)}ч{' '}
          {Math.floor((data.health.uptime % 3600) / 60)}м {data.health.uptime % 60}с
        </p>
      </section>

      {/* API Metrics */}
      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="text-lg font-semibold">API Метрики</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-muted rounded p-3 text-center">
            <p className="text-2xl font-bold">{data.metrics.requestCountLastHour}</p>
            <p className="text-xs text-muted-foreground mt-1">Заявки (1ч)</p>
          </div>
          <div className="bg-muted rounded p-3 text-center">
            <p className="text-2xl font-bold">{data.metrics.requestCountLast24h}</p>
            <p className="text-xs text-muted-foreground mt-1">Заявки (24ч)</p>
          </div>
          <div className="bg-muted rounded p-3 text-center">
            <p className="text-2xl font-bold">{data.metrics.averageResponseTimeMs}ms</p>
            <p className="text-xs text-muted-foreground mt-1">Средно време</p>
          </div>
          <div className="bg-muted rounded p-3 text-center">
            <p className="text-2xl font-bold">
              {(data.metrics.errorRate * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Грешки</p>
          </div>
        </div>
      </section>

      {/* Environment Config */}
      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="text-lg font-semibold">Конфигурация</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium">Променлива</th>
                <th className="text-left py-2 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {data.envConfig.map((entry) => (
                <tr key={entry.name} className="border-b last:border-0">
                  <td className="py-1.5 pr-4 font-mono text-xs">{entry.name}</td>
                  <td className="py-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        entry.status === 'configured'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {entry.status === 'configured' ? 'зададена' : 'липсва'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Errors */}
      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="text-lg font-semibold">
          Последни грешки{' '}
          <span className="text-sm font-normal text-muted-foreground">
            (последни {data.recentErrors.length})
          </span>
        </h2>
        {data.recentErrors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Няма записани грешки.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 font-medium whitespace-nowrap">Време</th>
                  <th className="text-left py-2 pr-3 font-medium">Ниво</th>
                  <th className="text-left py-2 pr-3 font-medium">Съобщение</th>
                  <th className="text-left py-2 pr-3 font-medium">Метод</th>
                  <th className="text-left py-2 font-medium">URL</th>
                </tr>
              </thead>
              <tbody>
                {data.recentErrors.map((entry, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-1.5 pr-3 font-mono text-xs whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString('bg-BG')}
                    </td>
                    <td className="py-1.5 pr-3">
                      <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs font-medium">
                        {entry.level}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3 max-w-xs truncate" title={entry.message}>
                      {entry.message}
                    </td>
                    <td className="py-1.5 pr-3 font-mono text-xs">{entry.method ?? '—'}</td>
                    <td className="py-1.5 font-mono text-xs truncate max-w-xs" title={entry.url}>
                      {entry.url ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
