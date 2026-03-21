/**
 * Event Content Video Handler
 * Manages videos within event descriptions:
 * - Hides controls until hover/tap
 * - Pauses other videos when one starts playing
 * - Works for both lightbox events and single event pages
 */

(function() {
    'use strict';
    
    // Inject CSS to hide control bar background when controls are removed
    const style = document.createElement('style');
    style.textContent = `
        /* Hide video control bar background when controls attribute is removed */
        video:not([controls]) {
            pointer-events: auto;
        }
        
        /* Force hide all control UI elements when controls are not present */
        video:not([controls])::-webkit-media-controls-panel {
            display: none !important;
            opacity: 0 !important;
        }
        
        video:not([controls])::-webkit-media-controls-play-button,
        video:not([controls])::-webkit-media-controls-timeline,
        video:not([controls])::-webkit-media-controls-current-time-display,
        video:not([controls])::-webkit-media-controls-time-remaining-display,
        video:not([controls])::-webkit-media-controls-mute-button,
        video:not([controls])::-webkit-media-controls-volume-slider,
        video:not([controls])::-webkit-media-controls-fullscreen-button {
            display: none !important;
            opacity: 0 !important;
        }
        
        /* Firefox */
        video:not([controls])::-moz-media-controls {
            display: none !important;
            opacity: 0 !important;
        }
        
        /* Ensure smooth transition when controls appear/disappear */
        video {
            transition: none;
        }
    `;
    document.head.appendChild(style);
    
    let managedVideos = new Set();
    
    /**
     * Setup a single video element with hover controls and pause-others behavior
     */
    function setupVideoElement(video) {
        // Skip if already managed
        if (managedVideos.has(video)) {
            return;
        }
        
        managedVideos.add(video);
        
        // Fix data-src to src (lazy loading issue)
        let videoSrc = video.src;
        const source = video.querySelector('source[data-src], source[src]');
        
        if (source && source.hasAttribute('data-src')) {
            const dataSrc = source.getAttribute('data-src');
            source.setAttribute('src', dataSrc);
            videoSrc = dataSrc;
            console.log('Converted source data-src to src:', dataSrc);
        } else if (source && source.hasAttribute('src')) {
            videoSrc = source.getAttribute('src');
            console.log('Found source with src:', videoSrc);
        }
        
        // Also check if video itself has data-src
        if (video.hasAttribute('data-src') && !video.src) {
            videoSrc = video.getAttribute('data-src');
            video.src = videoSrc;
            console.log('Set video src from video data-src:', videoSrc);
        }
        
        // If video doesn't have src but source does, reload
        if (!video.src && videoSrc) {
            console.log('Video missing src, will load from source:', videoSrc);
        }
        
        console.log('Setting up video controls for:', videoSrc || video.src || 'unknown source');
        
        // Ensure video loads first frame so it's visible even without controls
        video.preload = 'auto'; // Load video data automatically
        video.setAttribute('preload', 'auto'); // Also set attribute
        
        // Make sure video element is always visible (not hidden)
        video.style.visibility = 'visible';
        video.style.display = 'block';
        video.style.opacity = '1';
        
        // Force load the video to show first frame
        console.log('Calling video.load() to start loading...');
        video.load();
        
        // Set currentTime to 0.1 seconds to force first frame display (after metadata loads)
        video.addEventListener('loadedmetadata', function onMetadataLoaded() {
            console.log('✓ Video metadata loaded! Duration:', video.duration, 'readyState:', video.readyState);
            if (video.duration > 0) {
                // Seek to 0.1 seconds to ensure first frame is displayed
                try {
                    video.currentTime = 0.1;
                    console.log('✓ Seeked to 0.1s to show first frame');
                } catch (e) {
                    console.error('Failed to seek video:', e);
                }
            }
        }, { once: true });
        
        // When video can start playing, ensure first frame is visible
        video.addEventListener('loadeddata', function onDataLoaded() {
            console.log('✓ Video data loaded (readyState:', video.readyState, ')');
            // Ensure we're at a visible frame
            if (video.currentTime === 0 && video.duration > 0) {
                try {
                    video.currentTime = 0.1;
                    console.log('✓ Set currentTime to 0.1s from loadeddata');
                } catch (e) {
                    console.error('Failed to seek in loadeddata:', e);
                }
            }
        }, { once: true });
        
        // Additional listener for when video can play through
        video.addEventListener('canplay', function onCanPlay() {
            console.log('✓ Video can play (readyState:', video.readyState, ')');
            if (video.currentTime === 0 && video.duration > 0) {
                video.currentTime = 0.1;
                console.log('✓ Set currentTime to 0.1s from canplay');
            }
        }, { once: true });
        
        // Error handling
        video.addEventListener('error', function onError(e) {
            console.error('✗ Video loading error:', e, 'Code:', video.error?.code, 'Message:', video.error?.message);
        }, { once: true });
        
        // Fallback: try multiple times to show first frame
        const tryShowFirstFrame = () => {
            console.log('Fallback check - readyState:', video.readyState, 'currentTime:', video.currentTime, 'duration:', video.duration);
            
            if (video.readyState === 0) {
                console.log('⟳ Video not loaded yet, calling load() again...');
                video.load();
            } else if (video.readyState >= 1) {
                // Video has metadata
                if (video.currentTime === 0 && video.duration > 0) {
                    try {
                        video.currentTime = 0.1;
                        console.log('✓ Fallback: seeked to first frame');
                    } catch (e) {
                        console.error('Fallback seek failed:', e);
                    }
                } else {
                    console.log('✓ Video already showing frame at time:', video.currentTime);
                }
            }
        };
        
        // Try multiple times with increasing delays
        setTimeout(tryShowFirstFrame, 500);
        setTimeout(tryShowFirstFrame, 1500);
        setTimeout(tryShowFirstFrame, 3000);
        
        // Remove controls attribute initially (but video stays visible)
        video.removeAttribute('controls');
        video.style.cursor = 'pointer';
        
        // Add a wrapper div for better hover detection if video is not already wrapped
        let hoverTarget = video.parentElement;
        if (!hoverTarget.classList.contains('video-hover-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'video-hover-wrapper';
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.width = '100%';
            video.parentNode.insertBefore(wrapper, video);
            wrapper.appendChild(video);
            hoverTarget = wrapper;
        }
        
        let hideControlsTimeout = null;
        
        // Show controls on hover/mouseenter
        const showControls = () => {
            if (hideControlsTimeout) {
                clearTimeout(hideControlsTimeout);
                hideControlsTimeout = null;
            }
            video.setAttribute('controls', 'controls');
            console.log('Controls shown for video');
        };
        
        // Hide controls when mouse leaves (with small delay)
        const hideControls = () => {
            hideControlsTimeout = setTimeout(() => {
                video.removeAttribute('controls');
                console.log('Controls hidden for video');
            }, 300); // 300ms delay before hiding
        };
        
        // Mouse events for desktop
        hoverTarget.addEventListener('mouseenter', showControls);
        hoverTarget.addEventListener('mouseleave', hideControls);
        
        // Touch events for mobile/tablet
        let touchTimeout = null;
        hoverTarget.addEventListener('touchstart', (e) => {
            showControls();
            // Keep controls visible for a bit after touch
            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }
            touchTimeout = setTimeout(() => {
                hideControls();
            }, 3000); // Hide after 3 seconds
        }, { passive: true });
        
        // When video starts playing, pause all other managed videos
        video.addEventListener('play', () => {
            console.log('Video started playing, pausing others');
            managedVideos.forEach(otherVideo => {
                if (otherVideo !== video && !otherVideo.paused) {
                    console.log('Pausing other video:', otherVideo.src);
                    otherVideo.pause();
                }
            });
        });
        
        console.log('Video setup complete');
    }
    
    /**
     * Find and setup all videos in event content
     */
    function setupEventVideos() {
        // Find videos in different contexts:
        // 1. Event lightbox (.eventon_full_description)
        // 2. Single event pages (.eventon_desc_in)
        // 3. Single event data cells (body.single-ajde_events .evcal_evdata_cell)
        
        const selectors = [
            '.eventon_full_description video',
            '.eventon_desc_in video',
            'body.single-ajde_events .evcal_evdata_cell video'
        ];
        
        selectors.forEach(selector => {
            const videos = document.querySelectorAll(selector);
            console.log(`Found ${videos.length} videos with selector: ${selector}`);
            
            videos.forEach(video => {
                // Skip background videos (they have specific classes)
                if (video.classList.contains('video-events-grid') || 
                    video.classList.contains('background-video')) {
                    console.log('Skipping background video');
                    return;
                }
                
                // Only handle videos that are in event content (have controls or should have controls)
                setupVideoElement(video);
            });
        });
    }
    
    /**
     * Check if we're on a page with event content
     */
    function hasEventContent() {
        // Skip on homepage - even if it has embedded EventON calendar
        if (document.body.classList.contains('home')) {
            return false;
        }
        
        // Check for EventON-specific elements and body classes
        const hasEventElements = 
            document.querySelector('.eventon_full_description') ||
            document.querySelector('.eventon_desc_in') ||
            document.querySelector('.eventon_list_event') ||
            document.querySelector('#evo_lightboxes') ||
            document.body.classList.contains('single-ajde_events') ||
            document.body.classList.contains('post-type-archive-ajde_events') ||
            // Only check for videos in event-specific containers, not general card-content
            document.querySelector('.eventon_full_description video') ||
            document.querySelector('.eventon_desc_in video') ||
            document.querySelector('body.single-ajde_events .evcal_evdata_cell video');
        
        return !!hasEventElements;
    }
    
    /**
     * Initialize video management
     */
    function init() {
        // Early exit if no event content on the page
        if (!hasEventContent()) {
            console.log('Event content video handler: No event content detected on this page, skipping initialization');
            return;
        }
        
        console.log('Event content video handler initializing...');
        
        // Setup videos immediately
        setupEventVideos();
        
        // Setup MutationObserver to catch dynamically loaded content
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes contain videos or event descriptions
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'VIDEO' || 
                                node.querySelector('video') ||
                                node.classList?.contains('eventon_full_description') ||
                                node.classList?.contains('eventon_desc_in') ||
                                node.querySelector('.eventon_full_description') ||
                                node.querySelector('.eventon_desc_in')) {
                                shouldCheck = true;
                            }
                        }
                    });
                }
                
                // Also check for attribute changes (visibility, display, etc)
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target.classList?.contains('eventon_full_description') ||
                        target.classList?.contains('eventon_desc_in') ||
                        target.querySelector?.('.eventon_full_description') ||
                        target.querySelector?.('.eventon_desc_in')) {
                        shouldCheck = true;
                    }
                }
            });
            
            if (shouldCheck) {
                console.log('New content detected, checking for videos...');
                setTimeout(setupEventVideos, 100); // Small delay to ensure content is rendered
            }
        });
        
        // Observe the entire document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
        
        // Also check when lightbox opens (EventON specific)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.eventon_list_event') || 
                e.target.closest('.evo_btn') ||
                e.target.closest('.desc_trig')) {
                // Event clicked, check for videos multiple times to catch late loading
                console.log('Event card/button clicked, will check for videos');
                setTimeout(setupEventVideos, 100);
                setTimeout(setupEventVideos, 300);
                setTimeout(setupEventVideos, 600);
                setTimeout(setupEventVideos, 1000);
            }
        });
        
        // Specific check for EventON lightbox container
        const checkLightbox = setInterval(() => {
            const lightbox = document.querySelector('#evo_lightboxes');
            if (lightbox && lightbox.style.display !== 'none') {
                console.log('EventON lightbox detected, checking for videos');
                setupEventVideos();
            }
        }, 500);
        
        // Stop checking after 30 seconds to avoid unnecessary polling
        setTimeout(() => clearInterval(checkLightbox), 30000);
        
        console.log('Event content video handler initialized');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also initialize after short delays to catch late-loaded content
    // These will also check for event content before running
    setTimeout(() => {
        if (hasEventContent()) {
            init();
        }
    }, 1000);
    setTimeout(() => {
        if (hasEventContent()) {
            setupEventVideos();
        }
    }, 2000);
    
})();

