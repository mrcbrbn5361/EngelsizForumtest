import WriteLockNotice from '@/components/layout/write-lock-notice';

/**
 * Topic creation is closed while the forum is being renewed.
 */
export default function NewDiscussionPage() {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-xl font-bold text-white mb-4">Yeni konu</h1>
      <WriteLockNotice title="Yeni konu açma şimdilik kapalı" />
    </div>
  );
}
