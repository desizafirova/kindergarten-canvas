import { AvatarPlaceholder } from './AvatarPlaceholder';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
}

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const fullName = `${teacher.firstName} ${teacher.lastName}`;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Photo or Placeholder */}
      <div className="aspect-square relative bg-gray-100">
        {teacher.photoUrl ? (
          <img
            src={teacher.photoUrl}
            alt={`${fullName} - ${teacher.position}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <AvatarPlaceholder
            firstName={teacher.firstName}
            lastName={teacher.lastName}
          />
        )}
      </div>

      {/* Teacher Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{fullName}</h3>
        <p className="text-gray-600 mb-3">{teacher.position}</p>

        {teacher.bio && (
          <div
            className="text-sm text-gray-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: teacher.bio }}
          />
        )}
      </div>
    </article>
  );
}
