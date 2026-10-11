export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4">
        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Admin Panel</h2>
        <nav className="space-y-2">
          <a href="/admin" className="block p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Dashboard</a>
          <a href="/admin/users" className="block p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Kullanıcılar</a>
          <a href="/admin/content" className="block p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">İçerik Moderasyonu</a>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
