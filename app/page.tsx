import ClassicCategoryBlock from '@/components/forum/classic-category-block';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { supabaseServer } from '@/lib/supabase-server';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default async function Home() {
  // Fetch root categories
  const { data: rootCategories, error: catError } = await supabaseServer
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  if (catError) {
    console.error('Error fetching root categories:', catError);
  }

  // Fetch all nodes (sub-categories)
  const { data: allNodes, error: nodeError } = await supabaseServer
    .from('categories')
    .select('*')
    .not('parent_id', 'is', null);

  if (nodeError) {
    console.error('Error fetching nodes:', nodeError);
  }

  // Fetch topics to calculate stats and get last post
  const { data: allTopics, error: topicError } = await supabaseServer
    .from('topics')
    .select(`
      *,
      author:profiles(username, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (topicError) {
    console.error('Error fetching topics:', topicError);
  }

  // Map data to the structure expected by components
  const categoriesWithNodes = (rootCategories || []).map(root => {
    const nodes = (allNodes || [])
      .filter(node => node.parent_id === root.id)
      .map(node => {
        // Calculate stats for this node
        const nodeTopics = (allTopics || []).filter(t => t.category_id === node.id);
        const lastTopic = nodeTopics[0];

        return {
          id: node.slug, // Use slug for routing
          title: node.name,
          description: node.description || '',
          threadCount: nodeTopics.length.toLocaleString(),
          messageCount: nodeTopics.length.toLocaleString(), // Placeholder until we have comment count
          lastPost: lastTopic ? {
            title: lastTopic.title,
            author: lastTopic.author?.username || 'Anonim',
            date: formatDistanceToNow(new Date(lastTopic.created_at), { addSuffix: true, locale: tr })
          } : {
            title: 'Henüz konu yok',
            author: '-',
            date: '-'
          }
        };
      });

    return {
      title: root.name.toUpperCase(),
      nodes: nodes
    };
  });

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Main Forum Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#204060]">Forumlar</h1>
          <button className="bg-[#204060] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-[#18587a] transition-colors border-b-2 border-black/20 active:translate-y-0.5 transition-transform">
            Konu Aç
          </button>
        </div>

        {categoriesWithNodes.length > 0 ? (
          categoriesWithNodes.map((category) => (
            <ClassicCategoryBlock 
              key={category.title} 
              title={category.title} 
              nodes={category.nodes} 
            />
          ))
        ) : (
          <div className="xf-block p-8 text-center text-slate-500 italic">
            Henüz kategori eklenmemiş.
          </div>
        )}

        {/* Legend */}
        <div className="xf-block p-3 flex items-center gap-6 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-[#d8dee4]"></div>
            <span>Okunmamış mesaj yok</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#e8f0fe] border border-[#d8dee4] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#18587a] rounded-full"></div>
            </div>
            <span>Okunmamış mesaj var</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <ClassicSidebar />
    </div>
  );
}
