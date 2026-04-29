'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { MOCK_TOPICS } from '@/types/mock-data';
import { Topic, Comment } from '@/types/database';
import { ArrowLeft, Send, User, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/providers/auth-provider';
import { GoogleGenAI } from '@google/genai';

/**
 * Discussion Detail Page
 */
export default function DiscussionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const foundTopic = MOCK_TOPICS.find(t => t.id === id);
    if (foundTopic) {
      requestAnimationFrame(() => {
        setTopic(foundTopic);
        setComments([
          {
            id: 'c1',
            topic_id: id as string,
            author_id: 'u2',
            content: 'Harika bir paylaşım! Ben de benzer sorunları yaşıyordum.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            author: { id: 'u2', username: 'ayse_tech', full_name: null, avatar_url: null, accessibility_prefs: null, updated_at: '' }
          }
        ]);
      });
    }
  }, [id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Math.random().toString(),
      topic_id: id as string,
      author_id: user.id,
      content: newComment,
      created_at: new Date().toISOString(),
      author: {
        id: user.id,
        username: user.email?.split('@')[0] || 'kullanici',
        full_name: null,
        avatar_url: null,
        accessibility_prefs: null,
        updated_at: ''
      }
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleSummarize = async () => {
    if (!topic) return;
    setIsSummarizing(true);
    
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const prompt = `Lütfen aşağıdaki forum tartışmasını engelli bireyler için çok kısa, net ve anlaşılır özetle. Yanıtın sadece Türkçe ve tek bir paragraf olsun. 
      Başlık: ${topic.title}
      İçerik: ${topic.content}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ parts: [{ text: prompt }] }],
      });
      
      if (response.text) {
        setSummary(response.text);
      }
    } catch (error) {
      console.error('AI Summary Error:', error);
      setSummary("Üzgünüz, şu an özet oluşturulamıyor.");
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!topic) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} /> Geri Dön
        </button>
        <article className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-8">
          <h1 className="text-3xl font-extrabold mb-4">{topic.title}</h1>
          <div className="flex justify-end mb-6">
            <button 
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-full"
            >
              <Sparkles size={14} /> AI Özetle
            </button>
          </div>
          <AnimatePresence>
            {summary && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <h3 className="text-xs font-bold text-primary uppercase mb-2">AI Özeti</h3>
                <p className="text-sm italic">{summary}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="prose max-w-none mb-12">
            {topic.content.split('\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>

          <div className="border-t border-border pt-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" /> Yanıtlar ({comments.length})
              </h2>
            </div>

            <div className="space-y-6">
              {comments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{comment.author?.username || 'Anonim'}</span>
                      <span className="text-[10px] text-muted-foreground uppercase opacity-70">
                        {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl text-sm leading-relaxed">
                      {comment.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {user ? (
              <form onSubmit={handleSendMessage} className="bg-muted/30 p-6 rounded-[2rem] border border-border mt-12">
                <h3 className="text-sm font-bold mb-4">Cevap Yaz</h3>
                <div className="relative">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Düşüncelerinizi paylaşın..."
                    className="w-full p-4 rounded-2xl border border-border bg-card min-h-[120px] outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  />
                  <button 
                    type="submit"
                    className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-3 rounded-xl shadow-lg hover:bg-primary/90 transition-all"
                    aria-label="Gönder"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border mt-12">
                <p className="text-muted-foreground font-medium mb-4">Tartışmaya katılmak için giriş yapmalısınız.</p>
                <button 
                  onClick={() => router.push('/auth')}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold"
                >
                  Giriş Yap
                </button>
              </div>
            )}
          </div>
        </article>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
