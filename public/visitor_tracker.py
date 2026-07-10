import requests
import time

# Uygulama Bilgileri
# Lütfen buradaki URL'yi kendi yayındaki URL'nizle güncelleyin
API_URL = "https://ais-dev-ix4syl6g7zxz77ys7mkpvf-91223103933.europe-west2.run.app/api/visitor-stats"
TOKEN = "engelsizforumteknofesttanitim"

def veriyi_cek():
    try:
        # Sadece istatistikleri çekiyoruz (GET isteği), ziyaretçi olarak sayılmıyoruz
        response = requests.get(
            API_URL,
            headers={"Authorization": f"Bearer {TOKEN}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            toplam = data.get('total_visitors', 0)
            anlik = data.get('active_visitors', 0)
            
            print(f"\n[ {time.strftime('%H:%M:%S')} ]")
            print(f"------------------------------------")
            print(f"Toplam Ziyaretçi: {toplam}")
            print(f"Anlık Ziyaretçi: {anlik}")
            print(f"------------------------------------")
            
        else:
            print(f"Hata: Sunucu {response.status_code} koduyla yanıt verdi.")

    except requests.exceptions.ConnectionError:
        print("Hata: İnternet bağlantısı yok veya sunucuya ulaşılamıyor.")
    except Exception as e:
        print(f"Beklenmedik bir hata oluştu: {e}")

if __name__ == "__main__":
    print(f"--- Engelsiz Forum Ziyaretçi Takip Başlatıldı (5 dakikada bir) ---")
    
    while True:
        veriyi_cek()
        time.sleep(300) # 300 saniye (5 dakika)
