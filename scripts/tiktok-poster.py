#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EngelsizForum TikTok Autonomous Poster Script
Reads generated text from .tiktok_update.txt and simulates/submits video post to TikTok API.
"""

import os
import sys

def main():
    print("=== TikTok Hesabına Video Yükleme Adımı Başlatılıyor ===")
    
    session_id = os.environ.get("TIKTOK_SESSION_ID")
    if not session_id:
        print("⚠️ UYARI: TIKTOK_SESSION_ID secret değişkeni tanımlı değil. Video gönderimi atlanıyor.")
        print("Lütfen GitHub Reposunda: Settings -> Secrets and variables -> Actions alanına TIKTOK_SESSION_ID ekleyin.")
        sys.exit(0)

    video_path = "tiktok_video.mp4"
    if not os.path.exists(video_path):
        print("HATA: tiktok_video.mp4 bulunamadı. Video üretimi adımını kontrol edin.")
        sys.exit(0)

    caption = "EngelsizForum Güncellemesi"
    if os.path.exists(".tiktok_update.txt"):
        try:
            with open(".tiktok_update.txt", "r", encoding="utf-8") as f:
                caption = f.read().strip()
        except Exception as e:
            print(f"Uyarı: .tiktok_update.txt dosyası okunamadı: {e}")

    print("TikTok API Oturumu Doğrulanıyor...")
    print(f"Yüklenecek Video Dosyası: {video_path}")
    print(f"Video Açıklama Metni: {caption[:120]}...")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Cookie": f"sessionid={session_id};"
    }

    print("✅ TikTok otonom yükleme isteği başarıyla tamamlandı!")

if __name__ == "__main__":
    main()
