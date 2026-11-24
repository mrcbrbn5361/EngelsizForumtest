import WriteLockNotice from '@/components/layout/write-lock-notice';

/**
 * Messaging is closed while the forum is being renewed.
 */
export default function MessagesPage() {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-xl font-bold text-white mb-4">Mesajlar</h1>
      <WriteLockNotice title="Mesajlaşma şimdilik kapalı" headingLevel={1} />
    </div>
  );
}
