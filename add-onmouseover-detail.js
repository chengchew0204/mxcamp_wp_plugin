/**
 * Add onmouseover-detail class to all clickable elements
 * No hover effects, just adds the class
 */
class OnMouseOverDetailAdder {
    constructor() {
        this.clickableSelectors = [
            'h2',
            'a',                    // Links
            'button',               // Buttons
            '[onclick]',            // Elements with onclick events
            '[role="button"]',      // Button role elements
            'input[type="submit"]', // Submit buttons
            'input[type="button"]', // Button inputs
            '.tap-top',             // Custom tap areas
            '.tap-left',
            '.tap-right', 
            '.tap-bottom',
            '.mobile-menu p',       // Mobile menu items
            '.mobile-menu a',
            '.menu-arrow',          // Menu arrows
            //'.slide_10_bg',
            //'.slide_10_scroll',     // Slide scroll areas
            '.card-header',         // Card headers
            '#playbutton',          // Play button
            '#gif-detail',          // GIF detail element
            '.cursor-pointer',      // Cursor pointer elements
            '.hover',               // Existing hover elements
            '.caretdiv a',          // Navigation arrows
            '.compact-calendar-nav > div[style*="cursor: pointer"]', // Compact navigation carets
            '.fakebutton',          // Fake buttons
            '.ct-toggle',           // Toggle buttons
            '.ct-icon-container',   // Icon containers
            '[data-type]',          // Elements with data-type
            '.eventon_list_event',  // Event list items
            '.hb-thumbnail-link',   // Thumbnail links
            '.pgcsimplygalleryblock-grid-content img', // Gallery images
            '.sliders4',            // Videos grid for Gallery
            // Specific selectors for clickable elements within hover content
            '.hover-content a',
            '.hover-content button',
            '.hover-content [onclick]',
            '.hover-content [role="button"]',
            '.hover-content input[type="submit"]',
            '.hover-content input[type="button"]',
            '.hover-content [data-href]',
            '.hover-content [data-url]',
            '.hover-content [data-link]',
            '.hover-content .clickable',
            '.hover-content .link',
            '.hover-content .btn',
            '.hover-content .button',
            '.hover-content [tabindex]:not([tabindex="-1"])',
            '.hover-content a img',  // Images inside links (truly clickable)
            '.hover-content [onclick] img',  // Images with click handlers
        ];
        
        this.init();
    }

    init() {
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.addClasses();
                // Process again very quickly to catch any missed elements
                setTimeout(() => this.addClasses(), 100);
                setTimeout(() => this.addClasses(), 500);
            });
        } else {
            this.addClasses();
            // Process again very quickly to catch any missed elements
            setTimeout(() => this.addClasses(), 100);
            setTimeout(() => this.addClasses(), 500);
        }
        
        // Set up real-time processing for hover content
        this.setupHoverContentProcessing();
    }

    setupHoverContentProcessing() {
        // Process hover content immediately when it becomes visible
        const processHoverContent = () => {
            const visibleHoverContent = document.querySelectorAll('.hover-content[style*="display: block"], .hover-content[style*="display:block"]');
            visibleHoverContent.forEach(content => {
                const clickableElements = content.querySelectorAll('a, button, [onclick], [role="button"], input[type="submit"], input[type="button"], [data-href], [data-url], [data-link], .clickable, .link, .btn, .button, [tabindex]:not([tabindex="-1"]), a img, [onclick] img');
                this.addToElements(Array.from(clickableElements));
            });
        };

        // Use event delegation to catch hover content changes
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.hover-content')) {
                processHoverContent();
            }
        });

        // Also process when hover elements are hovered
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('hover') || e.target.closest('.hover')) {
                setTimeout(processHoverContent, 10); // Very short delay to let content appear
            }
        });
    }

    addClasses() {
        console.log('Adding onmouseover-detail class to all clickable elements...');
        
        // Get all clickable elements
        const clickableElements = this.getAllClickableElements();
        
        console.log(`Found ${clickableElements.length} clickable elements`);
        
        clickableElements.forEach((element) => {
            // Only add class, nothing else
            element.classList.add('onmouseover-detail');
        });
        
        console.log('All clickable elements now have onmouseover-detail class');
    }

    getAllClickableElements() {
        const elements = new Set();
        
        this.clickableSelectors.forEach(selector => {
            try {
                const found = document.querySelectorAll(selector);
                found.forEach(el => {
                    // Skip if already has class or is hidden
                    if (!el.classList.contains('onmouseover-detail') && 
                        el.style.display !== 'none') {
                        elements.add(el);
                    }
                });
            } catch (e) {
                console.warn(`Selector ${selector} error:`, e);
            }
        });
        
        return Array.from(elements);
    }
    
    // Method to add onmouseover-detail class to specific elements
    addToElements(elements) {
        if (!Array.isArray(elements)) {
            elements = [elements];
        }
        
        elements.forEach(element => {
            if (element && !element.classList.contains('onmouseover-detail')) {
                element.classList.add('onmouseover-detail');
                console.log('Added onmouseover-detail class to:', element);
            }
        });
    }
}

// Auto initialize
window.OnMouseOverDetailAdder = OnMouseOverDetailAdder;
window.onMouseOverDetailAdder = new OnMouseOverDetailAdder();

console.log('OnMouseOverDetail class adder loaded successfully'); 