import { WRITE_LOCK_MESSAGE } from '@/components/layout/write-lock-notice';

/**
 * Plain, non-dismissible paragraph shown as the first content of every page.
 */
export default function AnnouncementBanner() {
  return (
    <p className="m-0 w-full bg-amber-100 text-slate-900 text-sm font-semibold text-center px-4 py-2 border-b border-amber-300">
      {WRITE_LOCK_MESSAGE}
    </p>
  );
}
