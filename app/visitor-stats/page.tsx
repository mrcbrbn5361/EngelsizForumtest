'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Tv, 
  Activity, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Wifi, 
  Settings, 
  Code, 
  Copy, 
  Check, 
  Sparkles,
  ArrowLeft,
  Terminal,
  Clock,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { BionicText } from '@/components/ui/bionic-text';
import { useAccessibility } from '@/components/providers/accessibility-provider';

export default function VisitorStatsMonitor() {
  const router = useRouter();
  const { fontSize, highContrast, dyslexicFont } = useAccessibility();
  
  // State variables
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [activeVisitors, setActiveVisitors] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('Raspberry-Pi-Kiosk');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'error'>('connected');
  const [logs, setLogs] = useState<Array<{ time: string; type: 'info' | 'success' | 'warn' | 'error'; message: string }>>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Ref for speech synthesis to prevent overlap
  const prevActiveCount = useRef<number>(-1);
  const prevTotalCount = useRef<number>(-1);

  // Initialize device ID
  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date());
    let savedId = localStorage.getItem('rpi_visitor_device_id');
    if (!savedId) {
      savedId = `rpi-web-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('rpi_visitor_device_id', savedId);
    }
    setDeviceId(savedId);

    const savedName = localStorage.getItem('rpi_visitor_device_name');
    if (savedName) {
      setDeviceName(savedName);
    }

    addLog('Sistem başlatıldı. Web tabanlı izleme aktif.', 'info');
  }, []);

  // Log helper function
  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const timeStr = new Date().toLocaleTimeString('tr-TR');
    setLogs(prev => [{ time: timeStr, type, message }, ...prev.slice(0, 19)]);
  };

  // Fetch and update stats
  const fetchStats = async (isHeartbeat = false) => {
    if (!deviceId) return;
    
    try {
      if (isHeartbeat) {
        // Send heartbeat (POST)
        const postRes = await fetch('/api/visitor-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer engelsizforumteknofesttanitim'
          },
          body: JSON.stringify({ device_id: `${deviceName}-${deviceId}` })
        });
        
        if (!postRes.ok) throw new Error('POST Heartbeat failed');
        addLog(`Sinyal gönderildi: Cihaz aktif (${deviceName})`, 'success');
      }

      // Fetch latest counts (GET)
      const getRes = await fetch('/api/visitor-stats', {
        headers: {
          'Authorization': 'Bearer engelsizforumteknofesttanitim'
        }
      });

      if (!getRes.ok) throw new Error('GET stats failed');
      
      const data = await getRes.json();
      const newTotal = data.total_visitors || 0;
      const newActive = data.active_visitors || 0;

      // Check if counts updated and announce via TTS if requested
      if (isPlayingAudio && typeof window !== 'undefined' && window.speechSynthesis) {
        let speakText = '';
        if (prevActiveCount.current !== -1 && newActive > prevActiveCount.current) {
          const diff = newActive - prevActiveCount.current;
          speakText += `Sayıcı Güncellendi. ${diff} yeni aktif ziyaretçi bağlandı. `;
        }
        if (prevTotalCount.current !== -1 && newTotal > prevTotalCount.current) {
          speakText += `Toplam ziyaretçi sayımız ${newTotal} kişiye ulaştı.`;
        }

        if (speakText) {
          const utterance = new SpeechSynthesisUtterance(speakText);
          utterance.lang = 'tr-TR';
          window.speechSynthesis.cancel(); // cancel previous speakings
          window.speechSynthesis.speak(utterance);
          addLog(`Sesli anons yapıldı: "${speakText}"`, 'info');
        }
      }

      // Update refs
      prevActiveCount.current = newActive;
      prevTotalCount.current = newTotal;

      setTotalVisitors(newTotal);
      setActiveVisitors(newActive);
      setLastUpdated(new Date());
      setConnectionStatus('connected');
      setLoading(false);

      if (!isHeartbeat) {
        addLog(`Veriler güncellendi. Toplam: ${newTotal}, Anlık: ${newActive}`, 'success');
      }
    } catch (error: any) {
      console.error('Error in stats polling:', error);
      setConnectionStatus('error');
      addLog(`Bağlantı hatası oluştu: ${error.message || 'Sunucuya erişilemiyor'}`, 'error');
    }
  };

  // Setup interval for heartbeat and fetching
  useEffect(() => {
    if (!deviceId) return;

    // Initial fetch
    fetchStats(true);

    // Poll every 10 seconds for stats and send heartbeat every 30 seconds
    let count = 0;
    const interval = setInterval(() => {
      count++;
      // Every 3 ticks (30s), send heartbeat
      const sendHeart = count % 3 === 0;
      fetchStats(sendHeart);
    }, 10000);

    return () => clearInterval(interval);
  }, [deviceId, deviceName, isPlayingAudio]);

  // Fullscreen toggle helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => {
          toast.error(`Tam ekran moduna geçilemedi: ${err.message}`);
        });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Monitor fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Save custom device settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('rpi_visitor_device_name', deviceName);
    setShowSettings(false);
    toast.success('Cihaz ayarları kaydedildi!');
    addLog(`Cihaz adı '${deviceName}' olarak değiştirildi.`, 'info');
    fetchStats(true); // force fresh heartbeat with new name
  };

  // Copy code helper
  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Kod kopyalandı!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const originUrl = 'https://www.engelsizforum.com';

  // Python integration script code
  const pythonScript = `import requests
import time
import uuid

# Uygulamanızın URL'ini buraya yazın
API_URL = "${originUrl}/api/visitor-stats" 
TOKEN = "engelsizforumteknofesttanitim"
# Cihaz için benzersiz bir ID (MAC adresinden üretilir)
DEVICE_ID = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0, 2*6, 2)][::-1])

def veriyi_cek():
    try:
        # Önce bu cihazı aktif olarak kaydediyoruz (POST)
        requests.post(
            API_URL,
            json={"device_id": f"RaspberryPi-Device-{DEVICE_ID}"},
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        # Sonra güncel istatistikleri çekiyoruz (GET)
        response = requests.get(
            API_URL,
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "User-Agent": "VisitorTracker/1.0"
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[{time.strftime('%H:%M:%S')}] Toplam: {data.get('total_visitors', 0)}, Anlık: {data.get('active_visitors', 0)}")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] Hata: Sunucu {response.status_code} koduyla yanıt verdi.")
    except requests.exceptions.RequestException as e:
        print(f"[{time.strftime('%H:%M:%S')}] Bağlantı Hatası: {e}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Beklenmedik Hata: {e}")

if __name__ == "__main__":
    print(f"--- Engelsiz Forum Ziyaretçi Takip Başlatıldı (5 dakikada bir) ---")
    while True:
        veriyi_cek()
        time.sleep(300) # 5 dakikada bir`;

  const curlCommand = `curl -X POST "${originUrl}/api/visitor-stats" \\
  -H "Authorization: Bearer engelsizforumteknofesttanitim" \\
  -H "Content-Type: application/json" \\
  -d '{"device_id": "rpi-kiosk-01"}'`;

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black text-white' : 'bg-[#0f172a] text-slate-100'} font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-primary-foreground`}>
      {/* Dynamic Animated background mesh for high-tech look */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Top Navigation / Status Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-4 md:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-primary rounded-xl transition-all flex items-center justify-center border border-slate-700/50"
              title="Foruma Geri Dön"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Tv size={22} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-black uppercase tracking-tight leading-none text-white flex items-center gap-2">
                  <BionicText text="Engelsiz Forum" />
                  <span className="text-[10px] font-mono font-extrabold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">LIVE</span>
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Raspberry Pi İzleme Ekranı</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Indicator Radar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              <span className={`relative flex h-2 w-2`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  connectionStatus === 'connected' ? 'bg-emerald-400' : connectionStatus === 'reconnecting' ? 'bg-amber-400' : 'bg-red-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'reconnecting' ? 'bg-amber-500' : 'bg-red-500'
                }`}></span>
              </span>
              <span>{connectionStatus === 'connected' ? 'BAĞLI' : connectionStatus === 'reconnecting' ? 'YENİLENİYOR' : 'HATA'}</span>
            </div>

            {/* Audio Voice Announcements toggle */}
            <button
              onClick={() => {
                setIsPlayingAudio(!isPlayingAudio);
                toast.success(isPlayingAudio ? 'Sesli sayıcı anonsları kapatıldı.' : 'Sesli sayıcı anonsları açıldı!');
              }}
              className={`p-2.5 rounded-xl transition-all border ${
                isPlayingAudio 
                  ? 'bg-primary/20 text-primary border-primary/40' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/50'
              }`}
              title={isPlayingAudio ? 'Sesi Kapat' : 'Sesli Duyuruları Aç (TTS)'}
            >
              {isPlayingAudio ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Custom Settings button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50"
              title="Cihaz Ayarları"
            >
              <Settings size={18} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50"
              title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Yap'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchStats(true)}
              disabled={loading && connectionStatus === 'connected'}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 disabled:opacity-50"
              title="El ile yenile"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 space-y-8 md:space-y-12 relative z-10">
        {/* Settings Panel Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 rounded-3xl border border-primary/20 bg-slate-900/90 backdrop-blur-xl shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/40 rounded-t-3xl" />
              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
                <Settings size={18} className="text-primary" /> Cihaz Kimlik Ayarları
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-6">
                Bu web ekranının kendisini Engelsiz Forum sistemine bir istemci/ziyaretçi olarak hangi adla kaydedeceğini ayarlayın.
              </p>
              <form onSubmit={handleSaveSettings} className="grid sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    İstemci / Terminal Adı (Örn: Raspberry-Pi-Teknofest)
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-primary/50 text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="Raspberry-Pi-Kiosk"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    AYARLARI KAYDET
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display Panel Row (Big Counters) */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          
          {/* Active Visitors Counter Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 md:p-12 rounded-[2.5rem] border ${
              highContrast ? 'border-2 border-white bg-black' : 'border-slate-800 bg-slate-900/40'
            } backdrop-blur-md relative overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-primary/5 transition-all min-h-[300px]`}
          >
            {/* Corner Decorative Lights */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1.5 border-l border-b border-emerald-500/20">
              <Activity size={10} className="animate-pulse" /> ANLIK AKTİF
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 leading-none">Canlı Ziyaretçi</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Son 5 dakika içinde aktif olan cihazlar</p>
                </div>
              </div>

              {/* Big Animated Number */}
              <div className="pt-4 flex items-baseline gap-3">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-white font-mono leading-none tabular-nums select-none">
                  {loading ? '...' : activeVisitors}
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  AKTİF
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-500" />
                <span>YENİLENME SIKLIĞI: <span className="font-mono text-white">10sn</span></span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-2.5 py-1 rounded-md border border-slate-700/50">
                {deviceName}
              </span>
            </div>
          </motion.div>

          {/* Total Visitors Counter Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-8 md:p-12 rounded-[2.5rem] border ${
              highContrast ? 'border-2 border-white bg-black' : 'border-slate-800 bg-slate-900/40'
            } backdrop-blur-md relative overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-primary/5 transition-all min-h-[300px]`}
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
            <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1.5 border-l border-b border-primary/20">
              <Sparkles size={10} /> GENEL TOPLAM
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <Heart size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 leading-none">Toplam Ziyaret</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Platform başlangıcından beri toplam tekil hit</p>
                </div>
              </div>

              {/* Big Animated Number */}
              <div className="pt-4 flex items-baseline gap-3">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-white font-mono leading-none tabular-nums select-none">
                  {loading ? '...' : totalVisitors}
                </span>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  CİHAZ
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <Wifi size={14} className="text-slate-500" />
                <span>SON VERİ ALIMI: <span className="font-mono text-white">{mounted && lastUpdated ? lastUpdated.toLocaleTimeString('tr-TR') : '--:--:--'}</span></span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-2.5 py-1 rounded-md border border-slate-700/50">
                TOKEN OK
              </span>
            </div>
          </motion.div>

        </div>

        {/* Live Logs Console & Radar Map Row */}
        <div className="grid lg:grid-cols-12 gap-6 md:gap-10">
          
          {/* Radar Visualization Card */}
          <div className="lg:col-span-5 rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md flex flex-col justify-between min-h-[350px]">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
                <span className="size-2 bg-emerald-500 rounded-full animate-ping" />
                Ağ & Bağlantı Radar Haritası
              </h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cihaz sinyalleri ve canlı sunucu pingi</p>
            </div>

            {/* Radar Visualizer Animation */}
            <div className="flex items-center justify-center py-6 relative">
              <div className="relative size-44 md:size-52 rounded-full border border-slate-800/80 flex items-center justify-center">
                
                {/* Pulsing Concentric Circles */}
                <div className="absolute inset-4 rounded-full border border-slate-800/50 flex items-center justify-center" />
                <div className="absolute inset-12 rounded-full border border-slate-800/30 flex items-center justify-center" />
                <div className="absolute inset-20 rounded-full border border-slate-800/10 flex items-center justify-center" />

                {/* Sweeping Line */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-primary/10 animate-[spin_4s_linear_infinite]" />

                {/* Center Node representing Engelsiz Forum Server */}
                <div className="size-5 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center z-10">
                  <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                </div>

                {/* Sub-node representing Raspberry Pi */}
                <div className="absolute top-1/4 left-1/4 translate-x-2 translate-y-2 flex flex-col items-center z-10">
                  <div className="size-4 bg-emerald-500/20 border border-emerald-400 rounded-full flex items-center justify-center">
                    <span className="size-1 bg-emerald-400 rounded-full animate-ping" />
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 font-bold mt-1 uppercase tracking-widest">RASPBERRY</span>
                </div>

                {/* Floating elements indicating active users in orbit */}
                <div className="absolute bottom-1/3 right-1/4 flex items-center gap-1 z-10 opacity-75">
                  <div className="size-2 bg-emerald-400 rounded-full" />
                  <span className="text-[7px] font-mono text-slate-500 font-bold uppercase tracking-widest">USER_04</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>SİNYAL: OK</span>
              <span>PING: ~24MS</span>
              <span>PORT: 443 HTTPS</span>
            </div>
          </div>

          {/* Terminal / Live Log Console */}
          <div className="lg:col-span-7 rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 md:p-8 backdrop-blur-md flex flex-col justify-between min-h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-primary" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">İşlem Günlüğü ve Terminal Çıktısı</h4>
              </div>
              <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">CONSOLE_MODE</span>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2.5 max-h-[220px] scrollbar-thin scrollbar-thumb-slate-800 px-1 text-slate-300">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-12">Yükleniyor veya henüz işlem kaydı yok...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 border-b border-slate-900/40 pb-1.5 last:border-0">
                    <span className="text-slate-500 font-bold shrink-0">[{log.time}]</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 ${
                      log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      log.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      log.type === 'warn' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-800 text-slate-300 border border-slate-700/50'
                    }`}>
                      {log.type}
                    </span>
                    <span className="font-medium text-slate-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-900 mt-4 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>CIHAZ ID: {deviceId}</span>
              <span>DURUM: AKTİF DÖNGÜ</span>
            </div>
          </div>

        </div>

        {/* Developer Integration Section (How to run Python / IoT setups) */}
        <section className="rounded-[2.5rem] border border-slate-800 bg-slate-900/20 p-8 md:p-12 backdrop-blur-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Code size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Geliştiriciler & IoT İçin Entegrasyon Rehberi</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Raspberry Pi, ESP32 veya diğer IoT cihazlarını Engelsiz Forum ziyaretçi sayacına bağlayın.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Python Script Card */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">1. Python Script (Raspberry Pi / Linux)</span>
                <button
                  onClick={() => handleCopyCode(pythonScript, 1)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg"
                >
                  {copiedIndex === 1 ? <Check size={12} /> : <Copy size={12} />}
                  {copiedIndex === 1 ? 'KOPYALANDI' : 'KOPYALA'}
                </button>
              </div>
              <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                <pre className="p-5 font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed max-h-[350px]">
                  {pythonScript}
                </pre>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                * Bu python betiğini cihazınızda çalıştırmadan önce <code>pip install requests</code> ile gerekli kütüphaneyi kurduğunuzdan emin olun. Betik, cihazınızın MAC adresini kullanarak benzersiz bir kimlik (device_id) oluşturur ve API sistemimize kaydeder.
              </p>
            </div>

            {/* CURL / HTTP API Specification */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">2. HTTP POST Sinyali (CURL / ESP32)</span>
                  <button
                    onClick={() => handleCopyCode(curlCommand, 2)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg"
                  >
                    {copiedIndex === 2 ? <Check size={12} /> : <Copy size={12} />}
                    {copiedIndex === 2 ? 'KOPYALANDI' : 'KOPYALA'}
                  </button>
                </div>
                <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                  <pre className="p-5 font-mono text-xs overflow-x-auto text-primary leading-relaxed">
                    {curlCommand}
                  </pre>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  * Herhangi bir IoT cihazı (örneğin ESP32 veya Arduino) yukarıdaki gibi <code>Authorization</code> başlığında <code>Bearer engelsizforumteknofesttanitim</code> tokeni ile bir <code>POST</code> isteği göndererek sayaçta bir ziyaretçi olarak görünebilir.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-white">API Parametre Bilgileri</h4>
                <div className="divide-y divide-slate-800 text-[11px] font-medium text-slate-300">
                  <div className="py-2 flex justify-between">
                    <span className="font-mono text-primary font-bold">API URL</span>
                    <span className="font-mono text-slate-400">/api/visitor-stats</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="font-mono text-primary font-bold">Methodlar</span>
                    <span className="font-mono text-slate-400">GET (Sayıları çeker), POST (Sinyal gönderir)</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="font-mono text-primary font-bold">Headers</span>
                    <span className="font-mono text-slate-400">Authorization: Bearer engelsizforumteknofesttanitim</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="font-mono text-primary font-bold">Gövde (POST)</span>
                    <span className="font-mono text-slate-400">{`{"device_id": "benzersiz-cihaz-id"}`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Elegant Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>ENGELSIZ FORUM © 2026 • TEKNOFEST STAND MONITOR</span>
          <span className="text-primary font-black">YETERLY ENGELSİZ YAŞAM TEKNOLOJİLERİ</span>
        </div>
      </footer>
    </div>
  );
}
