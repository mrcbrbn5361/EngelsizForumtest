import requests
import time
import json

# --- CONFIGURATION ---
# Replace with your actual deployed URL
API_URL = "https://your-app-url.com/api/admin/stats"
# Replace with the ADMIN_STATS_API_KEY you set in your .env
API_KEY = "your_secure_api_key_here"
# Update interval in seconds
INTERVAL = 30

def fetch_stats():
    headers = {
        "x-api-key": API_KEY,
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(API_URL, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return None

def display_on_terminal(data):
    if not data:
        print("Waiting for data...")
        return
        
    print("\033[H\033[J") # Clear terminal
    print("=" * 40)
    print("     ENGELSİZFORUM LIVE STATISTICS")
    print("=" * 40)
    print(f"Total Visitors:   {data.get('total_visitors', 0)}")
    print(f"Active Visitors:  {data.get('active_visitors', 0)} (last 5 min)")
    print(f"Active Members:   {data.get('active_members', 0)}")
    print(f"Active Guests:    {data.get('active_guests', 0)}")
    print("-" * 40)
    print(f"Last Updated:     {data.get('timestamp', 'N/A')}")
    print("=" * 40)
    print("Press Ctrl+C to exit")

if __name__ == "__main__":
    print("Starting Raspberry Pi Stats Client...")
    try:
        while True:
            stats = fetch_stats()
            display_on_terminal(stats)
            time.sleep(INTERVAL)
    except KeyboardInterrupt:
        print("\nExiting...")
