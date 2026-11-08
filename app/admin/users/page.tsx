'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { UserManagementView } from '@/components/admin/user-management';

export default function AdminUsersPage() {
  return <UserManagementView />;
}
