# Interactive Map Component

**Version:** 1.0.0  
**Single Source of Truth** for the interactive map used across multiple WordPress sites.

---

## Overview

This modular map component has been refactored from the original `Map.html` and `Mapa.html` files into three separate, maintainable files:

- **`map-component.css`** - All styling
- **`map-component.js`** - All interactive functionality
- **`map-component.html`** - HTML structure only

This allows you to:
- ✅ Update once, deploy everywhere
- ✅ Use across multiple WordPress sites
- ✅ Version control your map easily
- ✅ Better performance with browser caching
- ✅ Easier debugging and maintenance

---

## Quick Start

### 1. Upload Files to Primary Site

Upload these three files to your primary WordPress site:

```
/wp-content/uploads/map-component/
├── map-component.css
├── map-component.js
└── map-component.html
```

### 2. Add to WordPress Page/Post

Use the **HTML block** in WordPress editor and paste this code:

```html
<!-- wp:html -->
<link rel="stylesheet" href="https://camp.mx/wp-content/uploads/map-component/map-component.css?v=1.0.0">

<div class="interactive-map" id="imap">
  <div class="map-container">
    <!-- Paste content from map-component.html here -->
  </div>
</div>

<script src="https://camp.mx/wp-content/uploads/map-component/map-component.js?v=1.0.0"></script>
<!-- /wp:html -->
```

**That's it!** The map will now work on any WordPress site that includes this code.

---

## Integration Methods

### Method 1: Direct Include (Recommended)

**Best for:** Sites on the same domain or with proper CORS setup

```html
<link rel="stylesheet" href="https://camp.mx/wp-content/uploads/map-component/map-component.css?v=1.0.0">
<!-- HTML structure here -->
<script src="https://camp.mx/wp-content/uploads/map-component/map-component.js?v=1.0.0"></script>
```

**Pros:**
- Full integration with page
- Best performance
- No iframe limitations

**Cons:**
- Requires CORS headers for cross-domain

---

### Method 2: iframe Embed

**Best for:** Cross-domain without CORS configuration

```html
<iframe 
  src="https://camp.mx/map-standalone/" 
  style="width: 100%; height: 100vh; border: none;">
</iframe>
```

**Pros:**
- Works across any domain
- Isolated from parent page
- No CORS required

**Cons:**
- Less flexible styling
- Iframe overhead
- Mobile considerations

---

### Method 3: Dynamic Load

**Best for:** Loading HTML structure dynamically

```html
<link rel="stylesheet" href="https://camp.mx/wp-content/uploads/map-component/map-component.css?v=1.0.0">
<div id="map-component-container"></div>

<script>
fetch('https://camp.mx/wp-content/uploads/map-component/map-component.html?v=1.0.0')
  .then(response => response.text())
  .then(html => {
    document.getElementById('map-component-container').innerHTML = html;
    const script = document.createElement('script');
    script.src = 'https://camp.mx/wp-content/uploads/map-component/map-component.js?v=1.0.0';
    document.body.appendChild(script);
  });
</script>
```

**Pros:**
- HTML structure separate from WordPress
- Easy to update HTML independently

**Cons:**
- Requires JavaScript enabled
- Slight loading delay

---

### Method 4: WordPress Shortcode

**Best for:** Frequent use across multiple pages

Add to `functions.php`:

```php
function interactive_map_shortcode() {
    $base_url = 'https://camp.mx/wp-content/uploads/map-component/';
    $version = '1.0.0';
    
    wp_enqueue_style('map-component', $base_url . 'map-component.css?v=' . $version);
    wp_enqueue_script('map-component', $base_url . 'map-component.js?v=' . $version, array(), $version, true);
    
    ob_start();
    include(get_template_directory() . '/map-component/map-component.html');
    return ob_get_clean();
}
add_shortcode('interactive_map', 'interactive_map_shortcode');
```

Then use in WordPress editor:
```
[interactive_map]
```

---

## File Structure

```
map-component/
├── README.md                      # This file
├── map-component.css              # All styles
├── map-component.js               # All JavaScript logic
├── map-component.html             # HTML structure
└── wordpress-integration.html     # Integration examples
```

---

## Features

### Interactive Elements

- **Building Navigation**: Click on buildings to zoom into different layers
- **Hover Effects**: Building contours appear on hover
- **Exit Areas**: Click designated areas to close the map
- **Demo System**: Automatic demo on first load (mobile-aware)
- **Media Overlays**: Support for video/image overlays on specific layers

### Responsive Design

- Desktop: Full scrollable experience
- Mobile: Optimized touch interactions
- Tablet: Adaptive layouts
- Different aspect ratios handled automatically

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Updating the Map

### Single File Update

When you need to update styles, functionality, or structure:

1. Edit the appropriate file:
   - Styles → `map-component.css`
   - Functionality → `map-component.js`
   - Structure → `map-component.html`

2. Increment version number in file references:
   ```
   ?v=1.0.0  →  ?v=1.0.1
   ```

3. Upload to primary site

4. **All sites using the map are now updated!**

### Version Control

Always use version numbers in URLs:
```html
<link href="...map-component.css?v=1.0.0">
<script src="...map-component.js?v=1.0.0"></script>
```

This ensures:
- Browser cache is invalidated
- Users get the latest version
- Easy rollback if needed

---

## Configuration

### Custom Image URLs

If your images are hosted elsewhere, update the URLs in:

**`map-component.js`**:
```javascript
const mapLayerUrls = [
  'https://YOUR-DOMAIN.com/uploads/02-central-down-1.webp',
  // ... rest of URLs
];
```

**`map-component.html`**:
```html
<img src="https://YOUR-DOMAIN.com/uploads/01-start-palapas.webp" />
```

### Disable Demo

To disable the automatic demo, edit `map-component.js`:

```javascript
// Find this line and comment it out:
// const mapDemo = new MapDemo();
```

### Add Video Overlays

To add videos on specific layers, edit `map-component.js`:

```javascript
function initializeOverlayManager() {
  return new OverlayManager({
    mount: '#media-overlay',
    items: [
      {
        id: 'vid-example',
        type: 'video',
        src: 'https://camp.mx/wp-content/uploads/video.mp4',
        rect: {
          top: '25%',
          left: '30%',
          width: '15%',
          height: '20%'
        },
        showOn: ['jardin-down-2']  // Show on this layer
      }
    ]
  });
}
```

---

## CORS Configuration

If loading from a different domain, add CORS headers.

### Apache (.htaccess)

```apache
<FilesMatch "\.(css|js|html)$">
  Header set Access-Control-Allow-Origin "*"
</FilesMatch>
```

### Nginx

```nginx
location ~* \.(css|js|html)$ {
    add_header Access-Control-Allow-Origin *;
}
```

### WordPress Plugin

Use a plugin like "WP Add Custom Headers" or add to theme:

```php
add_action('send_headers', function() {
    header('Access-Control-Allow-Origin: *');
});
```

---

## Troubleshooting

### Map Not Loading

**Check:**
1. Are file URLs correct?
2. Are files uploaded to correct location?
3. Browser console for errors?
4. CORS headers if cross-domain?

**Quick fix:**
```javascript
// Add to browser console to check
console.log(window.mapComponent);
```

### Images Not Showing

**Check:**
1. Image URLs in both JS and HTML files
2. Images uploaded to WordPress media library
3. Network tab in browser dev tools
4. File permissions on server

### Demo Not Working

**Check:**
1. `#demo-cursor` element exists
2. `#central-detail-demo` element exists
3. Console for demo-related errors
4. Try manually: `window.mapComponent.mapDemo.restartDemo()`

### Click Events Not Working

**Check:**
1. JavaScript loaded after HTML
2. No JavaScript errors in console
3. Elements have correct IDs
4. Try reset: `window.mapComponent.resetMap()`

---

## Performance Optimization

### 1. Minify Files

Use tools to minify CSS and JS:

```bash
# Using npm packages
npm install -g csso-cli uglify-js

# Minify CSS
csso map-component.css -o map-component.min.css

# Minify JS
uglifyjs map-component.js -o map-component.min.js -c -m
```

### 2. Use CDN

Upload files to a CDN like:
- Cloudflare
- AWS CloudFront
- Bunny CDN

### 3. Enable Caching

Set long cache times for versioned files:

```apache
<FilesMatch "\.(css|js)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### 4. Lazy Load Images

Images use `data-src` for lazy loading. The component automatically handles this.

---

## Development

### Local Testing

1. Use a local server (not file://)
2. Test on multiple browsers
3. Test on mobile devices
4. Check console for errors

### Making Changes

1. Edit the appropriate file
2. Test locally
3. Increment version number
4. Upload to server
5. Update version in WordPress pages

### Debugging

Access component internals via console:

```javascript
// Check version
window.mapComponent.version

// Reset map
window.mapComponent.resetMap()

// Restart demo
window.mapComponent.mapDemo.restartDemo()

// Check if images preloaded
window.mapComponent.imagePreloader.isImagePreloaded(url)
```

---

## Migration from Original Files

### What Changed

**Before:**
- `Map.html` (1837 lines) - Everything in one file
- `Mapa.html` (1838 lines) - Duplicate with same content

**After:**
- `map-component.css` (~400 lines) - Just styles
- `map-component.js` (~1200 lines) - Just logic
- `map-component.html` (~60 lines) - Just structure

### Benefits

1. **Single Source**: Update once, affects all sites
2. **Maintainability**: Each file has single responsibility
3. **Performance**: Better browser caching
4. **Debugging**: Easier to find issues
5. **Version Control**: Track changes per component

---

## FAQ

**Q: Can I use this on WordPress.com (not self-hosted)?**  
A: No, you need WordPress.org (self-hosted) to upload custom files.

**Q: Will this work with page builders like Elementor?**  
A: Yes, use the HTML widget in your page builder.

**Q: Can I use different map images?**  
A: Yes, update the image URLs in both HTML and JS files.

**Q: Does this work on mobile?**  
A: Yes, fully responsive with touch support.

**Q: Can I have multiple maps on one page?**  
A: Not currently - would need modifications to avoid ID conflicts.

**Q: Is this compatible with caching plugins?**  
A: Yes, but increment version numbers when updating.

**Q: Can I translate the map to other languages?**  
A: The map has no text - it's image-based. Just change the HTML block language context.

---

## Support & Updates

### Changelog

**v1.0.0** (Current)
- Initial modular refactor
- Separated CSS, JS, and HTML
- Added multiple integration methods
- Improved documentation

### Future Enhancements

Potential improvements:
- Minified versions of files
- npm package distribution
- React/Vue component versions
- A11y improvements
- Multiple language support for alt text
- Admin panel for configuration

---

## Credits

Original development: CAMP.mx  
Refactored: 2026  
Version: 1.0.0

---

## License

Please check with the original content owner (CAMP.mx) for licensing information.

---

## Need Help?

If you encounter issues:

1. Check this README thoroughly
2. Review the `wordpress-integration.html` examples
3. Check browser console for errors
4. Verify file paths and URLs
5. Test CORS headers if cross-domain

For custom modifications, consider hiring a developer familiar with:
- Vanilla JavaScript
- CSS animations
- WordPress integration
- Interactive map interfaces
