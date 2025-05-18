import { useTranslations } from 'next-intl';
import { Navbar } from './navbar';

export default function NavbarWrapper() {
  const t = useTranslations('Nav');

  return (
    <Navbar
      githubLabel={t('github')}
    />
  );
} 
