interface AvatarPlaceholderProps {
  firstName: string;
  lastName: string;
}

export function AvatarPlaceholder({ firstName, lastName }: AvatarPlaceholderProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-500">{initials}</p>
      </div>
    </div>
  );
}
