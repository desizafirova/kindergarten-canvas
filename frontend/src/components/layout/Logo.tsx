import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo.png';

export const Logo = () => {
  return (
    <Link
      to="/admin/dashboard"
      className="flex items-center justify-center p-4 hover:opacity-80 transition-opacity"
      aria-label="Go to dashboard"
    >
      <img
        src={logoImage}
        alt="Kindergarten Logo"
        className="h-12 w-auto lg:h-16"
      />
    </Link>
  );
};
