import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MOBILE_NAV_QUERY = '(max-width: 1023px)';

export default function useNavbarMobile() {
  const { pathname } = useLocation();
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_NAV_QUERY);
    const update = () => setIsMobileNav(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  const handleAvatarClick = (menuOpen, setMenuOpen) => {
    setMenuOpen(!menuOpen);
  };

  return {
    isMobileNav,
    searchOpen,
    setSearchOpen,
    handleAvatarClick,
  };
}
