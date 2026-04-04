'use client';

import { usePathname } from 'next/navigation';
import Navbar from './index';

const HIDE_NAVBAR_ROUTES = ['/login', '/signup', '/forgot-password', '/update-password'];

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Ocultar a navbar em páginas de autenticação
  if (HIDE_NAVBAR_ROUTES.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
