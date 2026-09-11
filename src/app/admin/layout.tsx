import React from 'react';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-session';
import { AdminLoginForm } from './AdminLoginForm';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = isValidAdminSession(session);

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  return <>{children}</>;
}
