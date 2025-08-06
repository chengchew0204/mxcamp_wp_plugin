import requests
import os
import re
import time
import random
from urllib.parse import urljoin

BASE_URL = "https://camp.mx"
API_ENDPOINT = f"{BASE_URL}/wp-json/wp/v2/posts"
OUTPUT_DIR = "exported_posts"
PER_PAGE = 10  # Reduced to avoid triggering rate limits
MAX_RETRIES = 3
RETRY_DELAY = 2

# More realistic browser headers to avoid ModSecurity blocks
HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "DNT": "1",
    "Pragma": "no-cache",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
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

def fetch_posts_with_retry(page: int = 1) -> list:
    """Fetch posts with retry logic and error handling"""
    for attempt in range(MAX_RETRIES):
        try:
            # Add some randomization to avoid pattern detection
            time.sleep(random.uniform(0.5, 1.5))
            
            # Use view context first (public access)
            params = {
                "per_page": PER_PAGE, 
                "page": page,
                "context": "view"  # Public context first
            }
            
            # Create a session for better connection handling
            with requests.Session() as session:
                session.headers.update(HEADERS)
                
                response = session.get(
                    API_ENDPOINT, 
                    params=params, 
                    timeout=30,
                    allow_redirects=True
                )
                
                print(f"Attempt {attempt + 1} - Status: {response.status_code}")
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 406:
                    print(f"ModSecurity block detected. Trying alternative approach...")
                    return fetch_posts_alternative(page)
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

def fetch_posts_alternative(page: int = 1) -> list:
    """Alternative method using different endpoint or approach"""
    alternative_headers = {
        "User-Agent": "WordPress/6.0; https://camp.mx",
        "Accept": "*/*"
    }
    
    try:
        # Try with minimal headers and view context
        response = requests.get(
            API_ENDPOINT,
            params={
                "per_page": PER_PAGE, 
                "page": page,
                "context": "view"
            },
            headers=alternative_headers,
            timeout=30
        )
        
        if response.status_code == 200:
            print("Alternative method successful!")
            return response.json()
        else:
            print(f"Alternative method also failed: {response.status_code}")
            
    except Exception as e:
        print(f"Alternative method error: {e}")
    
    return []

def try_fetch_raw_content(post_id: int) -> tuple:
    """Try to fetch raw content for a specific post using edit context"""
    try:
        # Try to get individual post with edit context
        individual_post_url = f"{API_ENDPOINT}/{post_id}"
        
        with requests.Session() as session:
            session.headers.update(HEADERS)
            
            response = session.get(
                individual_post_url,
                params={"context": "edit"},
                timeout=15
            )
            
            if response.status_code == 200:
                post_data = response.json()
                content_obj = post_data.get("content", {})
                raw_content = content_obj.get("raw", "")
                if raw_content:
                    return raw_content, "raw"
            
    except Exception as e:
        pass  # Silently fail and use rendered content
    
    return None, None

def get_best_content(post: dict) -> tuple:
    """Extract the best available content (raw preferred, rendered as fallback)"""
    post_id = post.get("id")
    
    # First, try to get raw content if we have a post ID
    if post_id:
        raw_content, content_type = try_fetch_raw_content(post_id)
        if raw_content:
            return raw_content, "raw"
    
    # Fallback to rendered content
    content_obj = post.get("content", {})
    rendered_content = content_obj.get("rendered", "")
    return rendered_content, "rendered"

def main():
    print(f"Starting WordPress posts export from {BASE_URL}")
    print(f"Output directory: {OUTPUT_DIR}")
    print("Posts will be organized into /en and /es folders by language")
    print("Attempting to fetch raw content with Gutenberg blocks when possible")
    
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
    
    while True:
        print(f"\nFetching page {page}...")
        posts = fetch_posts_with_retry(page)
        
        if not posts:
            print("No more posts to fetch or all attempts failed.")
            break
            
        for post in posts:
            try:
                title = post.get("title", {}).get("rendered", "untitled")
                post_id = post.get("id", "unknown")
                date = post.get("date", "")
                
                print(f"  Processing: {title}")
                
                # Try to get the best content available
                content, content_type = get_best_content(post)
                
                if content_type == "raw":
                    raw_content_count += 1
                    content_label = "📝 RAW"
                else:
                    rendered_content_count += 1
                    content_label = "🖼️ RENDERED"
                
                # Detect language (use rendered title for detection)
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
                original_filepath = filepath
                while os.path.exists(filepath):
                    name_part = safe_name
                    filepath = os.path.join(target_dir, f"{name_part}_{counter}.html")
                    counter += 1
                
                # Save content (raw or rendered)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                
                print(f"  ✓ {lang_label} {content_label} Saved '{title}' → {filepath}")
                total_posts += 1
                
                # Small delay between individual post fetches
                time.sleep(0.2)
                
            except Exception as e:
                print(f"  ✗ Error processing post: {e}")
                continue
        
        page += 1
        
        # Add delay between pages to be respectful
        if page > 1:
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
