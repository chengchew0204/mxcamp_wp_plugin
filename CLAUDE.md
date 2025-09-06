# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MxCamp V3 is a WordPress plugin that creates an immersive, interactive website showcasing the MxCamp experience. The site features a custom vertical-scrolling homepage slider, interactive map, dynamic content loading, video backgrounds, and multilingual support (English/Spanish).

## Architecture

This is a **WordPress plugin** project (not a standalone application) with the following key components:

- **Main Plugin**: `mxcamp.php` - WordPress plugin entry point with shortcode `[mxcamp_get_posts_v3]`
- **Core Slider**: `navigation-v3_0.js` - JavaScript class managing the full-page interactive slider experience
- **Interactive Map**: `Post Contents/leaflet_mapa.html` - Leaflet.js-based custom image map with clickable polygons
- **Styling**: `css/mxcamp_style-v3_0.css` + `WP-AdditionalCustomizedCSS.css` - Comprehensive responsive design
- **Supporting Scripts**: Video management, hover effects, asset utilities, and specialized modules

## Key Features

- **Interactive Homepage Slider**: Vertical-scrolling full-page slider with dynamic content loading
- **Custom Interactive Map**: Image-based map using Leaflet.js with hover effects and layer toggling
- **Post Content Hints**: Session-based hint system that helps users discover interactive content (first 3 slides)
- **Multilingual Support**: English/Spanish language switcher via `assets.js:changeLangue()`
- **Video Integration**: Background videos, Vimeo player integration, and custom video modules
- **Event Calendar**: Customized EventON plugin integration
- **WordPress Integration**: Custom theme compatibility with WPBakery page builder

## Development Workflow

### No Build System
This project has **no build process, package.json, or npm commands**. It uses vanilla JavaScript, CSS, and PHP directly deployed to WordPress.

### Testing
- **Manual Testing**: Load in WordPress environment with plugin activated
- **Post Content Hints**: Use browser console commands:
  ```javascript
  navigation.testPostContentHint()      // Test flash animation
  navigation.resetFirstEncounters()     // Reset tracking
  navigation.testCursorHintOnCurrentSlide() // Test cursor hint
  ```
- **Test Page**: `test-post-content-hint.html` provides UI testing interface

### File Structure
```
mxcamp_V3/
├── mxcamp.php                    # Main WordPress plugin file
├── navigation-v3_0.js           # Core slider navigation system
├── css/mxcamp_style-v3_0.css    # Primary stylesheet
├── WP-AdditionalCustomizedCSS.css # Additional WordPress-specific styles
├── Post Contents/
│   ├── leaflet_mapa.html        # Interactive map implementation
│   └── exported_posts/          # Multilingual post content
├── assets.js                    # Utility functions including language switcher
├── BgVideoSound.js             # Background video management
├── hovers.js                   # Hover effect management
├── replacevideo-module.js      # EventON video integration
├── slider_vimeo.js            # Vimeo gallery slider
└── add-onmouseover-detail.js  # Clickable element utility
```

## Code Conventions

### JavaScript
- ES6 class-based architecture (`Navigation` class in navigation-v3_0.js)
- Event-driven programming with careful listener management
- State management through class properties
- Session-based tracking using Sets for hint systems
- Comprehensive error handling and cleanup

### CSS
- Custom font: 'ClearSans' loaded from external CDN
- Mobile-first responsive design approach
- Extensive use of CSS animations and transitions
- Custom cursor implementations
- Plugin-specific customizations for EventON and HBook

### PHP
- WordPress plugin standards
- Shortcode-based content injection
- Database queries for post content (category 16)
- Multilingual post handling

## WordPress Integration

- **Plugin Activation**: Install as WordPress plugin in `/wp-content/plugins/`
- **Shortcode Usage**: `[mxcamp_get_posts_v3]` generates slider content
- **Dependencies**: Requires WPBakery, EventON, and HBook plugins
- **Theme Integration**: Works with custom WordPress themes, includes WPBakery compatibility

## Key Debugging Areas

### Common Issues
- **Loading System**: Complex loading overlay management with multiple fallback triggers
- **Video Playback**: Background video injection and mobile optimization handling
- **Map Interactions**: Layer cycling and polygon click handling in Leaflet map
- **Hint System**: Post content hints and cursor hints with session tracking
- **Responsive Behavior**: Multiple breakpoints and aspect ratio handling

### Development Scripts
- `final_review_gate.py` - Interactive development review script
- `Post Contents/wordpress_posts_exporter*.py` - Content export utilities

## Security Considerations

The `.htaccess` file blocks direct access to PHP and Python files for security. When working with server-side files, ensure proper WordPress security practices are followed.