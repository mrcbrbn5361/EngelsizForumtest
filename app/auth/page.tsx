import { redirect } from 'next/navigation';

/** The old combined sign-in/sign-up page; links to it now open the dedicated pages. */
export default async function AuthPortalPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  redirect(tab === 'register' ? '/register' : '/login');
}
