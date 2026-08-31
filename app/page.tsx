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
          <h1 className="text-xl font-black text-[#185886] uppercase tracking-wide">Forumlar</h1>
          <a 
            href="/discussions/new" 
            className="bg-[#f2930d] hover:bg-[#d5800a] text-white px-4.5 py-2.5 rounded-sm text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Yeni Konu Aç</span>
          </a>
        </div>

        {categoriesWithNodes.length > 0 ? (
          categoriesWithNodes.map((category) => (
            <div key={category.title} className="mb-5">
              <ClassicCategoryBlock 
                title={category.title} 
                nodes={category.nodes} 
              />
            </div>
          ))
        ) : (
          <div className="xf-block p-8 text-center text-slate-400 italic rounded-sm">
            Henüz kategori eklenmemiş.
          </div>
        )}

        {/* Legend */}
        <div className="xf-block p-3 flex flex-wrap items-center gap-6 text-[11px] text-slate-500 uppercase tracking-wider font-semibold rounded-sm border border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 border border-slate-300"></div>
            <span>Okunmamış mesaj yok</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#eef2f7] border border-[#cbd5e1] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#185886] rounded-full"></div>
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
