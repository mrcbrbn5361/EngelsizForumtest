import requests
import os

# --- Configuration ---
# You can find these in your Supabase project dashboard -> Project Settings -> API
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-anon-key"

# Your admin user credentials
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "your-admin-password"

# The API endpoint in your Next.js application
APP_URL = "http://localhost:3000" # Change this to your deployed URL
# ---------------------

def get_supabase_token():
    """Authenticate with Supabase to get a JWT token"""
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        print("Login Failed:", response.json())
        return None
        
    return response.json().get("access_token")

def get_visitor_stats(token):
    """Fetch visitor stats from the secure API"""
    url = f"{APP_URL}/api/analytics/stats"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print("API Error:", response.json())
        return None

if __name__ == "__main__":
    print("Logging in as admin...")
    token = get_supabase_token()
    
    if token:
        print("Successfully obtained admin token. Fetching stats...")
        stats = get_visitor_stats(token)
        
        if stats and stats.get("success"):
            data = stats["data"]
            print(f"\n--- Visitor Statistics ---")
            print(f"Active Visitors (Last 5 mins): {data['active_visitors']}")
            print(f"Total Unique Visitors:         {data['total_visitors']}")
            print(f"Timestamp:                     {data['timestamp']}")
        else:
            print("Failed to fetch stats.")
