import { Topic } from './database';

/**
 * Mock data for the initial development phase.
 */
export const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    category_id: 'GÖRME-ENGELLİ',
    author_id: 'user_1',
    title: 'Yeni Ekran Okuyucu Güncellemesi Hakkında Deneyimler',
    content: 'Son güncelleme ile birlikte bazı sitelerde odaklanma sorunları yaşamaya başladım. Sizde durumlar nasıl? Özellikle form alanlarındaki davranış değişikliklerini fark eden var mı?',
    created_at: new Date().toISOString(),
    pinned: true,
    author: {
      id: 'user_1',
      username: 'can_erisilebilir',
      full_name: 'Can Yılmaz',
      avatar_url: null,
      accessibility_prefs: null,
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    category_id: 'TEKNOLOJİ',
    author_id: 'user_2',
    title: 'Düşük Görüş İçin En İyi Monitör Ayarları',
    content: 'Kontrast oranlarını ve renk profillerini nasıl ayarlıyorsunuz? Windows yüksek kontrast modunu mu kullanıyorsunuz yoksa tarayıcı eklentilerini mi tercih ediyorsunuz?',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    pinned: false,
    author: {
      id: 'user_2',
      username: 'ayse_tech',
      full_name: 'Ayşe Demir',
      avatar_url: null,
      accessibility_prefs: null,
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '3',
    category_id: 'SOSYAL-HAKLAR',
    author_id: 'user_3',
    title: 'Yeni Engelli Atamaları ve Süreçler',
    content: '2026 yılı için açıklanan yeni kadrolar hakkında ne düşünüyorsunuz? Başvuru rehberini hazırlayan birileri var mı? Kılavuzun erişilebilirliği hakkında eleştirilerim var.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    pinned: false,
    author: {
      id: 'user_3',
      username: 'hukuk_sever',
      full_name: 'Mehmet Öz',
      avatar_url: null,
      accessibility_prefs: null,
      updated_at: new Date().toISOString()
    }
  }
];
