import requests
import os
import re
import time
import random
from urllib.parse import urljoin
import base64

BASE_URL = "https://camp.mx"
API_ENDPOINT = f"{BASE_URL}/wp-json/wp/v2/posts"
OUTPUT_DIR = "exported_posts_with_blocks"

# WARNING: This script requires WordPress admin credentials
# You would need to set these with your actual WordPress login details
WORDPRESS_USERNAME = ""  # Set your WordPress username
WORDPRESS_PASSWORD = ""  # Set your WordPress application password

PER_PAGE = 10
MAX_RETRIES = 3
RETRY_DELAY = 2

def create_auth_headers():
    """Create authentication headers for WordPress API access"""
    if not WORDPRESS_USERNAME or not WORDPRESS_PASSWORD:
        print("❌ ERROR: WordPress credentials not set!")
        print("You need to:")
        print("1. Create an Application Password in WordPress Admin > Users > Your Profile")
        print("2. Set WORDPRESS_USERNAME and WORDPRESS_PASSWORD in this script")
        return None
    
    # Create basic auth header
    credentials = f"{WORDPRESS_USERNAME}:{WORDPRESS_PASSWORD}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    return {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Authorization": f"Basic {encoded_credentials}",
        "User-Agent": "WordPress Posts Exporter with Auth",
        "Content-Type": "application/json"
    }

# Spanish language indicators
SPANISH_INDICATORS = {
    'titles': ['Mapa', 'Calendario', 'Orientación', 'Huéspedes', 'Organizadorxs', 'Artistas', 'Nosotrxs', 'Galería', 'Contexto', 'RESTAURANTE', 'CONTRIBUIR'],
    'words': ['organizadorxs', 'nosotrxs', 'galería', 'orientación', 'huéspedes', 'calendario', 'contribuir', 'restaurante', 'contexto', 'artistas']
}

# English language indicators
ENGLISH_INDICATORS = {
    'titles': ['Map', 'Calendar', 'Orientation', 'Guests', 'Organisers', 'Artists', 'About', 'Gallery', 'Context', 'RESTAURANT', 'GIVING'],
    'words': ['about', 'gallery', 'context', 'restaurant', 'giving', 'orientation', 'guests', 'organisers', 'artists', 'calendar']
}

def detect_language(title: str, content: str) -> str:
    """Detect if content is Spanish or English based on title and content analysis"""
    title_lower = title.lower()
    content_lower = content.lower()
    
    # First, check explicit title matches
    if title in SPANISH_INDICATORS['titles']:
        return 'es'
    if title in ENGLISH_INDICATORS['titles']:
        return 'en'
    
    # Count Spanish-specific indicators
    spanish_score = 0
    english_score = 0
    
    # Check for Spanish-specific words in title or content
    for word in SPANISH_INDICATORS['words']:
        if word in title_lower or word in content_lower:
            spanish_score += 2
    
    # Check for English-specific words in title or content  
    for word in ENGLISH_INDICATORS['words']:
        if word in title_lower or word in content_lower:
            english_score += 2
    
    # Check for Spanish-specific characters
    spanish_chars = ['ñ', 'ü', 'é', 'á', 'í', 'ó', 'ú', 'ç', 'ê']
    spanish_char_count = sum(1 for char in spanish_chars if char in content_lower)
    spanish_score += spanish_char_count
    
    # Spanish-specific words that are common
    spanish_common_words = [' que ', ' por ', ' con ', ' una ', ' para ', ' del ', ' las ', ' los ', ' esto ', ' este ', ' desde ', ' donde ', ' cuando ', ' más ', ' también ', ' muy ']
    spanish_common_count = sum(1 for word in spanish_common_words if word in content_lower)
    spanish_score += spanish_common_count
    
    # English-specific words that are common
    english_common_words = [' the ', ' and ', ' that ', ' this ', ' with ', ' from ', ' they ', ' were ', ' been ', ' have ', ' will ', ' your ', ' what ', ' when ', ' there ', ' their ']
    english_common_count = sum(1 for word in english_common_words if word in content_lower)
    english_score += english_common_count
    
    # Specific patterns for Spanish
    if 'organizadorxs' in content_lower or 'nosotrxs' in content_lower:
        spanish_score += 5
    
    # Make decision based on scores
    if spanish_score > english_score and spanish_score > 3:
        return 'es'
    elif english_score > spanish_score and english_score > 3:
        return 'en'
    
    # Fallback: if title contains Spanish accents or specific characters, likely Spanish
    if any(char in title for char in ['ñ', 'ü', 'é', 'á', 'í', 'ó', 'ú']):
        return 'es'
    
    # Default to English if unclear
    return 'en'

def sanitize_filename(name: str) -> str:
    return re.sub(r'[\\/:*?"<>|]+', '', name)

def fetch_posts_with_auth(page: int = 1, auth_headers: dict = None) -> list:
    """Fetch posts with authentication to get raw content"""
    if not auth_headers:
        print("❌ No authentication headers provided")
        return []
    
    for attempt in range(MAX_RETRIES):
        try:
            time.sleep(random.uniform(0.5, 1.5))
            
            # Use edit context to get raw content with block comments
            params = {
                "per_page": PER_PAGE, 
                "page": page,
                "context": "edit"  # This gives us access to content.raw
            }
            
            response = requests.get(
                API_ENDPOINT, 
                params=params, 
                headers=auth_headers,
                timeout=30
            )
            
            print(f"Attempt {attempt + 1} - Status: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 401:
                print("❌ Authentication failed. Check your WordPress credentials.")
                return []
            elif response.status_code in (400, 404):
                print(f"No more posts available (page {page})")
                return []
            elif response.status_code == 429:
                print("Rate limited. Waiting longer...")
                time.sleep(10)
                continue
            else:
                print(f"HTTP {response.status_code}: {response.text[:200]}")
                    
        except requests.exceptions.RequestException as e:
            print(f"Request failed (attempt {attempt + 1}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            
    print(f"Failed to fetch page {page} after {MAX_RETRIES} attempts")
    return []

def get_raw_content(post: dict) -> tuple:
    """Extract raw content with block comments"""
    content_obj = post.get("content", {})
    
    # Try to get raw content first (includes block comments)
    raw_content = content_obj.get("raw", "")
    if raw_content:
        return raw_content, "raw"
    
    # Fallback to rendered content if raw is not available
    rendered_content = content_obj.get("rendered", "")
    return rendered_content, "rendered"

def main():
    print(f"🚀 WordPress Posts Exporter with Authentication")
    print(f"📍 Base URL: {BASE_URL}")
    print(f"📁 Output directory: {OUTPUT_DIR}")
    print("🔐 This script requires WordPress admin credentials to access raw content with block comments")
    
    # Create authentication headers
    auth_headers = create_auth_headers()
    if not auth_headers:
        print("\n💡 To use this script:")
        print("1. Go to WordPress Admin > Users > Your Profile")
        print("2. Scroll down to 'Application Passwords'")
        print("3. Create a new application password")
        print("4. Update WORDPRESS_USERNAME and WORDPRESS_PASSWORD in this script")
        return
    
    # Create main directory and language subdirectories
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    es_dir = os.path.join(OUTPUT_DIR, "es")
    en_dir = os.path.join(OUTPUT_DIR, "en")
    os.makedirs(es_dir, exist_ok=True)
    os.makedirs(en_dir, exist_ok=True)
    
    page = 1
    total_posts = 0
    spanish_posts = 0
    english_posts = 0
    raw_content_count = 0
    rendered_content_count = 0
    
    print(f"\n🔍 Starting to fetch posts with authentication...")
    
    while True:
        print(f"\nFetching page {page}...")
        posts = fetch_posts_with_auth(page, auth_headers)
        
        if not posts:
            print("No more posts to fetch or authentication failed.")
            break
            
        for post in posts:
            try:
                title = post.get("title", {}).get("rendered", "untitled")
                content, content_type = get_raw_content(post)
                post_id = post.get("id", "unknown")
                
                print(f"  Processing: {title}")
                
                if content_type == "raw":
                    raw_content_count += 1
                    content_label = "📝 RAW"
                else:
                    rendered_content_count += 1
                    content_label = "🖼️ RENDERED"
                
                # Detect language
                language = detect_language(title, content)
                
                # Choose appropriate directory
                if language == 'es':
                    target_dir = es_dir
                    spanish_posts += 1
                    lang_label = "🇪🇸 ES"
                else:
                    target_dir = en_dir
                    english_posts += 1
                    lang_label = "🇺🇸 EN"
                
                safe_name = sanitize_filename(title) or f"post_{post_id}"
                filepath = os.path.join(target_dir, f"{safe_name}.html")
                
                # Avoid overwriting files with same name
                counter = 1
                while os.path.exists(filepath):
                    name_part = safe_name
                    filepath = os.path.join(target_dir, f"{name_part}_{counter}.html")
                    counter += 1
                
                # Save content (raw with block comments or rendered)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                
                print(f"  ✓ {lang_label} {content_label} Saved '{title}' → {filepath}")
                total_posts += 1
                
                time.sleep(0.2)  # Be respectful
                
            except Exception as e:
                print(f"  ✗ Error processing post: {e}")
                continue
        
        page += 1
        time.sleep(random.uniform(1, 3))
    
    print(f"\n🎉 Export completed!")
    print(f"📊 Total posts saved: {total_posts}")
    print(f"🇪🇸 Spanish posts: {spanish_posts}")
    print(f"🇺🇸 English posts: {english_posts}")
    print(f"📝 Raw content (with block comments): {raw_content_count}")
    print(f"🖼️ Rendered content (without block comments): {rendered_content_count}")
    print(f"📁 Spanish posts saved to: {es_dir}")
    print(f"📁 English posts saved to: {en_dir}")

if __name__ == "__main__":
    main() 