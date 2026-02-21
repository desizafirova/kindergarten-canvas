/**
 * ContentTypeCard Component
 * Displays a content type with icon, title, counts, and create button
 * Used on the dashboard to show all 6 content types (News, Jobs, Events, etc.)
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export interface ContentTypeCardProps {
  icon: string;                    // Emoji string (e.g., "📰")
  title: string;                   // Bulgarian title from translations
  draftCount: number;              // Draft content count
  publishedCount: number;          // Published content count
  onCardClick: () => void;         // Navigate to list view
  onCreateClick: () => void;       // Navigate to create form
}

export function ContentTypeCard({
  icon,
  title,
  draftCount,
  publishedCount,
  onCardClick,
  onCreateClick,
}: ContentTypeCardProps) {
  const t = useTranslation();

  const handleCardClick = () => {
    onCardClick();
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    onCreateClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick();
    }
  };

  // Format counts per AC1: "X чернови, Y публикувани"
  const countsText = `${draftCount} ${t.dashboard.drafts}, ${publishedCount} ${t.dashboard.published}`;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${countsText}`}
      data-testid={`content-card-${title.toLowerCase()}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <span className="text-xl">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600" data-testid="counts-text">
          {countsText}
        </p>
        <Button
          onClick={handleCreateClick}
          className="w-full"
          variant="default"
          data-testid="create-button"
        >
          {t.buttons.create}
        </Button>
      </CardContent>
    </Card>
  );
}
