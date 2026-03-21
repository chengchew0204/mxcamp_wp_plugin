// Fix 404 Page Menu - Replace old menu with current menu structure
// This script runs only on 404 pages and replaces the outdated menu with the current site menu

(function() {
    'use strict';
    
    // Only run on 404 pages
    if (!document.body.classList.contains('error404')) {
        return;
    }
    
    console.log('404 page detected - fixing menu structure');
    
    // Define the current menu structure based on your live site
    // This matches the menu from navigation-v3_0.js MenuConstruct() method
    // All titles are capitalized
    const currentMenuItems = [
        { title: 'MAPA', url: 'https://camp.mx/#mapa' },
        { title: 'CALENDARIO', url: 'https://camp.mx/#calendario' },
        { title: 'ORIENTACIÓN', url: 'https://camp.mx/#orientacion' },
        { title: 'HUÉSPEDES', url: 'https://camp.mx/#huespedes' },
        { title: 'VOLUNTARIXS', url: 'https://worldpackers.com/locations/camp', external: true },
        { title: 'ORGANIZADORXS', url: 'https://camp.mx/#organizadorxs' },
        { title: 'ARTISTAS', url: 'https://camp.mx/#artistas' },
        { title: 'MEDITADORXS', url: 'https://camp.mx/#meditadorxs' },
        { title: 'NOSOTRXS', url: 'https://camp.mx/#nosotrxs' },
        { title: 'GALERÍA', url: 'https://camp.mx/#galeria' },
        { title: 'CONTEXTO', url: 'https://camp.mx/#contexto' },
        { title: 'RESTAURANTE', url: 'https://camp.mx/#restaurante' },
        { title: 'CONTRIBUIR', url: 'https://camp.mx/#contribuir' }
    ];
    
    // English version - all capitalized
    const currentMenuItemsEN = [
        { title: 'MAP', url: 'https://camp.mx/en/#map' },
        { title: 'CALENDAR', url: 'https://camp.mx/en/#calendar' },
        { title: 'ORIENTATION', url: 'https://camp.mx/en/#orientation' },
        { title: 'GUESTS', url: 'https://camp.mx/en/#guests' },
        { title: 'VOLUNTEERS', url: 'https://worldpackers.com/locations/camp', external: true },
        { title: 'ORGANISERS', url: 'https://camp.mx/en/#organisers' },
        { title: 'ARTISTS', url: 'https://camp.mx/en/#artists' },
        { title: 'MEDITATORS', url: 'https://camp.mx/en/#meditators' },
        { title: 'ABOUT', url: 'https://camp.mx/en/#about' },
        { title: 'GALLERY', url: 'https://camp.mx/en/#gallery' },
        { title: 'CONTEXT', url: 'https://camp.mx/en/#context' },
        { title: 'RESTAURANT', url: 'https://camp.mx/en/#restaurant' },
        { title: 'GIVING', url: 'https://camp.mx/en/#giving' }
    ];
    
    // Determine language
    const isEnglish = document.documentElement.lang === 'en-US';
    const menuItems = isEnglish ? currentMenuItemsEN : currentMenuItems;
    
    // Add scoped CSS for 404 page menu only - makes menu items bigger
    // This CSS only affects .error404 pages, so it won't affect other pages
    function addScopedCSS() {
        // Check if style already exists
        if (document.getElementById('fix-404-menu-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'fix-404-menu-styles';
        style.textContent = `
            /* Scoped CSS for 404 page menu only - matches mxcamp_style-v3_0.css exactly */
            .error404 .mobile-menu ul li p,
            .error404 .mobile-menu ul li a {
                font-family: 'ClearSans', Helvetica, sans-serif !important;
                color: rgba(245, 245, 245, 0.95) !important;
                font-weight: 500 !important;
                font-size: 22px !important;
                text-shadow: rgba(0, 0, 0, 0.6) 0 0 50px, rgba(0, 0, 0, 0.4) 0 0 80px !important;
                text-transform: uppercase !important;
                cursor: pointer !important;
                transition: all 0.3s ease-out !important;
                margin: 10px 0 !important;
                line-height: unset !important;
                opacity: 0.95 !important;
            }
            
            /* Hover effects matching mxcamp_style-v3_0.css */
            .error404 .mobile-menu ul li p:hover,
            .error404 .mobile-menu ul li a:hover {
                color: rgba(255, 255, 255, 1) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Function to replace menu
    function replaceMenu() {
        // Find all mobile menu UL elements
        const mobileMenus = document.querySelectorAll('nav.mobile-menu ul');
        
        if (mobileMenus.length === 0) {
            console.warn('No mobile menu found on 404 page');
            return;
        }
        
        console.log(`Found ${mobileMenus.length} mobile menu(s), replacing with current menu`);
        
        // Replace each menu
        mobileMenus.forEach(menuUl => {
            // Clear old menu
            menuUl.innerHTML = '';
            
            // Build new menu matching navigation.js structure
            menuItems.forEach(item => {
                const li = document.createElement('li');
                const p = document.createElement('p');
                
                // Add the same classes as navigation.js
                p.classList.add('menu-item', 'menu-item-type-custom', 'menu-item-object-custom');
                p.setAttribute('data-post', item.title.toLowerCase());
                p.textContent = item.title;
                
                // Add click handler
                p.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (item.external) {
                        window.open(item.url, '_blank', 'noopener,noreferrer');
                    } else {
                        window.location.href = item.url;
                    }
                });
                
                // CSS handles all styling including hover effects
                
                li.appendChild(p);
                menuUl.appendChild(li);
            });
        });
        
        console.log('404 menu successfully updated with current menu structure');
    }
    
    // Add CSS first
    addScopedCSS();
    
    // Run the replacement
    // Try immediately
    replaceMenu();
    
    // Also try after DOM is fully loaded (in case script runs early)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addScopedCSS();
            replaceMenu();
        });
    }
    
    // And try after a short delay to catch any dynamic menu loading
    setTimeout(function() {
        addScopedCSS();
        replaceMenu();
    }, 100);
    setTimeout(function() {
        addScopedCSS();
        replaceMenu();
    }, 500);
    
})();
