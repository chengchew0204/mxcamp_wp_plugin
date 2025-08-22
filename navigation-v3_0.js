// LOADING SYSTEM - Now integrated directly from PHP
// Force remove any old #inite elements that might be created by cache or other scripts
(function() {
    const removeOldIniteSystem = () => {
        const oldInite = document.getElementById("inite");
        if (oldInite) {
            console.log("Found and removing old #inite element");
            oldInite.remove();
        }
    };
    
    // Remove immediately and repeatedly to handle any dynamic creation
    removeOldIniteSystem();
    setTimeout(removeOldIniteSystem, 0);
    setTimeout(removeOldIniteSystem, 10);
    setTimeout(removeOldIniteSystem, 50);
    setTimeout(removeOldIniteSystem, 100);
    setTimeout(removeOldIniteSystem, 500);
    
    // Also remove on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeOldIniteSystem);
    }
    
    // Monitor for any dynamic creation of #inite elements
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.id === 'inite') {
                            console.log("Detected dynamically created #inite element, removing it");
                            node.remove();
                        }
                        // Also check children
                        const initeChild = node.querySelector && node.querySelector('#inite');
                        if (initeChild) {
                            console.log("Detected #inite in added subtree, removing it");
                            initeChild.remove();
                        }
                    }
                });
            });
        });
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
    }
})();

class Navigation {
    constructor() {
        //variables globales
        this.cardopened = false;
        this.targetSlide = 'none';
        this.menuopened = false;
        this.scrolling = false;
        // connexion des elements structurels
        this.allmenulink = document.querySelectorAll('nav.mobile-menu a.ct-menu-link');
        this.slider = document.getElementById('slides');
        this.slides = this.slider.querySelectorAll('.slide_10');
        this.body = document.body;
        this.menuToActivate = document.getElementById('offcanvas');
		this.menuToActivate.inert=false; /* Somehow somewere it is inert by default so menu was not clickable */
        this.burgerMenu = document.querySelector('button.ct-header-trigger.ct-toggle');
        this.theFrontVideo= this.slider.querySelectorAll('.thefrontvideo');
        // Store event handler references
        this.eventHandlers = {};
        this.slideIndexMap = {};
        this.slideVisibleIndex = 0;
        this.slideVisibleId = 0;
        
        // Cursor hint management
        this.currentCursorHint = null;
        this.currentCursorHintSlide = null;
        this.cleanupCurrentHint = null;
        
        // Post Content Hint tracking - tracks slides that have shown hints this session
        this.slideHintShown = new Set(); // Track which slides have already shown hints
        
        // Cursor Hint tracking - tracks slides that have shown cursor hints this session
        this.cursorHintShown = new Set(); // Track which slides have already shown cursor hints
        
        // User scrolling detection for hint prevention
        this.isUserScrolling = false;
        this.scrollTimer = null;
        
        // Pending hint timers - to cancel hints when user scrolls away
        this.pendingCursorHintTimer = null;
        this.pendingContentHintTimer = null;
        
        // Check if this is a direct URL visit (card will open automatically)
        this.isDirectUrlVisit = this.checkDirectUrlVisit();
        
        // Loading state management
        this.isFullyLoaded = false;
        this.gifDetailLoaded = false;
        this.backgroundImagesLoaded = false;
        this.loadingSpinner = null;
        
        // Create safe closeAllPreviews function for use before MenuConstruct
        if (!window.closeAllPreviews) {
            window.closeAllPreviews = function() {
                // Will be overridden by actual implementation in MenuConstruct
                console.log("Placeholder closeAllPreviews called before initialization");
            };
        }
        //orientation
        this.currentOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        // Use existing spinner created immediately at page start
        this.useExistingSpinner();
        
        // initialisation de la navigation
        this.init();
	
    }
    
    // Use the existing spinner created by PHP
    useExistingSpinner() {
        // Get reference to the spinner created by PHP
        this.loadingSpinner = document.getElementById('loading-spinner-overlay');
        
        if (this.loadingSpinner) {
            console.log('Using loading spinner created by PHP');
            // Add body class to hide interface elements
            document.body.classList.add('loading-active');
            // Ensure interactions are blocked
            this.blockAllInteractions();
        } else {
            console.warn('Loading spinner not found from PHP, creating fallback');
            this.createFallbackSpinner();
        }
    }
    
    // Fallback spinner creation if PHP spinner failed
    createFallbackSpinner() {
        const spinnerOverlay = document.createElement('div');
        spinnerOverlay.id = 'loading-spinner-overlay';
        spinnerOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: transparent; z-index: 99999; display: flex; align-items: center; justify-content: center; touch-action: none; pointer-events: auto; user-select: none; opacity: 1; transition: opacity 0.5s ease-out;';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = 'width: 75px; height: 75px; border: 4.5px solid rgba(245, 245, 245, 0.3); border-top: 4.5px solid rgba(245, 245, 245, 0.9); border-radius: 50%; animation: spin 1s linear infinite;';
        
        spinnerOverlay.appendChild(spinner);
        document.body.appendChild(spinnerOverlay);
        
        this.loadingSpinner = spinnerOverlay;
        // Add body class to hide interface elements
        document.body.classList.add('loading-active');
        this.blockAllInteractions();
        
        console.log('Fallback loading spinner created');
    }
    
    // Block all user interactions during loading
    blockAllInteractions() {
        // Disable pointer events on main content areas
        if (this.slider) this.slider.style.pointerEvents = 'none';
        if (this.menuToActivate) this.menuToActivate.style.pointerEvents = 'none';
        if (this.burgerMenu) this.burgerMenu.style.pointerEvents = 'none';
        
        // Disable scroll
        document.body.style.overflow = 'hidden';
        
        console.log('All interactions blocked');
    }
    
    // Re-enable interactions after loading
    enableInteractions() {
        // Re-enable pointer events
        if (this.slider) this.slider.style.pointerEvents = '';
        if (this.menuToActivate) this.menuToActivate.style.pointerEvents = '';
        if (this.burgerMenu) this.burgerMenu.style.pointerEvents = '';
        
        // Re-enable scroll
        document.body.style.overflow = '';
        
        console.log('Interactions enabled');
    }
    
    // Hide loading spinner and enable interactions
    hideLoadingSpinner() {
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.add('fade-out');
            // Remove body class to show interface elements again
            document.body.classList.remove('loading-active');
            
            setTimeout(() => {
                if (this.loadingSpinner && this.loadingSpinner.parentNode) {
                    this.loadingSpinner.parentNode.removeChild(this.loadingSpinner);
                }
                this.loadingSpinner = null;
            }, 500); // Match CSS transition time
        }
        
        this.enableInteractions();
        console.log('Loading spinner hidden - interactions enabled');
    }
    
    // initialisation de la navigation
    init() {
        try {
            // Phase 1: Basic setup (no user interaction needed)
            this.replaceDefaultBurgerFunction();
            this.MenuConstruct();
            this.initScrollEvent();
            this.initEscapeButton();
            this.empecherDefilementSurChangementOrientation();
            this.getVisibleSlideInfo();
            this.initArrowKeyNavigation();
            this.initMobileLandscapeWarning();
            this.initOrganizadorxsTitleUpdater();
            
            // Phase 2: Load all resources in parallel
            this.loadAllResourcesWithCallback(() => {
                // All resources loaded, now complete initialization
                this.completeInitialization();
            });
            
        } catch (error) {
            console.error('Navigation initialization error:', error);
            // Even if navigation fails, ensure spinner is hidden
            this.hideLoadingSpinner();
        }
    }
    
    // Complete initialization after gif loads
    completeInitialization() {
        try {
            // Phase 3: Complete setup
            this.LetsListen();
            this.UrlVerif();
            this.ashTagLinks();
            
            // Hide spinner first
            this.hideLoadingSpinner();
            
            // Phase 4: Show cursor hint after spinner disappears
            setTimeout(() => {
                this.initScrollHints();
                this.isFullyLoaded = true;
                console.log('Site fully loaded and ready for interaction');
            }, 600); // Delay to ensure spinner fade-out is complete (500ms + buffer)
            
        } catch (error) {
            console.error('Complete initialization error:', error);
            this.hideLoadingSpinner();
        }
    }


    // Load all resources (gif-detail, background images, etc.) with callback when ready
    loadAllResourcesWithCallback(callback) {
        console.log('Starting comprehensive resource loading...');
        
        const resourcePromises = [];
        
        // 1. Gif-detail removed - no longer loading
        
        // 2. Load background images
        const backgroundPromise = new Promise((resolve) => {
            this.loadBackgroundImages(resolve);
        });
        resourcePromises.push(backgroundPromise);
        
        // 3. Load cursor hint image
        const cursorHintPromise = new Promise((resolve) => {
            this.loadCursorHintImage(resolve);
        });
        resourcePromises.push(cursorHintPromise);
        
        // 4. Wait for document to be fully loaded
        const documentPromise = new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve, { once: true });
            }
        });
        resourcePromises.push(documentPromise);
        
        // Set timeout fallback in case loading takes too long
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                console.warn('Resource loading timeout - proceeding anyway');
                resolve();
            }, 8000); // 8 second timeout for all resources
        });
        
        // Use whichever resolves first - all resources or timeout
        Promise.race([Promise.all(resourcePromises), timeoutPromise])
            .then(() => {
                console.log('All resources loading completed');
                callback();
            })
            .catch((error) => {
                console.error('Resource loading failed:', error);
                callback(); // Still proceed to prevent hanging
            });
    }
    
    // Load background images used by slides
    loadBackgroundImages(callback) {
        console.log('Loading background images...');
        
        // Get all slides with background images
        const slidesWithBackgrounds = [
            { selector: '.slide_10#mapa', url: 'https://camp.mx/wp-content/uploads/mapa_escrit.webp' },
            { selector: '.slide_10#map', url: 'https://camp.mx/wp-content/uploads/mapa_escrit.webp' }
        ];
        
        const imagePromises = [];
        
        slidesWithBackgrounds.forEach(({ selector, url }) => {
            const element = document.querySelector(selector);
            if (element) {
                const imagePromise = new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        console.log('Background image loaded:', url);
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn('Background image failed to load:', url);
                        resolve(); // Still resolve to not block loading
                    };
                    img.src = url;
                });
                imagePromises.push(imagePromise);
            }
        });
        
        if (imagePromises.length === 0) {
            console.log('No background images to load');
            callback();
            return;
        }
        
        Promise.all(imagePromises)
            .then(() => {
                this.backgroundImagesLoaded = true;
                console.log('All background images loaded');
                callback();
            })
            .catch(() => {
                console.warn('Some background images failed to load');
                callback(); // Still proceed
            });
    }
    
    // Load cursor hint image
    loadCursorHintImage(callback) {
        console.log('Loading cursor hint image...');
        
        const img = new Image();
        img.onload = () => {
            console.log('Cursor hint image loaded');
            callback();
        };
        img.onerror = () => {
            console.warn('Cursor hint image failed to load');
            callback(); // Still proceed
        };
        img.src = 'https://camp.mx/wp-content/uploads/pointer-1.png';
    }
    
    // Gif-detail functionality removed
    
    // Gif-detail functionality completely removed
		
	// Gif-detail functionality removed

	// Gif-detail functionality removed
	
    getVisibleSlideInfo() {
        let visibleSlideIndex = -1;
        let visibleSlideId = null;
        const viewportHeight = window.innerHeight;
        this.slides.forEach((slide, index) => {
            const rect = slide.getBoundingClientRect();
            // Vérifiez si le centre de la diapositive est dans la vue
            const isCenterInView = (rect.top + rect.height / 2) >= 0 && (rect.top + rect.height / 2) <= viewportHeight;
            if (isCenterInView) {
                visibleSlideIndex = index;
                visibleSlideId = slide.getAttribute('id');
            }
        });
        
        // Remove previous visible slide classes for giving/contribuir
        this.body.classList.remove('visible-giving', 'visible-contribuir');
        
        // Add body class when giving/contribuir slides are visible
        if (visibleSlideId === 'giving') {
            this.body.classList.add('visible-giving');
        } else if (visibleSlideId === 'contribuir') {
            this.body.classList.add('visible-contribuir');
        }
        
        // Mise à jour des variables de classe avec les valeurs obtenues
        this.slideVisibleIndex = visibleSlideIndex;
        this.slideVisibleId = visibleSlideId;
/*
        if (visibleSlideIndex !== -1 && visibleSlideId !== null) {
            console.log('Visible Slide Index:', this.slideVisibleIndex);
            console.log('Visible Slide ID:', this.slideVisibleId);
        } else {
            console.log('No slide is fully visible.');
        }
		*/
    }
    //navigation depuis  un url avec ashtag
    UrlVerif() {
        // Check for specific hash redirects first
        var urlHash = window.location.hash;
        var currentPath = window.location.pathname;
        
        // Handle specific redirect cases for events/eventos
        if (urlHash) {
            const cleanHash = urlHash.substring(1);
            
            // Redirect #events to calendar (English)
            if (cleanHash === 'events' && (currentPath.includes('/en') || document.documentElement.lang === 'en-US')) {
                window.location.href = 'https://camp.mx/calendar';
                return;
            }
            
            // Redirect #eventos to calendario (Spanish)
            if (cleanHash === 'eventos' && (!currentPath.includes('/en') || document.documentElement.lang === 'es-ES')) {
                window.location.href = 'https://camp.mx/calendario';
                return;
            }
        }
        
        // URL path to slide ID mapping
        const urlToSlideMap = {
            '/about': 'contexto',
            '/airbnb': 'huespedes', 
            '/art': 'art',
            '/artists': 'artistas',
            '/artistas': 'artistas',
            '/cal': 'calendario',
            '/calendar': 'calendario',
            '/calendario': 'calendario',
            '/chat': 'chat',
            '/context': 'contexto',
            '/contexto': 'contexto',
            '/estac': 'estacionamiento',
            '/eventos': 'eventos',
            '/events': 'eventos',
            '/familiacamp': 'familiacamp',
            '/galeria': 'galeria',
            '/gallery': 'galeria',
            '/guests': 'guests',
            '/guia': 'guia',
            '/guide': 'guia',
            '/huespedes': 'huespedes',
            '/logos': 'logos',
            '/map': 'mapa',
            '/nos': 'nosotros',
            '/nosotros': 'nosotros',
            '/nosotrxs': 'nosotros',
            '/org': 'organizadores',
            '/organiser': 'organizadores',
            '/organisers': 'organizadores',
            '/organizadores': 'organizadores',
            '/organizadxr': 'organizadores',
            '/organizer': 'organizadores',
            '/organizers': 'organizadores',
            '/park': 'estacionamiento',
            '/pro': 'promotores',
            '/promoters': 'promotores',
            '/promotores': 'promotores',
            '/promotorxs': 'promotores',
            '/zipolite': 'zipolite',
            '/tandp': 'eventos'
        };

        // Check URL path for direct navigation
        currentPath = window.location.pathname;
        if (currentPath && urlToSlideMap[currentPath]) {
            const slideData = {
                post: 'dontknow',
                divId: urlToSlideMap[currentPath],
                openTheCard: true
            };
            this.gotoSlide(slideData);
            return;
        }

        // Check URL hash for navigation
        urlHash = window.location.hash;
        if (urlHash && urlHash.length>1) {
            // Retirer le caractère # du hash
            var cleanHash = urlHash.substring(1);
            const slideData = {
                post: 'dontknow',
                divId: cleanHash,
                openTheCard : true
            };
            this.gotoSlide(slideData);
        }
    }
    //enlever les videos de la gallerie en fermeture  de card
    removeVideosFromGallery(){
        let gallerySlides = document.querySelectorAll('.slide-camp .slide');
        if(gallerySlides.length>0){
            for(let i=0; i<gallerySlides.length; i++){
                gallerySlides[i].innerHTML ='';
            }
        }
    }
    //construction du menu
    MenuConstruct() {
        const list = this.menuToActivate.querySelector('.mobile-menu ul');
        if (!list) {
            console.error('Élément .mobile-menu ul non trouvé.');
            return;
        }
        list.innerHTML = '';
    
        // Utilisation de forEach avec fonction fléchée pour maintenir le contexte de "this"
        this.slides.forEach((item, index) => {
            const postTitle = item.getAttribute('data-title');
            const postId = item.getAttribute('data-post');
            const divId = item.getAttribute('id');
    
            if (!postTitle || !postId || !divId) {
                console.error('Attributs requis manquants sur l\'élément de diapositive :', item);
                return;
            }
    
                        // Remplir l'objet slideIndexMap
            this.slideIndexMap[index] = {
                index: index,
                id: divId
            };

            // Device-specific title logic for organizadorxs slide
            let displayTitle = postTitle;
            if (divId === 'organizadorxs') {
                // Function to detect mobile device
                const isMobileDevice = () => {
                    return (window.innerWidth <= 768 || 
                           navigator.maxTouchPoints > 0 || 
                           navigator.msMaxTouchPoints > 0 ||
                           ('ontouchstart' in window) || 
                           (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
                           (navigator.userAgent.toLowerCase().indexOf('android') !== -1));
                };
                
                displayTitle = isMobileDevice() ? 'ORGANIZADXR' : 'ORGANIZADORXS';
            }

            const NewMenuItem = document.createElement('li');
            const NewParagraph = document.createElement('p');
            NewParagraph.classList.add('menu-item', 'menu-item-type-custom', 'menu-item-object-custom');
            NewParagraph.setAttribute('data-post', postId);
            NewParagraph.textContent = displayTitle;
            const slideData = {
                post: postId,
                divId: divId,
                openTheCard: false
            };
            
            NewParagraph.addEventListener('click', async (e) => {
                e.preventDefault();
                // Close all previews before navigating to another page
                if (typeof closeAllPreviews === 'function') {
                    closeAllPreviews();
                }
                await this.desActivateMenu(e);
                this.gotoSlide(slideData);
                e.stopPropagation();
            });
            
            // Add enhanced hover effects for better user feedback
            NewParagraph.addEventListener('mouseenter', (e) => {
                e.target.style.transition = 'all 0.2s ease-out';
                e.target.style.opacity = '1';
            });
            
            NewParagraph.addEventListener('mouseleave', (e) => {
                e.target.style.opacity = '';
                e.target.style.transition = '0.3s';
            });
    
            NewMenuItem.appendChild(NewParagraph);
            list.appendChild(NewMenuItem);
    
            let thiscaretdiv = item.querySelector('.caretdiv a');
            if (thiscaretdiv) {
                var cleanHash = thiscaretdiv.getAttribute('data-target-slide');
                console.log('caretdiv go to ' + cleanHash);
                const slideData2 = {
                    post: 'dontknow',
                    divId: cleanHash,
                    openTheCard: false
                };
                thiscaretdiv.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.gotoSlide(slideData2);
                    e.stopPropagation();
                });
            }
        });
    
        //disable auto translate
        if (document.documentElement.lang != "en-US") {
            var meta = document.createElement('meta');
            meta.name = "google";
            meta.content = "notranslate";
            document.getElementsByTagName('head')[0].appendChild(meta);
            console.log('adding google no translate to the header meta');
        }
    
        // Add Custom Menu items here
        // Volunteer section
        const NewMenuItem = document.createElement('li');
        const NewParagraph = document.createElement('p');
        NewParagraph.classList.add('menu-item', 'menu-item-type-custom', 'menu-item-object-custom');
        NewParagraph.setAttribute('data-post', "voluntatixs");
        NewParagraph.style.position = 'relative'; // Add position relative for absolute positioning context
        
        let title = "VOLUNTARIXS";
        if (document.documentElement.lang == "en-US") {
            title = "VOLUNTEERS";
        }
        
        // Create arrow element
        const arrowImg = document.createElement('img');
        arrowImg.src = this.isMobileDevice() ? "https://camp.mx/img/caret28.svg" : "https://camp.mx/img/caret28.svg";
        arrowImg.classList.add('menu-arrow');
        arrowImg.style.width = '16px'; // Original width
        arrowImg.style.height = 'auto';
        arrowImg.style.marginLeft = '2px'; // Keep closer positioning
        arrowImg.style.filter = 'brightness(0) invert(1)'; // Removing drop-shadow effects
        arrowImg.style.transform = 'rotate(-90deg)';
        arrowImg.style.transition = 'transform 0.5s ease';
        arrowImg.style.display = 'inline';
        arrowImg.style.verticalAlign = 'middle';
        arrowImg.style.position = 'relative'; 
        arrowImg.style.top = '-1.75px'; // Move slightly upward
        
        // Create the hover div that will be used for the preview
        const hoverDiv = document.createElement('div');
        hoverDiv.classList.add('hover-content');
        hoverDiv.style.display = 'none';
        hoverDiv.style.position = 'absolute';
        hoverDiv.style.left = 'calc(100% - 70px)'; // Changed from 75px to 50px to move it more to the right
        hoverDiv.style.top = '20px'; // Position below the menu item
        hoverDiv.style.border = '1px solid white'; // Add white border around the entire hover div
        hoverDiv.style.backgroundColor = 'white'; // Set background to white
        hoverDiv.style.padding = '3.5px'; // Adjust padding to 3.5px
        hoverDiv.style.lineHeight = '0'; // Remove line height spacing
        hoverDiv.style.boxSizing = 'border-box'; // Ensure border is included in element dimensions
        
        // Create image element and link
        const linkEl = document.createElement('a');
        linkEl.setAttribute('href', "https://worldpackers.com/locations/camp");
        linkEl.setAttribute('target', "_blank");
        
        const img = document.createElement('img');
        img.alt = "";
        img.width = 280; // Set fixed width
        img.classList.add('wp-image-846');
        img.setAttribute('data-src', "https://worldpackers.com/locations/camp");
        img.src = "https://camp.mx/wp-content/uploads/worldpackers.jpg";
        img.style.display = 'block';
        img.style.margin = '0'; // Remove any margin
        img.style.border = 'none'; // Remove any border from the image itself
        
        // Create a hover bridge element to help with mouse movement
        const hoverBridge = document.createElement('div');
        hoverBridge.style.position = 'absolute';
        hoverBridge.style.height = '20px';
        hoverBridge.style.width = '50px'; // Adjusted width
        hoverBridge.style.bottom = '-10px';
        hoverBridge.style.left = 'calc(100% - 70px)'; // Adjusted left position to match new hover div position
        hoverBridge.style.background = 'transparent';
        hoverBridge.style.zIndex = '99';
        
        NewParagraph.style.position = 'relative'; // Ensure relative positioning
        NewParagraph.appendChild(hoverBridge);
        
        // Create domain text label for Volunteer
        const domainLabel = document.createElement('div');
        domainLabel.textContent = "worldpackers.com".toLowerCase(); // Ensure lowercase domain name
        domainLabel.style.color = "black";
        domainLabel.style.fontSize = "12px";
        domainLabel.style.textAlign = "center";
        domainLabel.style.padding = "3.5px"; // Adjust padding to 3.5px
        domainLabel.style.margin = "0"; // No margin
        domainLabel.style.backgroundColor = "transparent";
        domainLabel.style.width = "100%";
        domainLabel.style.lineHeight = "1"; // Tighter line height
        
        linkEl.appendChild(img);
        hoverDiv.appendChild(linkEl);
        hoverDiv.appendChild(domainLabel);
        
        // Variables to manage hover state
        let volunteerHoverTimer = null;
        let volunteerIsHovering = false;
        let volunteerPreviewShown = false;
        

        
        // Create shared function to close all previews
        function closeAllPreviews() {
            // Close volunteer preview
            volunteerIsHovering = false;
            arrowImg.style.transform = 'rotate(-90deg)';
            hoverDiv.style.display = 'none';
            volunteerPreviewShown = false;
            
            /* COMMENTED OUT: Restaurant preview variables - no longer needed
            // Close restaurant preview
            restaurantIsHovering = false;
            arrowImgRestaurant.style.transform = 'rotate(-90deg)';
            hoverDivRestaurant.style.display = 'none';
            restaurantPreviewShown = false;
            END COMMENTED OUT */
        }
        
        // Make closeAllPreviews globally accessible
        window.closeAllPreviews = closeAllPreviews;
        
        // Update functions to use the closeAllPreviews function
        function showVolunteerPreview() {
            // Close any open previews first
            closeAllPreviews();
            
            // Then open this preview
            arrowImg.style.transform = 'rotate(0deg)';
            hoverDiv.style.display = 'block';
            volunteerIsHovering = true;
            volunteerPreviewShown = true;
        }
        
        /* COMMENTED OUT: Restaurant preview function - no longer needed
        function showRestaurantPreview() {
            // Close any open previews first
            closeAllPreviews();
            
            // Then open this preview
            arrowImgRestaurant.style.transform = 'rotate(0deg)';
            hoverDivRestaurant.style.display = 'block';
            
            // Recheck position when showing
            positionPreview();
            
            restaurantIsHovering = true;
            restaurantPreviewShown = true;
        }
        END COMMENTED OUT */
        
        function hideVolunteerPreview() {
            // Small delay before hiding to allow mouse movement between elements
            volunteerHoverTimer = setTimeout(() => {
                if (!volunteerIsHovering) {
                    arrowImg.style.transform = 'rotate(-90deg)';
                    hoverDiv.style.display = 'none';
                    volunteerPreviewShown = false;
                }
            }, 250);
        }
        
        /* COMMENTED OUT: Restaurant hide preview function - no longer needed
        function hideRestaurantPreview() {
            // Small delay before hiding to allow mouse movement between elements
            restaurantHoverTimer = setTimeout(() => {
                if (!restaurantIsHovering) {
                    arrowImgRestaurant.style.transform = 'rotate(-90deg)';
                    hoverDivRestaurant.style.display = 'none';
                    restaurantPreviewShown = false;
                }
            }, 250);
        }
        END COMMENTED OUT */
        
        // Change hover behavior - only enable hover events on arrows, not paragraph text
        
        // For volunteer section, set up proper hover events
        // Create named event handler functions we can reference
        const volunteerArrowMouseEnter = () => {
            if (!this.isMobileDevice()) {
                clearTimeout(volunteerHoverTimer);
                showVolunteerPreview();
            }
        };
        
        const volunteerArrowMouseLeave = () => {
            if (!this.isMobileDevice()) {
                volunteerIsHovering = false;
                hideVolunteerPreview();
            }
        };
        
        // Add hover event listeners only to the arrow
        arrowImg.addEventListener('mouseenter', volunteerArrowMouseEnter);
        arrowImg.addEventListener('mouseleave', volunteerArrowMouseLeave);
        
        // Add hover event listeners to the hover div to maintain hover state
        hoverDiv.addEventListener('mouseenter', () => {
            if (!this.isMobileDevice()) {
                clearTimeout(volunteerHoverTimer);
                volunteerIsHovering = true;
            }
        });
        
        hoverDiv.addEventListener('mouseleave', () => {
            if (!this.isMobileDevice()) {
                volunteerIsHovering = false;
                hideVolunteerPreview();
            }
        });
        
        // Add click handler for the arrow on mobile - Remove the condition for mobile only
        arrowImg.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (volunteerPreviewShown) {
                // If preview is shown, hide it
                volunteerIsHovering = false;
                arrowImg.style.transform = 'rotate(-90deg)';
                hoverDiv.style.display = 'none';
                volunteerPreviewShown = false;
            } else {
                // If preview is hidden, show it (this will close any other open previews)
                showVolunteerPreview();
            }
        });
        
        // Add click handler for the entire paragraph (text + arrow)
        NewParagraph.addEventListener('click', (e) => {
            // Only handle clicks directly on the paragraph, not bubbled from child elements
            if (e.target === NewParagraph) {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle preview visibility
                if (volunteerPreviewShown) {
                    // If preview is shown, hide it
                    volunteerIsHovering = false;
                    arrowImg.style.transform = 'rotate(-90deg)';
                    hoverDiv.style.display = 'none';
                    volunteerPreviewShown = false;
                } else {
                    // If preview is hidden, show it
                    showVolunteerPreview();
                }
            }
        });
        
        // Instead of adding another event handler to linkEl, let's handle clicks without opening multiple tabs
        // Fix for volunteer link - prevent multiple tabs from opening
        linkEl.addEventListener('click', (e) => {
            // Make sure we only handle this click once
            e.stopPropagation();
        });
        
        // Assemble the structure
        NewParagraph.textContent = title + ' ';
        NewParagraph.appendChild(arrowImg);
        NewParagraph.appendChild(hoverDiv);
        
        // Add enhanced hover effects for volunteer menu item
        NewParagraph.addEventListener('mouseenter', (e) => {
            e.target.style.transition = 'all 0.2s ease-out';
            e.target.style.opacity = '1';
        });
        
        NewParagraph.addEventListener('mouseleave', (e) => {
            e.target.style.opacity = '';
            e.target.style.transition = '0.3s';
        });
        
        NewMenuItem.appendChild(NewParagraph);
        
        const liList = list.querySelectorAll("li");
        const anchorItem = liList[3] || liList[liList.length - 1] || null;
        if (anchorItem?.after) {
            anchorItem.after(NewMenuItem);
        } else {
            list.appendChild(NewMenuItem);
        }
    
        /* COMMENTED OUT: Old Restaurant section - now using WordPress post with video background
        // Restaurant section
        const RestaurantMenuItem = document.createElement('li');
        const RestaurantParagraph = document.createElement('p');
        RestaurantParagraph.classList.add('menu-item', 'menu-item-type-custom', 'menu-item-object-custom');
        RestaurantParagraph.setAttribute('data-post', "restaurante");
        RestaurantParagraph.style.position = 'relative'; // Add position relative for absolute positioning context
        
        let restaurantTitle = "RESTAURANTE";
        if (document.documentElement.lang == "en-US") {
            restaurantTitle = "RESTAURANT";
        }
        
        // Create arrow element
        const arrowImgRestaurant = document.createElement('img');
        arrowImgRestaurant.src = isMobileDevice() ? "https://camp.mx/img/caret28.svg" : "https://camp.mx/img/caret28.svg";
        arrowImgRestaurant.classList.add('menu-arrow');
        arrowImgRestaurant.style.width = '16px'; // Original width
        arrowImgRestaurant.style.height = 'auto';
        arrowImgRestaurant.style.marginLeft = '2px'; // Keep closer positioning
        arrowImgRestaurant.style.filter = 'brightness(0) invert(1)'; // Removing drop-shadow effects
        arrowImgRestaurant.style.transform = 'rotate(-90deg)';
        arrowImgRestaurant.style.transition = 'transform 0.5s ease';
        arrowImgRestaurant.style.display = 'inline';
        arrowImgRestaurant.style.verticalAlign = 'middle';
        arrowImgRestaurant.style.position = 'relative';
        arrowImgRestaurant.style.top = '-1.75px'; // Move slightly upward
        
        // Create the hover div that will be used for the preview
        const hoverDivRestaurant = document.createElement('div');
        hoverDivRestaurant.classList.add('hover-content');
        hoverDivRestaurant.style.display = 'none';
        hoverDivRestaurant.style.position = 'absolute';
        hoverDivRestaurant.style.left = 'calc(100% - 70px)'; // Changed from 75px to 50px to move it more to the right
        hoverDivRestaurant.style.top = '20px'; // Default position below the menu item
        hoverDivRestaurant.style.border = '1px solid white'; // Add white border around the entire hover div
        hoverDivRestaurant.style.backgroundColor = 'white'; // Set background to white
        hoverDivRestaurant.style.padding = '3.5px'; // Adjust padding to 3.5px
        hoverDivRestaurant.style.lineHeight = '0'; // Remove line height spacing
        hoverDivRestaurant.style.boxSizing = 'border-box'; // Ensure border is included in element dimensions
        
        // Create image element and link
        const linkElRestaurant = document.createElement('a');
        linkElRestaurant.setAttribute('href', "https://senem.mx/");
        linkElRestaurant.setAttribute('target', "_blank");
        
        const imgRestaurant = document.createElement('img');
        imgRestaurant.alt = "";
        imgRestaurant.width = 280; // Set fixed width
        imgRestaurant.classList.add('wp-image-846');
        imgRestaurant.setAttribute('data-src', "https://senem.mx/");
        imgRestaurant.src = "https://camp.mx/wp-content/uploads/senem-1.jpg";
        imgRestaurant.style.display = 'block';
        imgRestaurant.style.margin = '0'; // Remove any margin
        imgRestaurant.style.border = 'none'; // Remove any border from the image itself
        
        // Create a hover bridge element to help with mouse movement
        const hoverBridgeRestaurant = document.createElement('div');
        hoverBridgeRestaurant.style.position = 'absolute';
        hoverBridgeRestaurant.style.height = '20px';
        hoverBridgeRestaurant.style.width = '50px'; // Adjusted width
        hoverBridgeRestaurant.style.bottom = '-10px'; // This may be changed by the positioning function
        hoverBridgeRestaurant.style.left = 'calc(100% - 70px)'; // Adjusted left position to match new hover div position
        hoverBridgeRestaurant.style.background = 'transparent';
        hoverBridgeRestaurant.style.zIndex = '99';
        
        // Position check for the hover preview on mobile
        const positionPreview = () => {
            // Detect if we're on a mobile device or narrow screen
            if (window.innerWidth <= 768 || isMobileDevice()) {
                // For RESTAURANTE menu item, position the preview above instead of below
                const menuRect = RestaurantParagraph.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                // Use a simple fixed position approximating the arrow position
                // This avoids expensive DOM calculations that might slow down mobile devices
                hoverDivRestaurant.style.left = '100px'; // Approximate position aligned with arrow
                hoverDivRestaurant.style.transform = 'none';
                hoverDivRestaurant.style.width = '280px';
                
                // If the menu item is in the bottom half of the screen, show preview above
                if (menuRect.bottom > viewportHeight * 0.7) {
                    hoverDivRestaurant.style.bottom = '100%';
                    hoverDivRestaurant.style.top = 'auto';
                    
                    // Update bridge position too
                    hoverBridgeRestaurant.style.top = '-10px';
                    hoverBridgeRestaurant.style.bottom = 'auto';
                } else {
                    // Position closer to text for mobile
                    hoverDivRestaurant.style.top = '0'; // Changed from 20px to 0
                    hoverDivRestaurant.style.bottom = 'auto';
                    
                    // Update bridge position too
                    hoverBridgeRestaurant.style.bottom = '-10px';
                    hoverBridgeRestaurant.style.top = 'auto';
                }
                
                // Also adjust the volunteer hover content for consistency - use same fixed value
                hoverDiv.style.left = '100px'; // Approximate position aligned with arrow
                hoverDiv.style.transform = 'none';
                hoverDiv.style.width = '280px';
                
                // Position volunteer hover closer to text 
                if (hoverDiv.parentElement.getBoundingClientRect().bottom > viewportHeight * 0.7) {
                    // Bottom of screen - show above
                    hoverDiv.style.bottom = '100%';
                    hoverDiv.style.top = 'auto';
                    hoverBridge.style.top = '-10px';
                    hoverBridge.style.bottom = 'auto';
                } else {
                    // Top/middle of screen - show below but closer
                    hoverDiv.style.top = '0'; // Changed from default to 0
                    hoverDiv.style.bottom = 'auto';
                    hoverBridge.style.bottom = '-10px';
                    hoverBridge.style.top = 'auto';
                }
            } else {
                // On desktop, show below with original positioning
                hoverDivRestaurant.style.top = '20px';
                hoverDivRestaurant.style.bottom = 'auto';
                hoverDivRestaurant.style.left = 'calc(100% - 70px)';
                hoverDivRestaurant.style.transform = 'translateY(-10px)';
                
                // Update bridge position too
                hoverBridgeRestaurant.style.bottom = '-10px';
                hoverBridgeRestaurant.style.top = 'auto';
                
                // Restore original volunteer hover positioning
                hoverDiv.style.left = 'calc(100% - 70px)';
                hoverDiv.style.transform = 'translateY(-10px)';
            }
        };
        
        // Call position function initially
        positionPreview();
        
        // Update position on resize
        window.addEventListener('resize', positionPreview);
        
        RestaurantParagraph.style.position = 'relative'; // Ensure relative positioning
        RestaurantParagraph.appendChild(hoverBridgeRestaurant);
        
        // Create domain text label for Restaurant
        const domainLabelRestaurant = document.createElement('div');
        domainLabelRestaurant.textContent = "senem.mx".toLowerCase(); // Ensure lowercase domain name
        domainLabelRestaurant.style.color = "black";
        domainLabelRestaurant.style.fontSize = "12px";
        domainLabelRestaurant.style.textAlign = "center";
        domainLabelRestaurant.style.padding = "3.5px"; // Adjust padding to 3.5px
        domainLabelRestaurant.style.margin = "0"; // No margin
        domainLabelRestaurant.style.backgroundColor = "transparent";
        domainLabelRestaurant.style.width = "100%";
        domainLabelRestaurant.style.lineHeight = "1"; // Tighter line height
        
        linkElRestaurant.appendChild(imgRestaurant);
        hoverDivRestaurant.appendChild(linkElRestaurant);
        hoverDivRestaurant.appendChild(domainLabelRestaurant);
        
        // Variables to manage hover state
        let restaurantHoverTimer = null;
        let restaurantIsHovering = false;
        let restaurantPreviewShown = false;
        
        // For restaurant section, set up proper hover events
        // Create named event handler functions we can reference
        const restaurantArrowMouseEnter = () => {
            if (!isMobileDevice()) {
                clearTimeout(restaurantHoverTimer);
                showRestaurantPreview();
            }
        };
        
        const restaurantArrowMouseLeave = () => {
            if (!isMobileDevice()) {
                restaurantIsHovering = false;
                hideRestaurantPreview();
            }
        };
        
        // Add hover event listeners only to the arrow
        arrowImgRestaurant.addEventListener('mouseenter', restaurantArrowMouseEnter);
        arrowImgRestaurant.addEventListener('mouseleave', restaurantArrowMouseLeave);
        
        // Add hover event listeners to the hover div to maintain hover state
        hoverDivRestaurant.addEventListener('mouseenter', () => {
            if (!isMobileDevice()) {
                clearTimeout(restaurantHoverTimer);
                restaurantIsHovering = true;
            }
        });
        
        hoverDivRestaurant.addEventListener('mouseleave', () => {
            if (!isMobileDevice()) {
                restaurantIsHovering = false;
                hideRestaurantPreview();
            }
        });
        
        // Add click handler for the Restaurant text
        RestaurantParagraph.addEventListener('click', (e) => {
            // Only handle if clicking directly on the paragraph element (not its children)
            if (e.target === RestaurantParagraph) {
                e.preventDefault();
                e.stopPropagation();
                
                if (restaurantPreviewShown) {
                    // If preview is shown, hide it
                    restaurantIsHovering = false;
                    arrowImgRestaurant.style.transform = 'rotate(-90deg)';
                    hoverDivRestaurant.style.display = 'none';
                    restaurantPreviewShown = false;
                } else {
                    // If preview is hidden, show it
                    showRestaurantPreview();
                }
                // Never navigate directly to URL when clicking the text
            }
        });
        
        // Fix for restaurant arrow click behavior
        arrowImgRestaurant.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (restaurantPreviewShown) {
                // If preview is shown, hide it
                restaurantIsHovering = false;
                arrowImgRestaurant.style.transform = 'rotate(-90deg)';
                hoverDivRestaurant.style.display = 'none';
                restaurantPreviewShown = false;
            } else {
                // If preview is hidden, show it (this will close any other open previews)
                showRestaurantPreview();
            }
        });
        
        // Single click handler for restaurant link
        linkElRestaurant.addEventListener('click', (e) => {
            // Make sure we only handle this click once
            e.stopPropagation();
        });
        
        // Assemble the structure
        RestaurantParagraph.textContent = restaurantTitle + ' ';
        RestaurantParagraph.appendChild(arrowImgRestaurant);
        RestaurantParagraph.appendChild(hoverDivRestaurant);
        RestaurantMenuItem.appendChild(RestaurantParagraph);
        
        list.appendChild(RestaurantMenuItem);
        END COMMENTED OUT Restaurant section */
    }
   //on met  des listen sur els ahtag internes a la page qui ont la class openthecard
   ashTagLinks(){
     // Handle both links with .openthecard class and all internal hash links
     let linksToOpenCard = document.querySelectorAll('.openthecard');
     linksToOpenCard.forEach(item => {
        var url = item.getAttribute('href');
        try {
            // Handle both relative and absolute URLs
            var parsedUrl = url.startsWith('http') ? new URL(url) : new URL(url, window.location.origin);
            var hash = parsedUrl.hash;
            var hashWithoutHash = hash.substring(1);
            const slideData = {
                post: url,
                divId: hashWithoutHash,
                openTheCard: true
            };
            item.addEventListener('click', (e)=>{e.preventDefault(); this.gotoSlide(slideData)});
            item.style.behavior='smooth';
        } catch (error) {
            console.warn('Failed to parse URL:', url, error);
            // Fallback: if URL parsing fails, try to extract hash directly
            if (url.includes('#')) {
                var hashWithoutHash = url.split('#')[1];
                const slideData = {
                    post: url,
                    divId: hashWithoutHash,
                    openTheCard: true
                };
                item.addEventListener('click', (e)=>{e.preventDefault(); this.gotoSlide(slideData)});
                item.style.behavior='smooth';
            }
        }
     });

     // Handle ALL internal anchor links on the page (hash links)
     let allInternalLinks = document.querySelectorAll('a[href^="#"]');
     allInternalLinks.forEach(item => {
        // Skip if already handled by .openthecard class
        if (item.classList.contains('openthecard')) return;
        
        var href = item.getAttribute('href');
        // Skip empty hashes or just "#"
        if (!href || href === '#') return;
        
        var hashWithoutHash = href.substring(1);
        // Check if this hash corresponds to an existing slide
        var targetElement = document.getElementById(hashWithoutHash);
        if (targetElement && targetElement.classList.contains('slide_10')) {
            const slideData = {
                post: href,
                divId: hashWithoutHash,
                openTheCard: true
            };
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.gotoSlide(slideData);
            });
            item.style.scrollBehavior = 'smooth';
        }
     });
     //trouver var url
    }
    //navigation to the slide
    gotoSlide(obj) {
        // Cancel any pending hints when navigating to a new slide
        this.cancelPendingHints();
        
        // Close all previews when navigating to a slide
        if (typeof window.closeAllPreviews === 'function') {
            window.closeAllPreviews();
        }
        
        const divId = obj.divId;
        const openCard = obj.openTheCard === undefined ? true : obj.openTheCard;
        const element = document.getElementById(divId);
        
        if (!element) {
            console.warn('[gotoSlide] target element not found:', divId);
            return;
        }
        
        window.location.hash ='';
      if (this.cardopened === true && this.targetSlide === divId) {
          this.openCard(obj);
      } else {
          this.scrolling = true;
          console.log(obj.post, ':', divId);
          const rect = element.getBoundingClientRect();
          const isElementInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (isElementInView) {
              console.log('Element is already in view');
              this.desActivateMenu();
              this.openCard(obj);
              this.scrolling = false;
          } else {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              const checkVisibility = () => {
                  const rect = element.getBoundingClientRect();
                  const isElementInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
                  if (isElementInView) {
                      console.log('Element is in view');
                      this.desActivateMenu();
                      this.scrolling = false;
                      this.slider.removeEventListener('scroll', checkVisibility);
                      
                      // Show cursor hint for the destination slide after navigation completes
                      // Only if the card is not going to open automatically
                      if (!openCard) {
                          setTimeout(() => {
                              if (!element.classList.contains('opened')) {
                                  this.showCursorHint(element);
                              }
                          }, 200); // Small delay to ensure scroll has fully stopped
                      }
                      
                      if(divId==='galeria' || divId==='gallery' || divId==='mapa' || divId==='map' || divId==='eventos' || divId==='events'){
                        console.log('stop');
                        return;
                      }
                      if(openCard && openCard===true){
                        this.openCard(obj);
                        return;
                       }
                       //this.openCard(obj.divId);
                  }
              };
              // Vérifie la visibilité de l'élément après le défilement
              this.slider.addEventListener('scroll', checkVisibility);
          }
      }
  }
    // Ajouter les event listener pour ouvrir/fermer les slides
    LetsListen() {
            this.slides.forEach(item => {
            const slideId = item.getAttribute('id');
            const slideScroll = item.querySelector('.slide_10_scroll');
            const slideBg = item.querySelector('.slide_10_bg');
            // Store the handler reference
            this.eventHandlers[slideId+'scroll'] = this.openCard.bind(this, { divId: slideId });
            // Ajouter l'événement click en utilisant une méthode liée
            slideScroll.addEventListener('click', this.eventHandlers[slideId+'scroll']);
            
            // Also add click handler to slide_10_bg elements
            if (slideBg) {
                this.eventHandlers[slideId+'bg'] = this.openCard.bind(this, { divId: slideId });
                slideBg.addEventListener('click', this.eventHandlers[slideId+'bg']);
            }
            this.eventHandlers[slideId+'tap'] = this.closeCardsE.bind(this);
         //   const tapTop = item.getElementById('mapExit1');
			console.log('adding:'+slideId);
         //   tapTop.addEventListener('click', this.eventHandlers[slideId+'tap']);   
            const tapTop = item.querySelector('.tap-top');
            const tapLeft = item.querySelector('.tap-left');
            const tapRight = item.querySelector('.tap-right');
            const tapBottom = item.querySelector('.tap-bottom');
            
            // Check if it's mobile device and events section
            const isMobileDevice = (window.innerWidth <= 768 || 
                           navigator.maxTouchPoints > 0 || 
                           navigator.msMaxTouchPoints > 0 ||
                           ('ontouchstart' in window) || 
                           (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
                           (navigator.userAgent.toLowerCase().indexOf('android') !== -1));
            
            const isEventsSection = (slideId === 'eventos' || slideId === 'events');
            
            // Only skip tap event listeners if it's mobile device AND events section
            if (!(isMobileDevice && isEventsSection)) {
                tapTop && tapTop.addEventListener('click', this.eventHandlers[slideId+'tap']);
                tapLeft && tapLeft.addEventListener('click', this.eventHandlers[slideId+'tap']);
                tapRight && tapRight.addEventListener('click', this.eventHandlers[slideId+'tap']);
                tapBottom && tapBottom.addEventListener('click', this.eventHandlers[slideId+'tap']);
            }
            
            this.menuToActivate.addEventListener('click', (e) => {e.preventDefault();this.desActivateMenu(e); e.stopPropagation();});
        });
    }
    replaceDefaultBurgerFunction() {
        const newburgerMenu = this.burgerMenu.cloneNode(true);
        newburgerMenu.removeAttribute('data-toggle-panel');
        newburgerMenu.addEventListener('click', (e) => this.triggerMenu(e));
        this.burgerMenu.parentNode.replaceChild(newburgerMenu, this.burgerMenu);
    }
    triggerMenu(e) {
        e.preventDefault();
        this.menuopened ? this.desActivateMenu() : this.activateMenu();
    }
    activateMenu() {
        console.log('menuopen', this.menuopened);
        
        // Hide any active cursor hint when menu is activated
        this.hideCurrentCursorHint();
        
        if(this.cardopened===true){this.closeCards()};
        this.slider.classList.add('menuactive');
        this.body.style.overflow = "hidden";
        this.menuToActivate.classList.add('active');
        this.menuopened = true;
        console.log('menu ouvert ?');
    }
    desActivateMenu(e) {
        console.log('menuopen', this.menuopened);
        // Only try to open a URL if we have a valid event and target with data-src attribute
        if (e && e.target && e.target.tagName === 'IMG' && e.target.hasAttribute('data-src')) {
            const url = e.target.getAttribute('data-src');
            // Only open the URL if it's not already being handled by a parent anchor tag
            const isInsideLink = e.target.closest('a') !== null;
            if (!isInsideLink && url) {
                // Use window.open to ensure only one tab is opened
                window.open(url, '_blank');
                // Don't create and click a link element as this can cause multiple tabs
            }
        }
        
        // Close all previews when the menu is closed
        if (typeof window.closeAllPreviews === 'function') {
            window.closeAllPreviews();
        }
        
        this.slider.classList.remove('menuactive');
        this.menuToActivate.classList.remove('active');
        this.menuopened = false;
    
        // Return a promise that resolves when the transition ends
        return new Promise((resolve) => {
            const onTransitionEnd = () => {
                this.menuToActivate.removeEventListener('transitionend', onTransitionEnd);
                resolve();
            };
            this.menuToActivate.addEventListener('transitionend', onTransitionEnd);
        });
    }
    downloadsources(slideId){
      var datasrc= document.querySelectorAll('#'+slideId+' [data-src]');
      console.log('downloading '+slideId)
      for (var i = 0; i < datasrc.length; i++) {
        let thisdatasrc = datasrc[i].getAttribute('data-src');
        datasrc[i].setAttribute('src', thisdatasrc)
      }
    }
    openCard(obj) {
        // Handle both string and object formats for backward compatibility
        const slideId = typeof obj === 'string' ? obj : obj.divId;
        
        // Immediately hide any active cursor hint to prevent interference
        this.hideCurrentCursorHint();
        
        // Force close any open card immediately to ensure clean state before opening new card
        // This prevents crashes when cards aren't properly closed
        this.forceCloseCards();
        
        gtag('event', 'Open_Card', {
            'event_category': slideId,
            'event_label': slideId,
            'value': 1
          });
        console.log('START opening card', 'slideid', this.targetSlide, 'cardopened', this.cardopened);
        this.downloadsources(slideId);
        //on charge le post
        const target = '#'+slideId+' .target';
        //j'affiche un message de loading
          if(slideId==="gallery" || slideId==="galeria"){
            SliderConstructor('slider1');
            SliderConstructor('slider2');
            SliderConstructor('slider3');
            SliderConstructor('slider4');
          }else if(slideId==="calendar" || slideId==="calendario"){
           // initializeCalendar(jQuery);
           this.initializeCompactCalendarNav();
          }else if(slideId==="eventos" || slideId==="events"){
           // Immediately hide original calendar navigation to prevent glitch
           setTimeout(() => {
               const calendar = document.querySelector('.ajde_evcal_calendar');
               if (calendar) {
                   const calendarHeader = calendar.querySelector('.calendar_header');
                   if (calendarHeader) {
                       const evoJDates = calendarHeader.querySelector('.evo_j_dates');
                       if (evoJDates) {
                           evoJDates.style.display = 'none';
                       }
                   }
               }
           }, 10); // Very short delay to ensure DOM is ready
           
           // Initialize compact calendar navigation for events section
           this.initializeCompactCalendarNav();
          }
          // Pause all background videos when opening a card
          this.theFrontVideo.forEach(function(el) {
              console.log(el);
              el.pause();
          });
        //this.cardopened ?? this.closeCards();
        this.desActivateMenu();
        this.targetSlide = slideId;
        this.body.classList.add('bodycardopened');
        this.body.classList.add(slideId);
        const slideopened = document.getElementById(slideId);
        slideopened.classList.remove('closed');
        slideopened.classList.add('opened');
        
        // Reset card progression - scroll all containers to top
        this.resetCardScrollPosition(slideId);
		
        if(slideId==="mapa" || slideId==="map"){
			setTimeout(() => { 
				//document.getElementById('focus-point').scrollIntoView({behavior: "auto"})
				const mapContainer = document.getElementById('imap'); //Get scroll object
				
				// Check if mobile device for different positioning
				const isMobileDevice = () => {
					const userAgent = navigator.userAgent.toLowerCase();
					const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
					const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
					const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
					const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
					return isMobileUA || (hasTouch && isSmallScreen);
				};
				
				if (isMobileDevice()) {
					// On mobile: reset scroll position for mobile auto-scroll to work
					mapContainer.scrollLeft = 0;
					mapContainer.scrollTop = 0;
					console.log('Mobile map positioned at top - scrollTop: 0');
					
					// Also scroll the page to show the map card at the top
					setTimeout(() => {
						const mapCard = document.getElementById(slideId);
						if (mapCard) {
							mapCard.scrollIntoView({ 
								behavior: 'smooth', 
								block: 'start',
								inline: 'nearest'
							});
							console.log('Mobile page scrolled to show map card at top');
						}
					}, 200); // Small delay to ensure card is fully opened
				} else {
					// On desktop: disable auto-scroll animation completely
					if (typeof window.mapscroll !== 'undefined') {
						window.mapscroll = 0; // Stop any auto-scroll animation
						console.log('Desktop: Auto-scroll animation disabled');
					}
					
					// Don't reset scroll position on desktop - let it stay where it naturally is
					console.log('Desktop map opened without position reset');
				}
				
				console.log('Map scrolled to Pos:'+mapContainer.scrollLeft+', '+mapContainer.scrollTop+' Max:'+mapContainer.scrollWidth+','+mapContainer.scrollHeight+' Size:'+mapContainer.offsetWidth+','+mapContainer.offsetHeight);
				
				// Map interactions now handled directly in Map/Mapa post content
		    },100)
		}
       // Supprimer l'événement a slide_scroll click en utilisant la référence stockée
        const zoneClick = slideopened.querySelector('.slide_10_scroll');
        if (zoneClick && this.eventHandlers[slideId+'scroll']) {
            zoneClick.removeEventListener('click', this.eventHandlers[slideId+'scroll'], false);
        }
        
        // Also remove slide_10_bg click event listener
        const zoneBg = slideopened.querySelector('.slide_10_bg');
        if (zoneBg && this.eventHandlers[slideId+'bg']) {
            zoneBg.removeEventListener('click', this.eventHandlers[slideId+'bg'], false);
        }
        
        // Device-specific title logic for organizadorxs slide card header
        if (slideId === 'organizadorxs') {
            const cardHeader = slideopened.querySelector('.card-header h2');
            if (cardHeader) {
                // Function to detect mobile device
                const isMobileDevice = () => {
                    return (window.innerWidth <= 768 || 
                           navigator.maxTouchPoints > 0 || 
                           navigator.msMaxTouchPoints > 0 ||
                           ('ontouchstart' in window) || 
                           (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
                           (navigator.userAgent.toLowerCase().indexOf('android') !== -1));
                };
                
                cardHeader.textContent = isMobileDevice() ? 'ORGANIZADXR' : 'ORGANIZADORXS';
            }
        }
        
        // Ajoute lèvenement a header
        const cardHeader = slideopened.querySelector('.card-header');
        this.eventHandlers[slideId+'header'] = this.closeCardsE.bind(this);
        cardHeader.addEventListener('click', this.eventHandlers[slideId+'header']);
        this.cardopened = true;
        console.log('END opening card', 'slideid', this.targetSlide, 'cardopened', this.cardopened);
    }
    
    showCursorHint(slideElement) {
        const slideId = slideElement.id;
        
        // Check if cursor hint has already been shown for this slide this session
        if (this.cursorHintShown.has(slideId)) {
            console.log('Cursor hint skipped for slide:', slideId, '- already shown this session');
            return; // Don't show cursor hint again
        }
        
        // Remove any existing cursor hint to allow fresh animation
        const existingHint = slideElement.querySelector('.cursor-hint');
        if (existingHint) {
            existingHint.parentNode.removeChild(existingHint);
        }

        // Create cursor hint element
        const cursorHint = document.createElement('div');
        cursorHint.className = 'cursor-hint';
        
        // Add to slide
        slideElement.appendChild(cursorHint);
        
        // Store reference for immediate cleanup
        this.currentCursorHint = cursorHint;
        this.currentCursorHintSlide = slideElement;
        
        // Check if this is a first encounter and should show post content hint
        
        // Define heavy slides that use image flash instead of card content flash
        const heavySlides = ['mapa', 'map', 'calendar', 'calendario', 'gallery', 'galeria'];
        const isHeavySlide = heavySlides.includes(slideId);
        
        // Show post content hint on every slide (no longer limited to first 3)
        const isExcludedSlide = false;
        
        // Show post content hint if not excluded, not direct URL visit, and not already shown this session
        const shouldShowPostContentHint = !isExcludedSlide && 
                                         !this.isDirectUrlVisit && 
                                         !this.slideHintShown.has(slideId);
        
        if (shouldShowPostContentHint) {
            console.log('Post content hint will show for slide:', slideId, '- first time this session');
        } else if (this.isDirectUrlVisit) {
            console.log('Post content hint skipped for slide:', slideId, '- direct URL visit detected');
        } else if (this.slideHintShown.has(slideId)) {
            console.log('Post content hint skipped for slide:', slideId, '- already shown this session');
        } else {
            console.log('Post content hint conditions not met for slide:', slideId, {
                isExcludedSlide,
                isDirectUrlVisit: this.isDirectUrlVisit,
                alreadyShown: this.slideHintShown.has(slideId)
            });
        }
        
        // Cancel any existing pending hints before starting new ones
        this.cancelPendingHints();
        
        // Trigger the animation by adding the play class after a brief delay
        this.pendingCursorHintTimer = setTimeout(() => {
            // Clear the timer reference since it's now executing
            this.pendingCursorHintTimer = null;
            if (cursorHint && cursorHint.parentNode) {
                cursorHint.classList.add('play');
                
                // Mark this slide as having shown its cursor hint
                this.cursorHintShown.add(slideId);
                console.log('Added slide to cursor hint tracking:', slideId, 'Total slides with cursor hints shown:', this.cursorHintShown.size);
                
                // Use the stored decision to schedule the post content hint
                if (shouldShowPostContentHint) {
                    console.log('Scheduling post content hint for slide:', slideElement.id, '- Type:', isHeavySlide ? 'IMAGE FLASH' : 'CARD FLASH');
                    this.schedulePostContentHint(slideElement, isHeavySlide);
                    
                    // Mark this slide as having shown its content hint
                    this.slideHintShown.add(slideId);
                    console.log('Added slide to content hint tracking:', slideId, 'Total slides with content hints shown:', this.slideHintShown.size);
                }
            }
        }, 1100);
        
        // Create cleanup function with smooth fade-out
        const cleanupHint = () => {
            if (cursorHint && cursorHint.parentNode) {
                // Fade out smoothly first
                cursorHint.style.opacity = '0';
                cursorHint.style.animation = 'none';
                
                // Remove after fade transition completes
                setTimeout(() => {
                    if (cursorHint && cursorHint.parentNode) {
                        cursorHint.parentNode.removeChild(cursorHint);
                    }
                }, 2600); // Match CSS animation duration (2.5s) plus small buffer
            }
            this.currentCursorHint = null;
            this.currentCursorHintSlide = null;
        };
        
        // Store cleanup function for immediate access
        this.cleanupCurrentHint = cleanupHint;
        
        // Set up interaction listeners to hide hint - use mousedown/touchstart to catch before click
        const hideOnInteraction = (event) => {
            // Hide hint on any meaningful interaction
            if (event.type === 'mousedown' || 
                event.type === 'touchstart' || 
                (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))) {
                
                // Remove listeners first to prevent any recursive calls
                document.removeEventListener('mousedown', hideOnInteraction, { capture: true, passive: true });
                document.removeEventListener('touchstart', hideOnInteraction, { capture: true, passive: true });
                document.removeEventListener('keydown', hideOnInteraction, true);
                
                // Hide hint immediately without interfering with the event
                cleanupHint();
                
                // DO NOT prevent default or stop propagation - let the interaction proceed normally
            }
        };
        
        // Use mousedown instead of click to catch the interaction before it triggers navigation
        document.addEventListener('mousedown', hideOnInteraction, { capture: true, passive: true });
        document.addEventListener('touchstart', hideOnInteraction, { capture: true, passive: true });
        document.addEventListener('keydown', hideOnInteraction, true); // keydown can't be passive
        
        // Remove the hint after animation completes (fallback)
        setTimeout(() => {
            cleanupHint();
            // Clean up interaction listeners in case they weren't triggered
            document.removeEventListener('mousedown', hideOnInteraction, { capture: true, passive: true });
            document.removeEventListener('touchstart', hideOnInteraction, { capture: true, passive: true });
            document.removeEventListener('keydown', hideOnInteraction, true);
        }, 3000);
    }
    
    schedulePostContentHint(slideElement, isHeavySlide = false) {
        // Calculate timing for midpoint of cursor hint animation
        // hintTap animation is 1.3s total, midpoint is around 0.4s (30% of animation) for better timing
        const hintMidpointDelay = 400; // milliseconds - earlier in the animation
        
        console.log('Scheduling post content hint for slide:', slideElement.id, 'in', hintMidpointDelay, 'ms', 
                   '- Type:', isHeavySlide ? 'IMAGE FLASH' : 'CARD FLASH');
        
        this.pendingContentHintTimer = setTimeout(() => {
            // Clear the timer reference since it's now executing
            this.pendingContentHintTimer = null;
            
            // Verify the slide still exists and hasn't been opened
            const slideStillExists = slideElement && slideElement.parentNode;
            const slideNotOpened = !slideElement.classList.contains('opened');
            const cardNotOpened = !this.cardopened;
            
            // Check if cursor hint is still active (but don't require it)
            const cursorHintStillActive = this.currentCursorHintSlide === slideElement &&
                                        this.currentCursorHint && this.currentCursorHint.parentNode;
            
            console.log('Post content hint check:', {
                slideExists: slideStillExists,
                cursorHintActive: cursorHintStillActive,
                slideNotOpened: slideNotOpened,
                cardNotOpened: cardNotOpened,
                slideId: slideElement.id,
                isHeavySlide: isHeavySlide,
                currentCursorHintSlide: this.currentCursorHintSlide?.id,
                currentCursorHint: !!this.currentCursorHint,
                slideClasses: slideElement.className,
                cardopened: this.cardopened
            });
            
            // Only require slide to exist and not be opened - cursor hint can be gone
            if (slideStillExists && slideNotOpened && cardNotOpened) {
                if (isHeavySlide) {
                    console.log('Triggering post content IMAGE FLASH for slide:', slideElement.id);
                    this.performPostContentImageFlash(slideElement);
                } else {
                    console.log('Triggering post content CARD FLASH for slide:', slideElement.id);
                    this.performPostContentFlash(slideElement);
                }
            } else {
                console.log('Post content hint skipped - conditions not met for slide:', slideElement.id, {
                    slideExists: slideStillExists,
                    slideNotOpened: slideNotOpened,
                    cardNotOpened: cardNotOpened
                });
            }
        }, hintMidpointDelay);
    }
    
    performPostContentFlash(slideElement) {
        // Quick flash-open of the card to show content preview
        const slideId = slideElement.id;
        
        // Ensure we have the card content to flash
        const cardContent = slideElement.querySelector('.card-content');
        if (!cardContent) {
            console.log('No card content found for flash animation on slide:', slideId);
            return;
        }
        
        console.log('Starting flash animation for slide:', slideId);
        
        // Add flash-hint class to trigger the animation
        slideElement.classList.add('flash-hint');
        
        // Force a reflow to ensure the class is applied
        slideElement.offsetHeight;
        
        // Remove the class after animation completes
        setTimeout(() => {
            if (slideElement && slideElement.parentNode) {
                slideElement.classList.remove('flash-hint');
                console.log('Flash animation completed for slide:', slideId);
                
                // Restart video on video background slides after hint animation
                this.restartVideoOnHintComplete(slideId);
            }
        }, 2100); // Slightly longer than CSS animation duration for safety
    }
    
    performPostContentImageFlash(slideElement) {
        // Flash a screenshot image for heavy slides instead of opening card content
        const slideId = slideElement.id;
        
        // Detect current language and device type
        const language = this.detectLanguage();
        const deviceType = this.detectDeviceType();
        
        // Get the correct screenshot filename
        const screenshotPath = this.getScreenshotPath(slideId, language, deviceType);
        
        if (!screenshotPath) {
            console.log('No screenshot found for slide:', slideId, 'language:', language, 'device:', deviceType);
            return;
        }
        
        console.log('Starting image flash for slide:', slideId, 'screenshot:', screenshotPath);
        
        // Create image flash overlay with inline styles for maximum compatibility
        const imageOverlay = document.createElement('div');
        
        // Detect if mobile for positioning
        const isMobile = window.innerWidth <= 768;
        const backgroundPosition = 'center top'; // Align to top for both desktop and mobile
        
        imageOverlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-image: url(${screenshotPath}) !important;
            background-size: cover !important;
            background-position: ${backgroundPosition} !important;
            background-repeat: no-repeat !important;
            opacity: 0 !important;
            z-index: 9999 !important;
            pointer-events: none !important;
            transition: opacity 0.5s ease-out !important;
        `;
        
        // Add to document body
        document.body.appendChild(imageOverlay);
        
        console.log('Image overlay created with inline styles:', {
            element: imageOverlay,
            backgroundImage: imageOverlay.style.backgroundImage,
            parent: imageOverlay.parentNode,
            computedStyle: window.getComputedStyle(imageOverlay)
        });
        
        // Force a reflow and trigger flash immediately
        imageOverlay.offsetHeight;
        
        // Trigger the flash animation immediately for faster response
        setTimeout(() => {
            imageOverlay.style.opacity = '1';
            console.log('Image flash triggered - opacity set to 1');
            
            // Hold for 1000ms then fade out (1s fade-in, 1s fade-out)
            setTimeout(() => {
                imageOverlay.style.opacity = '0';
                console.log('Image flash fading out');
                
                // Remove after fade completes
                setTimeout(() => {
                    if (imageOverlay && imageOverlay.parentNode) {
                        imageOverlay.parentNode.removeChild(imageOverlay);
                        console.log('Image overlay removed');
                    }
                }, 1000);
            }, 1000);
        }, 50);
        
        // Remove the overlay after animation completes
        setTimeout(() => {
            if (imageOverlay && imageOverlay.parentNode) {
                imageOverlay.parentNode.removeChild(imageOverlay);
                console.log('Image flash completed for slide:', slideId);
                
                // Restart video on video background slides after hint animation
                this.restartVideoOnHintComplete(slideId);
            }
        }, 2100); // Match the CSS animation duration
    }
    
    // Cancel any pending hint timers to prevent hints from appearing on wrong slides
    cancelPendingHints() {
        if (this.pendingCursorHintTimer) {
            clearTimeout(this.pendingCursorHintTimer);
            this.pendingCursorHintTimer = null;
            console.log('Cancelled pending cursor hint timer');
        }
        
        if (this.pendingContentHintTimer) {
            clearTimeout(this.pendingContentHintTimer);
            this.pendingContentHintTimer = null;
            console.log('Cancelled pending content hint timer');
        }
    }
    
    // Restart video on video background slides after hint animation completes
    restartVideoOnHintComplete(slideId) {
        // Check if this is a video background slide
        const videoBackgroundSlides = ['calendario', 'calendar'];
        
        if (videoBackgroundSlides.includes(slideId)) {
            console.log('Restarting video for video background slide:', slideId);
            
            // Find the video element in the slide
            const slideElement = document.getElementById(slideId);
            if (slideElement) {
                const video = slideElement.querySelector('.thefrontvideo');
                if (video) {
                    // Reset video to beginning and play
                    video.currentTime = 0;
                    video.play().then(() => {
                        console.log('Video restarted successfully for slide:', slideId);
                    }).catch(err => {
                        console.log('Could not restart video for slide:', slideId, 'Error:', err);
                    });
                } else {
                    console.log('No video element found in slide:', slideId);
                }
            } else {
                console.log('Slide element not found:', slideId);
            }
        }
    }
    
    detectLanguage() {
        // Detect current site language
        // Check document language first
        const docLang = document.documentElement.lang;
        if (docLang) {
            return docLang.startsWith('es') ? 'es' : 'en';
        }
        
        // Check URL path for language indicators
        const path = window.location.pathname;
        if (path.includes('/es/') || path.includes('/español/') || path.includes('/espanol/')) {
            return 'es';
        }
        
        // Check for Spanish slide names in current context
        const spanishSlides = ['mapa', 'calendario', 'galeria', 'artistas', 'contexto', 'nosotros'];
        const currentSlide = this.slideVisibleId;
        if (spanishSlides.includes(currentSlide)) {
            return 'es';
        }
        
        // Default to English
        return 'en';
    }
    
    detectDeviceType() {
        // Detect if mobile or desktop
        const isMobile = window.innerWidth <= 768 || 
                        /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
        return isMobile ? 'mobiles' : 'desktop';
    }
    
    getScreenshotPath(slideId, language, deviceType) {
        // Map slide IDs to their screenshot filenames
        const screenshotMap = {
            // Map slides (English/Spanish)
            'map': 'map',
            'mapa': 'mapa',
            
            // Calendar slides (English/Spanish)
            'calendar': language === 'es' ? 'calendario' : 'calendar',
            'calendario': 'calendario',
            
            // Gallery slides (English/Spanish) 
            'gallery': language === 'es' ? 'galeria' : 'gallery',
            'galeria': 'galeria'
        };
        
        const screenshotName = screenshotMap[slideId];
        if (!screenshotName) {
            return null;
        }
        
        // Handle the typo in calendar mobile filename
        let filename;
        if (screenshotName === 'calendar' && deviceType === 'mobiles') {
            filename = 'calemdar-post-hint-mobiles.webp'; // Use the typo filename as it exists
        } else {
            filename = `${screenshotName}-post-hint-${deviceType}.webp`;
        }
        
        return `/wp-content/uploads/${filename}`;
    }
    
    checkDirectUrlVisit() {
        // Check if user came from a direct URL that maps to a specific slide
        const currentPath = window.location.pathname;
        const urlHash = window.location.hash;
        
        // URL path to slide ID mapping (same as in UrlVerif method)
        const urlToSlideMap = {
            '/about': 'contexto',
            '/airbnb': 'huespedes', 
            '/art': 'art',
            '/artists': 'artistas',
            '/artistas': 'artistas',
            '/cal': 'calendario',
            '/calendar': 'calendario',
            '/calendario': 'calendario',
            '/chat': 'chat',
            '/context': 'contexto',
            '/contexto': 'contexto',
            '/estac': 'estacionamiento',
            '/eventos': 'eventos',
            '/events': 'eventos',
            '/familiacamp': 'familiacamp',
            '/galeria': 'galeria',
            '/gallery': 'galeria',
            '/guests': 'guests',
            '/guia': 'guia',
            '/guide': 'guia',
            '/huespedes': 'huespedes',
            '/logos': 'logos',
            '/map': 'mapa',
            '/nos': 'nosotros',
            '/nosotros': 'nosotros',
            '/nosotrxs': 'nosotros',
            '/org': 'organizadores',
            '/organiser': 'organizadores',
            '/organisers': 'organizadores',
            '/organizadores': 'organizadores',
            '/organizadxr': 'organizadores',
            '/organizer': 'organizadores',
            '/organizers': 'organizadores',
            '/park': 'estacionamiento',
            '/pro': 'promotores',
            '/promoters': 'promotores',
            '/promotores': 'promotores',
            '/promotorxs': 'promotores',
            '/zipolite': 'zipolite',
            '/tandp': 'eventos'
        };
        
        // Check if current path maps to a specific slide
        const isDirectSlideUrl = currentPath && urlToSlideMap[currentPath];
        
        // Check if there's a hash that would open a card
        const isHashBasedOpen = urlHash && urlHash.length > 1;
        
        const isDirect = isDirectSlideUrl || isHashBasedOpen;
        
        if (isDirect) {
            console.log('Direct URL visit detected - post content hints disabled');
            console.log('Path:', currentPath, 'Hash:', urlHash);
        }
        
        return isDirect;
    }
    
    // Force hide any current cursor hint
    hideCurrentCursorHint() {
        if (this.currentCursorHint && this.currentCursorHint.parentNode) {
            this.currentCursorHint.parentNode.removeChild(this.currentCursorHint);
            this.currentCursorHint = null;
            this.currentCursorHintSlide = null;
        }
        if (this.cleanupCurrentHint) {
            this.cleanupCurrentHint();
            this.cleanupCurrentHint = null;
        }
    }
    
    // Emergency method to remove all cursor hints from the page
    forceRemoveAllCursorHints() {
        const allHints = document.querySelectorAll('.cursor-hint');
        allHints.forEach(hint => {
            if (hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
        });
        // Clear tracking variables
        this.currentCursorHint = null;
        this.currentCursorHintSlide = null;
        this.cleanupCurrentHint = null;
        console.log('Force removed all cursor hints from page');
    }
    
    // Show cursor hint when slide comes into view during scrolling
    // Now acts as the "ready" signal after gif loads
    initScrollHints() {
        console.log('Initializing cursor hints - site is ready for interaction');
        
        // Immediate setup since we're now the "ready" signal
            const slides = document.querySelectorAll('.slide_10');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
                        const slideId = entry.target.id;
                        // Only show hint if site is fully loaded, slide is not opened, not during programmatic scrolling, and not during user scrolling
                        if (this.isFullyLoaded && !entry.target.classList.contains('opened') && !this.scrolling && !this.isUserScrolling) {
                            this.showCursorHint(entry.target);
                        }
                    }
                });
            }, { 
                threshold: 0.6,
                rootMargin: '-10% 0px -10% 0px' // Only trigger when slide is well within viewport
            });
            
            slides.forEach(slide => {
                observer.observe(slide);
            });
        
        // Show immediate cursor hint on currently visible slide as "ready" signal
        setTimeout(() => {
            const currentSlide = document.getElementById(this.slideVisibleId);
            if (currentSlide && !currentSlide.classList.contains('opened')) {
                console.log('Showing initial cursor hint as ready signal');
                this.showCursorHint(currentSlide);
            }
        }, 1100); // Brief delay to ensure everything is set up
    }
    
    // Debug function to test cursor hints manually
    testCursorHintDebug() {
        console.log('=== Cursor Hint Debug ===');
        const slides = document.querySelectorAll('.slide_10');
        console.log('Found slides:', slides.length);
        console.log('Slides with content hints shown this session:', Array.from(this.slideHintShown));
        console.log('Slides with cursor hints shown this session:', Array.from(this.cursorHintShown));
        
        slides.forEach((slide, index) => {
            const hasShownContentHint = this.slideHintShown.has(slide.id);
            const hasShownCursorHint = this.cursorHintShown.has(slide.id);
            console.log(`Slide ${index}: ID="${slide.id}", Classes="${slide.className}", Content hint shown: ${hasShownContentHint}, Cursor hint shown: ${hasShownCursorHint}`);
        });
        
        if (slides.length > 0) {
            console.log('Testing cursor hint on first slide:', slides[0].id);
            this.showCursorHint(slides[0]);
        } else {
            console.log('No slides found! Checking for alternative selectors...');
            const altSlides = document.querySelectorAll('[class*="slide"]');
            console.log('Alternative slides found:', altSlides.length);
            altSlides.forEach((slide, index) => {
                console.log(`Alt slide ${index}: ID="${slide.id}", Classes="${slide.className}"`);
            });
        }
        
        // Also check current page info
        console.log('Current URL:', window.location.href);
        console.log('Document language:', document.documentElement.lang);
        console.log('Page path:', window.location.pathname);
        console.log('Menu active:', this.slider?.classList.contains('menuactive'));
        console.log('Card opened:', this.cardopened);
        console.log('Current cursor hint:', this.currentCursorHint);
    }
    
    // Quick test function to show cursor hint on current visible slide
    testCursorHintOnCurrentSlide() {
        const visibleSlide = document.getElementById(this.slideVisibleId);
        if (visibleSlide && !visibleSlide.classList.contains('opened')) {
            console.log('Testing cursor hint on current visible slide:', this.slideVisibleId);
            this.showCursorHint(visibleSlide);
        } else if (visibleSlide && visibleSlide.classList.contains('opened')) {
            console.log('Current slide is opened, cursor hints are hidden by CSS');
        } else {
            console.log('No visible slide found');
        }
    }
    
    // Debug function to test post content hint functionality
    testPostContentHint() {
        console.log('=== Testing Post Content Hint ===');
        console.log('First encounters so far:', Array.from(this.slideFirstEncounters));
        console.log('Max hint slides:', this.maxHintSlides);
        console.log('Is direct URL visit:', this.isDirectUrlVisit);
        
        const visibleSlide = document.getElementById(this.slideVisibleId);
        if (visibleSlide) {
            const heavySlides = ['mapa', 'map', 'calendar', 'calendario', 'gallery', 'galeria'];
            const isHeavySlide = heavySlides.includes(visibleSlide.id);
            
            console.log('Testing flash hint on:', visibleSlide.id);
            console.log('Is heavy slide (will use image flash):', isHeavySlide);
            console.log('Has card content:', !!visibleSlide.querySelector('.card-content'));
            console.log('Is opened:', visibleSlide.classList.contains('opened'));
            console.log('Card opened state:', this.cardopened);
            
            if (isHeavySlide) {
                console.log('Testing IMAGE FLASH for heavy slide:', visibleSlide.id);
                this.performPostContentImageFlash(visibleSlide);
            } else {
                console.log('Testing CARD FLASH for normal slide:', visibleSlide.id);
                this.performPostContentFlash(visibleSlide);
            }
        } else {
            console.log('No visible slide to test on');
        }
    }
    
    // Reset session hint tracking for testing
    resetSessionHints() {
        this.slideHintShown.clear();
        this.cursorHintShown.clear();
        console.log('Session hint tracking reset - all slides will show hints again');
    }
    
    // Toggle direct URL visit detection for testing
    toggleDirectUrlVisit() {
        this.isDirectUrlVisit = !this.isDirectUrlVisit;
        console.log('Direct URL visit detection:', this.isDirectUrlVisit ? 'ENABLED (hints disabled)' : 'DISABLED (hints enabled)');
        return this.isDirectUrlVisit;
    }
    
    // Test image flash functionality specifically
    testImageFlash() {
        console.log('=== Testing Image Flash Functionality ===');
        const visibleSlide = document.getElementById(this.slideVisibleId);
        if (visibleSlide) {
            const language = this.detectLanguage();
            const deviceType = this.detectDeviceType();
            const screenshotPath = this.getScreenshotPath(visibleSlide.id, language, deviceType);
            
            console.log('Current slide:', visibleSlide.id);
            console.log('Detected language:', language);
            console.log('Detected device type:', deviceType);
            console.log('Screenshot path:', screenshotPath);
            
            if (screenshotPath) {
                console.log('Triggering image flash test...');
                this.performPostContentImageFlash(visibleSlide);
            } else {
                console.log('No screenshot available for this slide');
            }
        } else {
            console.log('No visible slide to test on');
        }
    }
    
    // Simple test overlay for debugging visibility issues
    testSimpleOverlay() {
        console.log('=== Testing Simple Overlay ===');
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(255, 0, 0, 0.8);
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(overlay);
        
        console.log('Simple red overlay added for 2 seconds');
        console.log('Overlay element:', overlay);
        console.log('Overlay parent:', overlay.parentNode);
        console.log('Overlay computed style:', window.getComputedStyle(overlay));
        
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                console.log('Simple overlay removed');
            }
        }, 2000);
    }
    
    // Force test cursor hint with post content hint on current slide
    testFullCursorHintSequence() {
        const visibleSlide = document.getElementById(this.slideVisibleId);
        if (visibleSlide) {
            console.log('=== Testing Full Cursor Hint Sequence ===');
            console.log('Slide:', visibleSlide.id);
            
            // Temporarily reset encounters to ensure this slide gets the hint
            const originalEncounters = new Set(this.slideFirstEncounters);
            this.slideFirstEncounters.delete(visibleSlide.id);
            
            // Force show cursor hint which should trigger post content hint
            this.showCursorHint(visibleSlide);
            
            // Restore original encounters after a delay
            setTimeout(() => {
                this.slideFirstEncounters = originalEncounters;
                console.log('Encounters restored');
            }, 2000);
        } else {
            console.log('No visible slide to test on');
        }
    }
    
    // Force test image flash during cursor hint animation
    testImageFlashDuringCursorHint() {
        const visibleSlide = document.getElementById(this.slideVisibleId);
        if (visibleSlide) {
            console.log('=== Testing Image Flash During Cursor Hint ===');
            console.log('Slide:', visibleSlide.id);
            
            // Check if it's a heavy slide
            const heavySlides = ['mapa', 'map', 'calendar', 'calendario', 'gallery', 'galeria'];
            const isHeavySlide = heavySlides.includes(visibleSlide.id);
            
            if (isHeavySlide) {
                console.log('Heavy slide detected - will test image flash');
                
                // Temporarily reset encounters and disable direct URL detection
                const originalEncounters = new Set(this.slideFirstEncounters);
                const originalDirectUrl = this.isDirectUrlVisit;
                
                this.slideFirstEncounters.delete(visibleSlide.id);
                this.isDirectUrlVisit = false;
                
                // Force show cursor hint which should trigger image flash
                this.showCursorHint(visibleSlide);
                
                // Restore original settings after a delay
                setTimeout(() => {
                    this.slideFirstEncounters = originalEncounters;
                    this.isDirectUrlVisit = originalDirectUrl;
                    console.log('Settings restored');
                }, 3000);
            } else {
                console.log('Not a heavy slide - will test card flash instead');
                this.testFullCursorHintSequence();
            }
        } else {
            console.log('No visible slide to test on');
        }
    }
    
    // Force test image flash directly without cursor hint
    forceTestImageFlash() {
        const visibleSlide = document.getElementById(this.slideVisibleId);
        if (visibleSlide) {
            console.log('=== Force Testing Image Flash Directly ===');
            console.log('Slide:', visibleSlide.id);
            
            // Check if it's a heavy slide
            const heavySlides = ['mapa', 'map', 'calendar', 'calendario', 'gallery', 'galeria'];
            const isHeavySlide = heavySlides.includes(visibleSlide.id);
            
            if (isHeavySlide) {
                console.log('Heavy slide detected - forcing image flash directly');
                this.performPostContentImageFlash(visibleSlide);
            } else {
                console.log('Not a heavy slide - forcing card flash directly');
                this.performPostContentFlash(visibleSlide);
            }
        } else {
            console.log('No visible slide to test on');
        }
    }
    
    // Force reinitialize scroll hints (for debugging)
    reinitScrollHints() {
        console.log('Force reinitializing scroll hints...');
        this.initScrollHints();
    }
    
    closeCardsE(event) {
        event.stopPropagation();
        this.closeCards();
    }
    forceCloseCards(){
        // Force close any open card immediately without animation to ensure clean state
        if(this.targetSlide && this.targetSlide !== 'none') {
            console.log('FORCE closing card', 'slideid', this.targetSlide);
            
            const closingSlideId = this.targetSlide; // Store the slide being closed
            
            // Hide any active cursor hint when closing cards
            this.hideCurrentCursorHint();
            
            // Handle gallery cleanup
            if(this.targetSlide==='gallery'||this.targetSlide==='galeria'){
                this.removeVideosFromGallery();
            }
            
            const slideopened = document.getElementById(this.targetSlide);
            if(slideopened) {
                // Immediately remove all card-related classes and styles
                slideopened.classList.remove('opened', 'closing');
                slideopened.classList.add('closed');
                
                // Remove body classes
                this.body.classList.remove(this.targetSlide);
                this.body.classList.remove('bodycardopened');
                
                // Clean up event listeners
                const cardHeader = slideopened.querySelector('.card-header');
                if(cardHeader && this.eventHandlers[this.targetSlide+'header']) {
                    cardHeader.removeEventListener('click', this.eventHandlers[this.targetSlide+'header']);
                }
                
                // Re-add click event listeners to restore card clickability
                // This ensures the card can be clicked again after being force-closed
                const zoneClick = slideopened.querySelector('.slide_10_scroll');
                if(zoneClick) {
                    this.eventHandlers[closingSlideId+'scroll'] = this.openCard.bind(this, { divId: closingSlideId });
                    zoneClick.addEventListener('click', this.eventHandlers[closingSlideId+'scroll'], false);
                }
                
                const zoneBg = slideopened.querySelector('.slide_10_bg');
                if (zoneBg) {
                    this.eventHandlers[closingSlideId+'bg'] = this.openCard.bind(this, { divId: closingSlideId });
                    zoneBg.addEventListener('click', this.eventHandlers[closingSlideId+'bg'], false);
                }
            }
            
            // Reset state variables
            this.targetSlide = 'none';
            this.cardopened = false;
            
            // Resume background videos
            this.theFrontVideo.forEach(function(el) {
                el.play();
            });
            
            console.log('FORCE close completed for:', closingSlideId);
        }
    }
    
    closeCards(){
        console.log('START closing card', 'slideid', this.targetSlide, 'cardopened', this.cardopened);
        
        // Hide any active cursor hint when closing cards
        this.hideCurrentCursorHint();
        
        //console.log(this.targetSlide);
        if(this.targetSlide==='gallery'||this.targetSlide==='galeria'){
            this.removeVideosFromGallery();
        }
        
        const slideopened = document.getElementById(this.targetSlide);
        
        // Add closing class to trigger fade-out animation without removing opened class yet
        slideopened.classList.add('closing');
        
        // Wait for fade-out animation to complete (0.25s) before completing the close
        setTimeout(() => {
            // Remove opened class only after fade-out is complete to prevent scroll jump
            slideopened.classList.remove('opened');
            // Complete the closing after fade-out animation
            this.body.classList.remove(this.targetSlide);
            this.body.classList.remove('bodycardopened');
            slideopened.classList.add('closed');
            slideopened.classList.remove('closing');
            
            // enleve lèvenement a header
            const cardHeader = slideopened.querySelector('.card-header');
            cardHeader.removeEventListener('click', this.eventHandlers[this.targetSlide+'header']);
            // remet l'événement
            const zoneClick = slideopened.querySelector('.slide_10_scroll');
            this.eventHandlers[this.targetSlide+'scroll'] = this.openCard.bind(this, { divId: this.targetSlide });
            zoneClick.addEventListener('click', this.eventHandlers[this.targetSlide+'scroll'], false);
            
            // Also re-add slide_10_bg click event listener
            const zoneBg = slideopened.querySelector('.slide_10_bg');
            if (zoneBg) {
                this.eventHandlers[this.targetSlide+'bg'] = this.openCard.bind(this, { divId: this.targetSlide });
                zoneBg.addEventListener('click', this.eventHandlers[this.targetSlide+'bg'], false);
            }
            this.targetSlide = 'none';
            this.cardopened = false;
            // Resume background videos when closing cards
            this.theFrontVideo.forEach(function(el) {
                console.log(el);
                el.play();
            });
            //this.theFrontVideo.play();
            console.log('END closing card', 'slideid', this.targetSlide, 'cardopened', this.cardopened);
        }, 250); // Wait 250ms for fade-out animation to complete
    }
    resetCardScrollPosition(slideId) {
        console.log('Resetting scroll position for card:', slideId);
        
        // Get the opened slide container
        const slideContainer = document.getElementById(slideId);
        if (!slideContainer) return;
        
        // Simple and efficient: Reset all elements with scrolling capability
        const allElements = slideContainer.querySelectorAll('*');
        
        // Reset the container itself first
        slideContainer.scrollTop = 0;
        slideContainer.scrollLeft = 0;
        
        // Reset all child elements that might have scroll
        allElements.forEach(el => {
            // Only reset if element actually has scroll position to avoid unnecessary DOM writes
            if (el.scrollTop > 0) el.scrollTop = 0;
            if (el.scrollLeft > 0) el.scrollLeft = 0;
        });
        
        console.log('Card scroll position reset completed for:', slideId);
    }
    onMenuItemClick(event) {
        const target = event.currentTarget;
        const tabId = target.getAttribute('data-tab');
        this.tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = this.container.querySelector(`#${tabId}`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    initScrollEvent(){
      this.slider.addEventListener("scroll", (event) => {
		//console.log("------ SCROLLING ----")
        
        // Mark as user scrolling and clear any existing timer
        this.isUserScrolling = true;
        if (this.scrollTimer) {
            clearTimeout(this.scrollTimer);
        }
        
        // Cancel any pending hints when user starts scrolling
        this.cancelPendingHints();
        
        // Set a timer to detect when scrolling stops
        this.scrollTimer = setTimeout(() => {
            this.isUserScrolling = false;
            // Only show hint for the final destination slide after scrolling stops
            const currentSlide = document.getElementById(this.slideVisibleId);
            if (currentSlide && !currentSlide.classList.contains('opened') && !this.scrolling) {
                setTimeout(() => {
                    this.showCursorHint(currentSlide);
                }, 200); // Small delay to ensure we're at the final destination
            }
        }, 300); // Wait 300ms after scrolling stops before showing hints
        
        if(this.cardopened === true && this.scrolling === false && !document.fullscreenElement){
            let divcardopened=document.getElementById(this.targetSlide)
            var topLen = divcardopened.getBoundingClientRect().top;
           var heightScreen = window.innerHeight
           if ((topLen > heightScreen/2)||(topLen < (-heightScreen/2))){
            // Use forceCloseCards for immediate cleanup when scrolling away from an open card
            // This prevents timing issues when user immediately tries to open the same card again
            this.forceCloseCards();
          }
        }
        this.getVisibleSlideInfo();
      });
    }
    initEscapeButton(){
      document.onkeydown = function(evt) {
        evt = evt || window.event;
        var isEscape = false;
        if ("key" in evt) {
            isEscape = (evt.key === "Escape" || evt.key === "Esc");
        } else {
            isEscape = (evt.keyCode === 27);
        }
        if (isEscape) {
		  let currentSlide = this.targetSlide
		  if (currentSlide == "eventos" || currentSlide == "events"){
			  let activeCard = document.getElementsByClassName('eventcard eventon_events_list show')[0];
			  if (activeCard) {
				  let closeButton = activeCard.getElementsByClassName('evolb_close_btn')[0]
                  closeButton.click()
			      return
			  }
		  }
			  
          if (!document.fullscreenElement) {
            this.forceCloseCards();
          }
        }
      }.bind(this);
    }
    empecherDefilementSurChangementOrientation() {
        const slider = document.getElementById('slides');
        const gererChangementOrientation = () => {
            // Désactiver temporairement le défilement pour #slider
            if(this.targetSlide!=='none'){
                const slideData = {
                    post: 'dontknow',
                    divId: this.targetSlide,
                    openTheCard : true
                };
            };
            slider.style.overflow = 'hidden';
            this.scrolling = true;
            // Bloquer le défilement tactile pendant le changement d'orientation
            document.addEventListener('touchmove', bloqueDeplacement, { passive: false });
            // Réactiver le défilement après un court délai
            
            setTimeout(() => {
                slider.style.overflow = '';
                this.scrolling= false;
                document.removeEventListener('touchmove', bloqueDeplacement);
                if(this.targetSlide!=='none'){
                    this.gotoSlide(slideData);
                }
            }, 500); // Ajustez la durée selon vos besoins
        };
        function bloqueDeplacement(event) {
            event.preventDefault();
        }
        window.addEventListener('orientationchange', gererChangementOrientation);
    }
    initArrowKeyNavigation() {
        document.addEventListener('keydown', (event) => {
            if (event.key === "ArrowUp") {
                if (this.slideVisibleIndex > 0) {
                    let previousSlideIndex = this.slideVisibleIndex - 1;
                    let previousSlideId = this.slideIndexMap[previousSlideIndex].id;
                    console.log('Navigating to previous slide:', previousSlideId);
                    // Vous pouvez ajouter la logique pour naviguer à la diapositive précédente ici.
                    this.gotoSlide({ post: 'dontknow', divId: previousSlideId, openTheCard: false });
                }
            } else if (event.key === "ArrowDown") {
                if (this.slideVisibleIndex < this.slides.length - 1) {
                    let nextSlideIndex = this.slideVisibleIndex + 1;
                    let nextSlideId = this.slideIndexMap[nextSlideIndex].id;
                    console.log('Navigating to next slide:', nextSlideId);
                    // Vous pouvez ajouter la logique pour naviguer à la diapositive suivante ici.
                    this.gotoSlide({ post: 'dontknow', divId: nextSlideId, openTheCard: false });
                }
            }
            else if (event.key === "Enter") {
                if (this.slideVisibleId) {
                    console.log('Opening visible slide:', this.slideVisibleId);
                    this.gotoSlide({ post: 'dontknow', divId: this.slideVisibleId, openTheCard: true });
                } else {
                    console.log('No slide is fully visible.');
                }
            }
        });
    }
    // Map interactions moved to individual Map/Mapa post content for better control








    initializeCompactCalendarNav() {
        // Implementation of initializeCompactCalendarNav method
        console.log('Compact calendar navigation initialized for eventos/events section');
        
        // Detect language for proper month handling
        const isEnglish = document.documentElement.lang === "en-US";
        
        // Define month patterns for both languages
        const spanishMonths = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const englishMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthPattern = isEnglish ? englishMonths : spanishMonths;
        const monthRegex = new RegExp(`^(${monthPattern.join('|')})$`, 'i');
        
        // Universal year detection regex (instead of hardcoded 2024-2027)
        const YEAR_RE = /^\d{4}$/;
        
        // Language-aware month names for navigation logic
        const januaryName = isEnglish ? 'JAN' : 'ENE';
        const decemberName = isEnglish ? 'DEC' : 'DIC';
        const defaultMonth = isEnglish ? 'MAY' : 'MAY'; // MAY is same in both languages
        
        // Inject a minimal CSS rule once to ensure no competing animations leak in
        (function ensureCalendarRevealCSS(){
            if (document.getElementById('calendar-reveal-css')) return;
            const css = document.createElement('style');
            css.id = 'calendar-reveal-css';
            css.textContent = `
                /* Force clean state during our manual reveal */
                .ajde_evcal_calendar.calendar-reveal-pending .eventon_events_list {
                    display: block !important;
                    overflow: hidden;
                    opacity: 0;
                }
            `;
            document.head.appendChild(css);
        })();
        
        // Ensure there is a visible loader during updating: prefer EventON loader, else create a custom bar
        function ensureCalendarProgressEl(cal) {
            // Try built-in loader inside calendar header
            const header = cal.querySelector('.calendar_header');
            if (!header) return null;

            let builtin = header.querySelector('.evo_loader_bar, .evcal_loader_bar');
            if (builtin) {
                // Header must be positioned for absolute children
                if (getComputedStyle(header).position === 'static') header.style.position = 'relative';
                return { type: 'builtin', el: builtin };
            }

            // Create lightweight custom loader if not present
            let custom = header.querySelector('.calendar-progress');
            if (!custom) {
                custom = document.createElement('div');
                custom.className = 'calendar-progress';
                if (getComputedStyle(header).position === 'static') header.style.position = 'relative';
                header.appendChild(custom);
            }
            return { type: 'custom', el: custom };
        }

        // Create a helper to hide the list immediately (before reveal)
        function prepareHiddenList(cal){
            // Ensure we have a list
            const list = cal?.querySelector('.eventon_events_list');
            if (!list) return null;

            console.log('Preparing hidden list for animation...');

            // Check if list is already hidden to avoid double-hiding
            const isAlreadyHidden = list.style.display === 'none' || 
                                   getComputedStyle(list).display === 'none' ||
                                   list.offsetHeight === 0;

            if (isAlreadyHidden) {
                console.log('List already hidden, skipping prepareHiddenList');
                cal.classList.add('calendar-reveal-pending');
                return list;
            }

            // Mark calendar as pending reveal and hide the list
            cal.classList.add('calendar-reveal-pending');

            // jQuery-first: hard hide for a clean slideDown start
            try {
                const $ = window.jQuery;
                if ($) { 
                    $(list).stop(true, true).hide(); 
                    console.log('List hidden with jQuery');
                }
                else {
                    // Vanilla fallback
                    list.style.display = 'none';
                    list.style.opacity = '0';
                    list.style.height = '0px';
                    console.log('List hidden with vanilla CSS');
                }
            } catch(e){ 
                console.warn('Failed to hide list:', e);
            }

            return list;
        }

        // Create a single-use reveal helper (called after content is stable)
        function revealListOnce(cal){
            const list = cal?.querySelector('.eventon_events_list');
            if (!list) return;

            // Prevent multiple reveals per update cycle
            if (cal.getAttribute('data-revealed') === '1') return;
            cal.setAttribute('data-revealed', '1');

            console.log('Revealing calendar list...');

            // Safety cleanup function to ensure list is always visible
            const ensureListVisible = () => {
                if (list) {
                    list.style.display = '';
                    list.style.opacity = '';
                    list.style.height = '';
                    list.style.overflow = '';
                    list.style.transition = '';
                }
                cal.classList.remove('calendar-reveal-pending');
                console.log('Calendar list revealed (safety cleanup)');
            };

            // Safety timeout to ensure list becomes visible even if animation fails
            const safetyTimeout = setTimeout(ensureListVisible, 500);

            // jQuery slideDown preferred
            try {
                const $ = window.jQuery;
                if ($) {
                    $(list).stop(true, true).hide().slideDown(260, 'swing', function(){
                        clearTimeout(safetyTimeout);
                        // Clean up after reveal
                        cal.classList.remove('calendar-reveal-pending');
                        list.style.opacity = '';
                        list.style.height  = '';
                        console.log('Calendar list revealed (jQuery)');
                    });
                    return;
                }
            } catch(e){ 
                console.warn('jQuery slideDown failed, using vanilla fallback:', e);
            }

            // Vanilla fallback: height + opacity transition
            list.style.display = 'block';
            list.style.overflow = 'hidden';
            list.style.opacity = '0';
            const finalH = list.scrollHeight + 'px';
            list.style.height = '0px';
            list.style.transition = 'height 260ms ease, opacity 260ms ease';

            requestAnimationFrame(() => {
                list.style.opacity = '1';
                list.style.height  = finalH;
                setTimeout(() => {
                    clearTimeout(safetyTimeout);
                    list.style.transition = '';
                    list.style.height = '';
                    list.style.opacity = '';
                    list.style.overflow = '';
                    cal.classList.remove('calendar-reveal-pending');
                    console.log('Calendar list revealed (vanilla)');
                }, 280);
            });
        }

        // Begin silent update: lock list height and set data-updating flag
        function startCalendarSilentUpdate() {
            const cal = document.querySelector('.ajde_evcal_calendar');
            if (!cal) return null;

            const list = cal.querySelector('.eventon_events_list') || cal;
            const h = list.offsetHeight;
            list.style.minHeight = h + 'px'; // Prevent layout collapse while grids are hidden

            // NEW: reset reveal flag for this update cycle
            cal.removeAttribute('data-revealed');

            // NEW: prepare a clean hidden first frame so only the slide-down is seen later
            prepareHiddenList(cal);

            const loaderRef = ensureCalendarProgressEl(cal);
            cal.setAttribute('data-updating', '1');

            // Safety timeout to avoid stuck state
            const killer = setTimeout(() => endCalendarSilentUpdate({ cal, list, loaderRef }), 7000);
            console.log('Calendar silent update started with loader');
            return { cal, list, loaderRef, killer };
        }

        // End silent update: remove flags and unlock height
        function endCalendarSilentUpdate(state) {
            const cal = state?.cal || document.querySelector('.ajde_evcal_calendar');
            const list = state?.list || cal?.querySelector('.eventon_events_list');
            if (!cal) return;

            // Keep minHeight until after we trigger reveal
            if (list) {
                // Do not force show here; let revealListOnce animate it
            }

            // Reveal with a single animation
            revealListOnce(cal);

            // Unlock container after starting the reveal
            if (list) list.style.minHeight = '';

            cal.removeAttribute('data-updating');

            // Let plugin regain control over built-in loader if we touched inline styles
            const lr = state?.loaderRef;
            if (lr && lr.type === 'builtin') {
                lr.el.style.display = '';
                lr.el.style.opacity = '';
                lr.el.style.visibility = '';
            }

            if (state?.killer) clearTimeout(state.killer);
            console.log('Calendar silent update ended');
        }
        
        // Immediately hide original navigation to prevent glitch
        const hideOriginalNavigation = () => {
            const calendar = document.querySelector('.ajde_evcal_calendar');
            if (calendar) {
                // Hide all year and month links immediately
                const allLinks = Array.from(calendar.querySelectorAll('a'));
                allLinks.forEach(link => {
                    const text = link.textContent.trim();
                    if (YEAR_RE.test(text) || monthRegex.test(text)) {
                        link.style.display = 'none';
                        if (link.parentElement && link.parentElement.tagName !== 'BODY') {
                            link.parentElement.style.display = 'none';
                        }
                    }
                });
                
                // Hide the entire evo_j_dates container immediately if it exists
                const calendarHeader = calendar.querySelector('.calendar_header');
                if (calendarHeader) {
                    const evoJDates = calendarHeader.querySelector('.evo_j_dates');
                    if (evoJDates) {
                        evoJDates.style.display = 'none';
                    }
                }
            }
        };
        
        // Try to hide original navigation immediately
        hideOriginalNavigation();
        
        // Function to create compact navigation
        const createCompactNav = () => {
            // Check if already processed
            if (document.querySelector('.compact-calendar-nav')) {
                console.log('Compact navigation already exists');
                return true;
            }
            
            // Find the calendar container
            const calendar = document.querySelector('.ajde_evcal_calendar');
            if (!calendar) {
                console.log('Calendar not found');
                return false;
            }
            
            // Ensure original navigation is hidden (in case it wasn't caught earlier)
            hideOriginalNavigation();
            
            // Find all year and month links in the entire calendar header area
            const allLinks = Array.from(calendar.querySelectorAll('a'));
            
            // Separate years and months
            const years = [];
            const months = [];
            let currentYear = null;
            let currentMonth = null;
            
            allLinks.forEach(link => {
                const text = link.textContent.trim();
                // Check if it's a year (4 digits)
                if (YEAR_RE.test(text)) {
                    years.push(link);
                    if (link.classList.contains('current')) {
                        currentYear = link;
                    }
                    // Hide the year link
                    link.style.display = 'none';
                    // Also hide any parent span or container
                    if (link.parentElement && link.parentElement.tagName !== 'BODY') {
                        link.parentElement.style.display = 'none';
                    }
                } else if (monthRegex.test(text)) {
                    months.push(link);
                    if (link.classList.contains('current')) {
                        currentMonth = link;
                    }
                    // Hide the month link
                    link.style.display = 'none';
                    // Also hide any parent span or container
                    if (link.parentElement && link.parentElement.tagName !== 'BODY') {
                        link.parentElement.style.display = 'none';
                    }
                }
            });
            
            console.log('Years found:', years.map(y => y.textContent).join(', '));
            console.log('Months found:', months.map(m => m.textContent).join(', '));
            console.log('Current year:', currentYear?.textContent || 'none');
            console.log('Current month:', currentMonth?.textContent || 'none');
            
            if (years.length === 0 || months.length === 0) {
                console.log('Not enough date elements found');
                console.log('Available months:', months.length, 'Available years:', years.length);
                return false;
            }
            
            // Default to 2025 and MAY if no current selection
            if (!currentYear) {
                currentYear = years.find(y => y.textContent === '2025') || years[0];
            }
            if (!currentMonth) {
                currentMonth = months.find(m => m.textContent.toUpperCase() === defaultMonth) || months[4]; // MAY is typically at index 4
            }
            
            // Find where to insert the compact navigation
            const calendarHeader = calendar.querySelector('.calendar_header');
            if (!calendarHeader) {
                console.log('Calendar header not found');
                return false;
            }
            
            // Detect mobile device for positioning
            const isMobileDevice = (window.innerWidth <= 768 || 
                           navigator.maxTouchPoints > 0 || 
                           navigator.msMaxTouchPoints > 0 ||
                           ('ontouchstart' in window) || 
                           (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
                           (navigator.userAgent.toLowerCase().indexOf('android') !== -1));
            
            // Ensure calendar header has positioning context for mobile absolute positioning
            if (isMobileDevice) {
                calendarHeader.style.position = 'relative';
            }
            
            // Create the compact navigation container
            const compactNav = document.createElement('div');
            compactNav.className = 'compact-calendar-nav';
            
            // Apply different styling based on device type
            if (isMobileDevice) {
                compactNav.style.cssText = 'display: flex; align-items: center; padding: 7.8px 0; font-family: inherit; color: #f5f5f5; position: absolute; left: -5px; bottom: 0px; z-index: 10; overflow: visible;';
            } else {
                compactNav.style.cssText = 'display: flex; align-items: center; padding: 7.8px 0; font-family: inherit; color: #f5f5f5; margin-left: -9px;';
            }
            
            // Year navigation elements
            const yearLeft = document.createElement('div');
            yearLeft.style.backgroundImage = 'url(https://camp.mx/img/caret28.svg)';
            yearLeft.style.backgroundRepeat = 'no-repeat';
            yearLeft.style.backgroundSize = '19px';
            yearLeft.style.content = '';
            const yearCaretSize = isMobileDevice ? '19px' : '19px';
            yearLeft.style.cssText = `background-image: url(https://camp.mx/img/caret28.svg); background-repeat: no-repeat; background-size: ${yearCaretSize}; content: ''; display: inline-block; width: ${yearCaretSize}; height: ${yearCaretSize}; cursor: pointer; transform: rotate(90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: 3px; top: 4px; transition: transform 0.5s ease; vertical-align: top;`;
            yearLeft.onmouseover = () => yearLeft.style.opacity = '1';
            yearLeft.onmouseout = () => yearLeft.style.opacity = '1';
            
            const yearText = document.createElement('span');
            yearText.textContent = currentYear.textContent;
            yearText.style.cssText = 'margin: 0 8px; min-width: 60px; text-align: center; font-weight: 500; font-size: 24px; background-color: rgba(245, 245, 245, 0.95); color: rgba(0, 0, 0, 0.85); padding: 3px 8px 4px 8px;';
            
            const yearRight = document.createElement('div');
            yearRight.style.cssText = `background-image: url(https://camp.mx/img/caret28.svg); background-repeat: no-repeat; background-size: ${yearCaretSize}; content: ''; display: inline-block; width: ${yearCaretSize}; height: ${yearCaretSize}; cursor: pointer; transform: rotate(-90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: -2px; top: 4.7px; transition: transform 0.5s ease; vertical-align: top;`;
            yearRight.onmouseover = () => yearRight.style.opacity = '1';
            yearRight.onmouseout = () => yearRight.style.opacity = '1';
            
            // Month navigation elements  
            const monthLeft = document.createElement('div');
            // Use the same mobile detection variable from above
            const monthLeftMargin = isMobileDevice ? '8px' : '20px';
            monthLeft.style.cssText = `background-image: url(https://camp.mx/img/caret28.svg); background-repeat: no-repeat; background-size: ${yearCaretSize}; content: ''; display: inline-block; width: ${yearCaretSize}; height: ${yearCaretSize}; cursor: pointer; transform: rotate(90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; margin-left: ${monthLeftMargin}; flex-shrink: 0; position: relative; left: 2.6px; top: 4px; transition: transform 0.5s ease; vertical-align: top;`;
            monthLeft.onmouseover = () => monthLeft.style.opacity = '1';
            monthLeft.onmouseout = () => monthLeft.style.opacity = '1';
            
            const monthText = document.createElement('span');
            monthText.textContent = currentMonth.textContent;
            monthText.style.cssText = 'margin: 0 8px; min-width: 60px; text-align: center; font-weight: 500; text-transform: uppercase; font-size: 24px; background-color: rgba(245, 245, 245, 0.95); color: rgba(0, 0, 0, 0.85); padding: 3px 8px 4px 8px;';
            
            const monthRight = document.createElement('div');
            monthRight.style.cssText = `background-image: url(https://camp.mx/img/caret28.svg); background-repeat: no-repeat; background-size: ${yearCaretSize}; content: ''; display: inline-block; width: ${yearCaretSize}; height: ${yearCaretSize}; cursor: pointer; transform: rotate(-90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: -2px; top: 4.7px; transition: transform 0.5s ease; vertical-align: top;`;
            monthRight.onmouseover = () => monthRight.style.opacity = '1';
            monthRight.onmouseout = () => monthRight.style.opacity = '1';
            
            // Add onmouseover-detail class to carets for clickable emphatic icons
            const caretElements = [yearLeft, yearRight, monthLeft, monthRight];
            caretElements.forEach(caret => {
                caret.classList.add('onmouseover-detail');
            });
            
            // Add all elements to the container
            compactNav.appendChild(yearLeft);
            compactNav.appendChild(yearText);
            compactNav.appendChild(yearRight);
            compactNav.appendChild(monthLeft);
            compactNav.appendChild(monthText);
            compactNav.appendChild(monthRight);
            
            // Insert at the beginning of calendar header
            calendarHeader.insertBefore(compactNav, calendarHeader.firstChild);
            
            // Add resize event listener to handle orientation changes
            const updateMobilePositioning = () => {
                const isCurrentlyMobile = (window.innerWidth <= 768 || 
                               navigator.maxTouchPoints > 0 || 
                               navigator.msMaxTouchPoints > 0 ||
                               ('ontouchstart' in window) || 
                               (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
                               (navigator.userAgent.toLowerCase().indexOf('android') !== -1));
                
                // Use different caret sources and sizes based on device type
                const currentCaretSize = isCurrentlyMobile ? '19px' : '19px';
                const currentCaretSrc = isCurrentlyMobile ? 'https://camp.mx/img/caret28.svg' : 'https://camp.mx/img/caret28.svg';
                const currentMonthLeftMargin = isCurrentlyMobile ? '8px' : '20px';
                
                // Update year left caret with h2::after-style properties
                yearLeft.style.cssText = `background-image: url(${currentCaretSrc}); background-repeat: no-repeat; background-size: ${currentCaretSize}; content: ''; display: inline-block; width: ${currentCaretSize}; height: ${currentCaretSize}; cursor: pointer; transform: rotate(90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: 3px; top: 5px; transition: transform 0.5s ease; vertical-align: top;`;
                
                // Update year right caret with h2::after-style properties
                yearRight.style.cssText = `background-image: url(${currentCaretSrc}); background-repeat: no-repeat; background-size: ${currentCaretSize}; content: ''; display: inline-block; width: ${currentCaretSize}; height: ${currentCaretSize}; cursor: pointer; transform: rotate(-90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: 3px; top: 5px; transition: transform 0.5s ease; vertical-align: top;`;
                
                // Update month left caret with h2::after-style properties
                monthLeft.style.cssText = `background-image: url(${currentCaretSrc}); background-repeat: no-repeat; background-size: ${currentCaretSize}; content: ''; display: inline-block; width: ${currentCaretSize}; height: ${currentCaretSize}; cursor: pointer; transform: rotate(90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; margin-left: ${currentMonthLeftMargin}; flex-shrink: 0; position: relative; left: 3px; top: 5px; transition: transform 0.5s ease; vertical-align: top;`;
                
                // Update month right caret with h2::after-style properties
                monthRight.style.cssText = `background-image: url(${currentCaretSrc}); background-repeat: no-repeat; background-size: ${currentCaretSize}; content: ''; display: inline-block; width: ${currentCaretSize}; height: ${currentCaretSize}; cursor: pointer; transform: rotate(-90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: 3px; top: 5px; transition: transform 0.5s ease; vertical-align: top;`;
                
                if (isCurrentlyMobile) {
                    compactNav.style.cssText = 'display: flex; align-items: center; padding: 7.8px 0; font-family: inherit; color: #f5f5f5; position: absolute; left: -3px; bottom: 0px; z-index: 10; overflow: visible;';
                    calendarHeader.style.position = 'relative';
                } else {
                    compactNav.style.cssText = 'display: flex; align-items: center; padding: 7.8px 0; font-family: inherit; color: #f5f5f5; margin-left: -3px;';
                    calendarHeader.style.position = '';
                }
            };
            
            window.addEventListener('resize', updateMobilePositioning);
            window.addEventListener('orientationchange', updateMobilePositioning);
            
            // Hide the entire evo_j_dates container if it exists
            const evoJDates = calendarHeader.querySelector('.evo_j_dates');
            if (evoJDates) {
                evoJDates.style.display = 'none';
            }
            
            // Set up navigation handlers
            let currentYearIndex = years.indexOf(currentYear);
            let currentMonthIndex = months.indexOf(currentMonth);
            
            // Helper function to find month by name and update indices
            const updateToMonth = (monthName) => {
                const targetMonth = months.find(m => m.textContent.toUpperCase() === monthName.toUpperCase());
                if (targetMonth) {
                    currentMonth = targetMonth;
                    currentMonthIndex = months.indexOf(targetMonth);
                    monthText.textContent = currentMonth.textContent;
                    // Update caret visibility immediately when month text changes
                    updateCaretVisibility();
                    console.log(`Updated to month: ${monthName}, index: ${currentMonthIndex}`);
                    return true;
                }
                console.log(`Could not find month: ${monthName} in available months:`, months.map(m => m.textContent));
                return false;
            };
            
            // Helper function to change year and update display
            const changeYear = (direction) => {
                if (direction === 'previous' && currentYearIndex > 0) {
                    currentYearIndex--;
                    currentYear = years[currentYearIndex];
                    yearText.textContent = currentYear.textContent;
                    console.log(`Changed to previous year: ${currentYear.textContent}`);
                    return true;
                } else if (direction === 'next' && currentYearIndex < years.length - 1) {
                    currentYearIndex++;
                    currentYear = years[currentYearIndex];
                    yearText.textContent = currentYear.textContent;
                    console.log(`Changed to next year: ${currentYear.textContent}`);
                    return true;
                }
                console.log(`Cannot change year ${direction}, current index: ${currentYearIndex}, total years: ${years.length}`);
                return false;
            };
            
            // Helper function to find month index in the expected order
            const getMonthIndex = (monthName) => {
                return monthPattern.findIndex(month => month.toUpperCase() === monthName.toUpperCase());
            };
            
            // Helper function to get month name by pattern index
            const getMonthByIndex = (index) => {
                if (index >= 0 && index < monthPattern.length) {
                    return monthPattern[index];
                }
                return null;
            };
            
            // Helper function to refresh node lists after DOM changes (e.g., cross-year navigation)
            const freshNodeLists = () => {
                const cal = document.querySelector('.ajde_evcal_calendar');
                const all = cal ? Array.from(cal.querySelectorAll('a')) : [];
                return {
                    years: all.filter(a => YEAR_RE.test((a.textContent || '').trim())),
                    months: all.filter(a => monthRegex.test((a.textContent || '').trim()))
                };
            };
            
            // Ultra-robust calendar update detection with event content verification
            const waitForCalendarUpdate = (callback, targetMonthName = null, maxWaitTime = 8000) => {
                const calendar = document.querySelector('.ajde_evcal_calendar');
                if (!calendar) {
                    console.warn('Calendar not found for mutation observation');
                    setTimeout(callback, 500); // Longer fallback delay
                    return;
                }
                
                let updateDetected = false;
                let timeoutId;
                let stabilityCheckId;
                let verificationCheckId;
                let lastChangeTime = Date.now();
                let initialEventCount = 0;
                
                // Get initial event count for comparison
                const getEventCount = () => {
                    const events = calendar.querySelectorAll('.eventon_list_event, .event, .ajde_evcal_event');
                    return events.length;
                };
                
                initialEventCount = getEventCount();
                console.log(`Initial event count: ${initialEventCount}`);
                
                // Enhanced stability and content verification
                const verifyCalendarReadiness = () => {
                    const currentTime = Date.now();
                    const timeSinceLastChange = currentTime - lastChangeTime;
                    
                    // Wait for at least 500ms of stability (increased from 300ms)
                    if (timeSinceLastChange >= 500) {
                        // Verify target month is available if specified
                        if (targetMonthName) {
                            const allLinks = Array.from(calendar.querySelectorAll('a'));
                            const availableMonths = allLinks.filter(link => monthRegex.test(link.textContent.trim()));
                            const targetMonth = availableMonths.find(m => m.textContent.toUpperCase() === targetMonthName.toUpperCase());
                            
                            if (!targetMonth) {
                                console.log(`Target month ${targetMonthName} not yet available, continuing to wait...`);
                                lastChangeTime = currentTime; // Reset timer
                                return false;
                            }
                            
                            // Verify target month is actually clickable and not disabled
                            if (targetMonth.classList.contains('disabled') || 
                                targetMonth.style.pointerEvents === 'none' ||
                                targetMonth.getAttribute('aria-disabled') === 'true') {
                                console.log(`Target month ${targetMonthName} is not yet clickable, continuing to wait...`);
                                lastChangeTime = currentTime; // Reset timer
                                return false;
                            }
                        }
                        
                        // Additional verification: check if events are loading
                        const currentEventCount = getEventCount();
                        const hasEvents = currentEventCount > 0;
                        
                        // For cross-year navigation, we expect event count to potentially change
                        // Wait for events to stabilize
                        if (targetMonthName && !hasEvents) {
                            console.log(`Waiting for events to load for ${targetMonthName}...`);
                            lastChangeTime = currentTime; // Reset timer
                            return false;
                        }
                        
                        console.log(`Calendar is stable and ready. Event count: ${currentEventCount}, Target: ${targetMonthName}`);
                        return true;
                    }
                    return false;
                };
                
                // More comprehensive mutation detection
                const observer = new MutationObserver((mutations) => {
                    const hasRelevantChanges = mutations.some(mutation => {
                        // Comprehensive childList monitoring
                        if (mutation.type === 'childList') {
                            // Check removed nodes (important for detecting content clearing)
                            const hasRemovedNodes = mutation.removedNodes.length > 0;
                            
                            // Check added nodes for calendar-related content
                            const hasAddedNodes = Array.from(mutation.addedNodes).some(node => {
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    return node.querySelector && (
                                        node.querySelector('a') || 
                                        node.querySelector('.eventon_list_event') ||
                                        node.querySelector('.event') ||
                                        node.querySelector('.ajde_evcal_event') ||
                                        node.classList.contains('evo_j_dates') ||
                                        node.classList.contains('evo_jumper_months') ||
                                        node.classList.contains('evo_j_years') ||
                                        node.classList.contains('eventon_events_list') ||
                                        node.classList.contains('calendar_header') ||
                                        node.classList.contains('ajde_evcal_event') ||
                                        node.classList.contains('evcal_month_line')
                                    );
                                }
                                return false;
                            });
                            
                            return hasRemovedNodes || hasAddedNodes;
                        }
                        
                        // Monitor attribute changes more precisely
                        if (mutation.type === 'attributes') {
                            const target = mutation.target;
                            
                            // Month/year link changes
                            if (target.tagName === 'A' && target.textContent) {
                                return monthRegex.test(target.textContent.trim()) || 
                                       YEAR_RE.test(target.textContent.trim());
                            }
                            
                            // Class changes on important elements
                            if (mutation.attributeName === 'class') {
                                return target.classList.contains('current') ||
                                       target.classList.contains('evo_j_dates') ||
                                       target.classList.contains('eventon_events_list') ||
                                       target.classList.contains('ajde_evcal_event') ||
                                       target.classList.contains('loading');
                            }
                            
                            // Style changes that might indicate loading/updating
                            if (mutation.attributeName === 'style') {
                                return target.classList.contains('eventon_events_list') ||
                                       target.classList.contains('ajde_evcal_event');
                            }
                        }
                        
                        return false;
                    });
                    
                    if (hasRelevantChanges && !updateDetected) {
                        lastChangeTime = Date.now();
                        console.log('Calendar change detected, resetting stability timer');
                    }
                });
                
                // Enhanced observation settings
                observer.observe(calendar, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'href', 'data-value', 'style', 'aria-disabled']
                });
                
                // Check readiness every 150ms (slightly longer intervals)
                verificationCheckId = setInterval(() => {
                    if (!updateDetected && verifyCalendarReadiness()) {
                        updateDetected = true;
                        observer.disconnect();
                        clearInterval(verificationCheckId);
                        clearTimeout(timeoutId);
                        console.log('Calendar verification passed, executing callback');
                        callback();
                    }
                }, 150);
                
                // Extended fallback timeout
                timeoutId = setTimeout(() => {
                    if (!updateDetected) {
                        updateDetected = true;
                        observer.disconnect();
                        clearInterval(verificationCheckId);
                        console.log('Calendar update timeout reached, proceeding with extended fallback');
                        callback();
                    }
                }, maxWaitTime);
                
                console.log(`Enhanced calendar update detection started${targetMonthName ? ' for ' + targetMonthName : ''}...`);
            };
            
            // Year navigation with enhanced stability checking
            yearLeft.onclick = () => {
                if (changeYear('previous')) {
                    // When going to previous year, default to December
                    updateToMonth(decemberName);
                    console.log('Clicking previous year, targeting December');
                    
                    // Start silent update before cross-year transition
                    const silentState = startCalendarSilentUpdate();
                    
                    // Step 1: Click year and wait for YEAR to load completely (no month verification yet)
                    currentYear.click();
                    console.log('Year clicked, waiting for year to load completely...');
                    
                    waitForCalendarUpdate(() => {
                        console.log('Year loaded successfully, now proceeding to month navigation...');
                        // [新增 #1] 回呼一開始：再次隱藏原生導覽（外掛跨年時常重繪 header）
                        hideOriginalNavigation();

                        // [新增 #2] 重新抓取最新的年份／月份 anchors
                        const { years: y2, months: m2 } = freshNodeLists();

                        // 用原陣列容器回填，保持外層閉包引用不變
                        years.length = 0; years.push(...y2);
                        months.length = 0; months.push(...m2);

                        // [新增 #3] 將 currentYear 指到「新節點」：
                        // 以目前 UI 顯示的 yearText 作為比對，找同名年份 anchor
                        const targetYearText = (yearText.textContent || '').trim();
                        const matchedYear = years.find(y => (y.textContent || '').trim() === targetYearText);
                        if (matchedYear) {
                            currentYear = matchedYear;
                            currentYearIndex = years.indexOf(matchedYear);
                        } else if (years.length) {
                            currentYear = years[0];
                            currentYearIndex = 0;
                        }

                        // [新增 #4] 依 targetMonthName 鎖定目標月份並點擊（若無則做 fallback）
                        if (decemberName) {
                            const target = months.find(m => (m.textContent || '').trim().toUpperCase() === decemberName.toUpperCase());
                            if (target) {
                                currentMonth = target;
                                currentMonthIndex = months.indexOf(target);
                                monthText.textContent = (currentMonth.textContent || '').trim();
                                // Update caret visibility immediately when month text changes
                                updateCaretVisibility();
                                
                                console.log('Month text updated to December, carets updated, now clicking month...');
                                
                                // Step 3: Click month and wait for MONTH to load completely before revealing grid
                                setTimeout(() => {
                                    // Final verification before clicking
                                    if (currentMonth && currentMonth.click && !currentMonth.classList.contains('disabled')) {
                                        currentMonth.click();
                                        console.log('Month clicked, waiting for month events to load...');
                                        
                                        // Step 4: Wait for month to load completely before revealing grid
                                        waitForCalendarUpdate(() => {
                                            console.log('Month loaded successfully, revealing grid...');
                                            endCalendarSilentUpdate(silentState);
                                        }, decemberName);
                                    } else {
                                        console.warn('Month element became invalid, attempting fallback click');
                                        // Fallback: re-find the December month and click
                                        const fallbackLinks = Array.from(calendar.querySelectorAll('a'));
                                        const fallbackMonths = fallbackLinks.filter(link => monthRegex.test(link.textContent.trim()));
                                        const fallbackDecember = fallbackMonths.find(m => m.textContent.toUpperCase() === decemberName.toUpperCase());
                                        if (fallbackDecember) {
                                            fallbackDecember.click();
                                        }
                                        // End after fallback month finishes loading
                                        waitForCalendarUpdate(() => {
                                            endCalendarSilentUpdate(silentState);
                                        }, decemberName);
                                    }
                                }, 300);
                            } else if (months.length) {
                                // fallback：若找不到目標月，選擇最後一個合理的候選（很可能是12月）
                                const fallback = months[months.length - 1];
                                if (fallback && fallback.click) {
                                    fallback.click();
                                    console.warn('Target month December not found; clicked fallback month:', fallback.textContent);
                                }
                                // End after fallback month finishes loading
                                waitForCalendarUpdate(() => endCalendarSilentUpdate(silentState), decemberName);
                            } else {
                                // No months found at all - end silent update immediately
                                endCalendarSilentUpdate(silentState);
                            }
                        }
                    }, null); // No target month for year loading - just wait for year to stabilize
                }
            };
            
            yearRight.onclick = () => {
                if (changeYear('next')) {
                    // When going to next year, default to January
                    updateToMonth(januaryName);
                    console.log('Clicking next year, targeting January');
                    
                    // Start silent update before cross-year transition
                    const silentState = startCalendarSilentUpdate();
                    
                    // Step 1: Click year and wait for YEAR to load completely (no month verification yet)
                    currentYear.click();
                    console.log('Year clicked, waiting for year to load completely...');
                    
                    waitForCalendarUpdate(() => {
                        console.log('Year loaded successfully, now proceeding to month navigation...');
                        // [新增 #1] 回呼一開始：再次隱藏原生導覽（外掛跨年時常重繪 header）
                        hideOriginalNavigation();

                        // [新增 #2] 重新抓取最新的年份／月份 anchors
                        const { years: y2, months: m2 } = freshNodeLists();

                        // 用原陣列容器回填，保持外層閉包引用不變
                        years.length = 0; years.push(...y2);
                        months.length = 0; months.push(...m2);

                        // [新增 #3] 將 currentYear 指到「新節點」：
                        // 以目前 UI 顯示的 yearText 作為比對，找同名年份 anchor
                        const targetYearText = (yearText.textContent || '').trim();
                        const matchedYear = years.find(y => (y.textContent || '').trim() === targetYearText);
                        if (matchedYear) {
                            currentYear = matchedYear;
                            currentYearIndex = years.indexOf(matchedYear);
                        } else if (years.length) {
                            currentYear = years[0];
                            currentYearIndex = 0;
                        }

                        // [新增 #4] 依 targetMonthName 鎖定目標月份並點擊（若無則做 fallback）
                        if (januaryName) {
                            const target = months.find(m => (m.textContent || '').trim().toUpperCase() === januaryName.toUpperCase());
                            if (target) {
                                currentMonth = target;
                                currentMonthIndex = months.indexOf(target);
                                monthText.textContent = (currentMonth.textContent || '').trim();
                                // Update caret visibility immediately when month text changes
                                updateCaretVisibility();
                                
                                console.log('Month text updated to January, carets updated, now clicking month...');
                                
                                // Step 3: Click month and wait for MONTH to load completely before revealing grid
                                setTimeout(() => {
                                    // Final verification before clicking
                                    if (currentMonth && currentMonth.click && !currentMonth.classList.contains('disabled')) {
                                        currentMonth.click();
                                        console.log('Month clicked, waiting for month events to load...');
                                        
                                        // Step 4: Wait for month to load completely before revealing grid
                                        waitForCalendarUpdate(() => {
                                            console.log('Month loaded successfully, revealing grid...');
                                            endCalendarSilentUpdate(silentState);
                                        }, januaryName);
                                    } else {
                                        console.warn('Month element became invalid, attempting fallback click');
                                        // Fallback: re-find the January month and click
                                        const fallbackLinks = Array.from(calendar.querySelectorAll('a'));
                                        const fallbackMonths = fallbackLinks.filter(link => monthRegex.test(link.textContent.trim()));
                                        const fallbackJanuary = fallbackMonths.find(m => m.textContent.toUpperCase() === januaryName.toUpperCase());
                                        if (fallbackJanuary) {
                                            fallbackJanuary.click();
                                        }
                                        // End after fallback month finishes loading
                                        waitForCalendarUpdate(() => {
                                            endCalendarSilentUpdate(silentState);
                                        }, januaryName);
                                    }
                                }, 300);
                            } else if (months.length) {
                                // fallback：若找不到目標月，選擇第一個合理的候選（很可能是1月）
                                const fallback = months[0];
                                if (fallback && fallback.click) {
                                    fallback.click();
                                    console.warn('Target month January not found; clicked fallback month:', fallback.textContent);
                                }
                                // End after fallback month finishes loading
                                waitForCalendarUpdate(() => {
                                    endCalendarSilentUpdate(silentState);
                                    updateCaretVisibility();
                                }, januaryName);
                            } else {
                                // No months found at all - end silent update immediately
                                endCalendarSilentUpdate(silentState);
                            }
                        }
                    }, null); // No target month for year loading - just wait for year to stabilize
                }
            };
            
            // Function to update caret visibility based on current month
            const updateCaretVisibility = () => {
                const currentMonthName = currentMonth.textContent.toUpperCase();
                
                // Hide back caret on January
                if (currentMonthName === januaryName.toUpperCase()) {
                    monthLeft.style.visibility = 'hidden';
                    monthLeft.style.pointerEvents = 'none';
                } else {
                    monthLeft.style.visibility = 'visible';
                    monthLeft.style.pointerEvents = 'auto';
                }
                
                // Hide forward caret on December
                if (currentMonthName === decemberName.toUpperCase()) {
                    monthRight.style.visibility = 'hidden';
                    monthRight.style.pointerEvents = 'none';
                } else {
                    monthRight.style.visibility = 'visible';
                    monthRight.style.pointerEvents = 'auto';
                }
                
                console.log(`Caret visibility updated for month: ${currentMonthName}`);
            };
            
            // Call initially to set correct visibility
            updateCaretVisibility();
            
            // Enhanced month navigation with stability checking for cross-year transitions
            monthLeft.onclick = () => {
                const currentMonthName = currentMonth.textContent.toUpperCase();
                console.log(`Month left clicked, current month: ${currentMonthName}`);
                
                // If we're at January, go to December of previous year
                if (currentMonthName === januaryName.toUpperCase()) {
                    if (changeYear('previous')) {
                        updateToMonth(decemberName);
                        console.log('Month left triggering year change: January -> Previous Year December');
                        
                        // Start silent update before cross-year transition
                        const silentState = startCalendarSilentUpdate();
                        
                        // Step 1: Click year and wait for YEAR to load completely (no month verification yet)
                        currentYear.click();
                        console.log('Year clicked (from month left), waiting for year to load completely...');
                        
                        waitForCalendarUpdate(() => {
                            console.log('Year loaded successfully (from month left), now proceeding to month navigation...');
                            // [新增 #1] 回呼一開始：再次隱藏原生導覽（外掛跨年時常重繪 header）
                            hideOriginalNavigation();

                            // [新增 #2] 重新抓取最新的年份／月份 anchors
                            const { years: y2, months: m2 } = freshNodeLists();

                            // 用原陣列容器回填，保持外層閉包引用不變
                            years.length = 0; years.push(...y2);
                            months.length = 0; months.push(...m2);

                            // [新增 #3] 將 currentYear 指到「新節點」：
                            // 以目前 UI 顯示的 yearText 作為比對，找同名年份 anchor
                            const targetYearText = (yearText.textContent || '').trim();
                            const matchedYear = years.find(y => (y.textContent || '').trim() === targetYearText);
                            if (matchedYear) {
                                currentYear = matchedYear;
                                currentYearIndex = years.indexOf(matchedYear);
                            } else if (years.length) {
                                currentYear = years[0];
                                currentYearIndex = 0;
                            }

                            // [新增 #4] 依 targetMonthName 鎖定目標月份並點擊（若無則做 fallback）
                            if (decemberName) {
                                const target = months.find(m => (m.textContent || '').trim().toUpperCase() === decemberName.toUpperCase());
                                if (target) {
                                    currentMonth = target;
                                    currentMonthIndex = months.indexOf(target);
                                    monthText.textContent = (currentMonth.textContent || '').trim();
                                                                    // Update caret visibility immediately when month text changes
                                updateCaretVisibility();
                                
                                console.log('Month text updated to December (from month left), carets updated, now clicking month...');
                                
                                // Step 3: Click month and wait for MONTH to load completely before revealing grid
                                setTimeout(() => {
                                    // Final verification before clicking
                                    if (currentMonth && currentMonth.click && !currentMonth.classList.contains('disabled')) {
                                        currentMonth.click();
                                        console.log('Month clicked (from month left), waiting for month events to load...');
                                        
                                        // Step 4: Wait for month to load completely before revealing grid
                                        waitForCalendarUpdate(() => {
                                            console.log('Month loaded successfully (from month left), revealing grid...');
                                            endCalendarSilentUpdate(silentState);
                                        }, decemberName);
                                        } else {
                                            console.warn('Month element became invalid, attempting fallback click');
                                            // Fallback: re-find the December month and click
                                            const fallbackLinks = Array.from(calendar.querySelectorAll('a'));
                                            const fallbackMonths = fallbackLinks.filter(link => monthRegex.test(link.textContent.trim()));
                                            const fallbackDecember = fallbackMonths.find(m => m.textContent.toUpperCase() === decemberName.toUpperCase());
                                            if (fallbackDecember) {
                                                fallbackDecember.click();
                                            }
                                            // End after fallback month finishes loading
                                            waitForCalendarUpdate(() => {
                                                endCalendarSilentUpdate(silentState);
                                            }, decemberName);
                                        }
                                    }, 300);
                                } else if (months.length) {
                                    // fallback：若找不到目標月，選擇最後一個合理的候選（很可能是12月）
                                    const fallback = months[months.length - 1];
                                    if (fallback && fallback.click) {
                                        fallback.click();
                                        console.warn('Target month December not found; clicked fallback month:', fallback.textContent);
                                    }
                                    // End after fallback month finishes loading
                                    waitForCalendarUpdate(() => {
                                        endCalendarSilentUpdate(silentState);
                                        updateCaretVisibility();
                                    }, decemberName);
                                } else {
                                    // No months found at all - end silent update immediately
                                    endCalendarSilentUpdate(silentState);
                                }
                            }
                        }, null); // No target month for year loading - just wait for year to stabilize
                    }
                } else {
                    // Normal previous month navigation using pattern-based approach
                    const currentPatternIndex = getMonthIndex(currentMonthName);
                    if (currentPatternIndex > 0) {
                        const previousMonthName = getMonthByIndex(currentPatternIndex - 1);
                        if (previousMonthName && updateToMonth(previousMonthName)) {
                            const silentState = startCalendarSilentUpdate();
                            currentMonth.click();
                            waitForCalendarUpdate(() => {
                                endCalendarSilentUpdate(silentState);
                            }, previousMonthName);
                        }
                    } else {
                        // Fallback to array-based navigation
                        currentMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : months.length - 1;
                        currentMonth = months[currentMonthIndex];
                        monthText.textContent = currentMonth.textContent;
                        // Update caret visibility immediately when month text changes
                        updateCaretVisibility();
                        const silentState = startCalendarSilentUpdate();
                        currentMonth.click();
                        waitForCalendarUpdate(() => {
                            endCalendarSilentUpdate(silentState);
                        });
                    }
                }
            };
            
            monthRight.onclick = () => {
                const currentMonthName = currentMonth.textContent.toUpperCase();
                console.log(`Month right clicked, current month: ${currentMonthName}`);
                
                // If we're at December, go to January of next year
                if (currentMonthName === decemberName.toUpperCase()) {
                    if (changeYear('next')) {
                        updateToMonth(januaryName);
                        console.log('Month right triggering year change: December -> Next Year January');
                        
                        // Start silent update before cross-year transition
                        const silentState = startCalendarSilentUpdate();
                        
                        // Step 1: Click year and wait for YEAR to load completely (no month verification yet)
                        currentYear.click();
                        console.log('Year clicked (from month right), waiting for year to load completely...');
                        
                        waitForCalendarUpdate(() => {
                            console.log('Year loaded successfully (from month right), now proceeding to month navigation...');
                            // [新增 #1] 回呼一開始：再次隱藏原生導覽（外掛跨年時常重繪 header）
                            hideOriginalNavigation();

                            // [新增 #2] 重新抓取最新的年份／月份 anchors
                            const { years: y2, months: m2 } = freshNodeLists();

                            // 用原陣列容器回填，保持外層閉包引用不變
                            years.length = 0; years.push(...y2);
                            months.length = 0; months.push(...m2);

                            // [新增 #3] 將 currentYear 指到「新節點」：
                            // 以目前 UI 顯示的 yearText 作為比對，找同名年份 anchor
                            const targetYearText = (yearText.textContent || '').trim();
                            const matchedYear = years.find(y => (y.textContent || '').trim() === targetYearText);
                            if (matchedYear) {
                                currentYear = matchedYear;
                                currentYearIndex = years.indexOf(matchedYear);
                            } else if (years.length) {
                                currentYear = years[0];
                                currentYearIndex = 0;
                            }

                            // [新增 #4] 依 targetMonthName 鎖定目標月份並點擊（若無則做 fallback）
                            if (januaryName) {
                                const target = months.find(m => (m.textContent || '').trim().toUpperCase() === januaryName.toUpperCase());
                                if (target) {
                                    currentMonth = target;
                                    currentMonthIndex = months.indexOf(target);
                                    monthText.textContent = (currentMonth.textContent || '').trim();
                                                                    // Update caret visibility immediately when month text changes
                                updateCaretVisibility();
                                
                                console.log('Month text updated to January (from month right), carets updated, now clicking month...');
                                
                                // Step 3: Click month and wait for MONTH to load completely before revealing grid
                                setTimeout(() => {
                                    // Final verification before clicking
                                    if (currentMonth && currentMonth.click && !currentMonth.classList.contains('disabled')) {
                                        currentMonth.click();
                                        console.log('Month clicked (from month right), waiting for month events to load...');
                                        
                                        // Step 4: Wait for month to load completely before revealing grid
                                        waitForCalendarUpdate(() => {
                                            console.log('Month loaded successfully (from month right), revealing grid...');
                                            endCalendarSilentUpdate(silentState);
                                        }, januaryName);
                                        } else {
                                            console.warn('Month element became invalid, attempting fallback click');
                                            // Fallback: re-find the January month and click
                                            const fallbackLinks = Array.from(calendar.querySelectorAll('a'));
                                            const fallbackMonths = fallbackLinks.filter(link => monthRegex.test(link.textContent.trim()));
                                            const fallbackJanuary = fallbackMonths.find(m => m.textContent.toUpperCase() === januaryName.toUpperCase());
                                            if (fallbackJanuary) {
                                                fallbackJanuary.click();
                                            }
                                            // End after fallback month finishes loading
                                            waitForCalendarUpdate(() => {
                                                endCalendarSilentUpdate(silentState);
                                            }, januaryName);
                                        }
                                    }, 300);
                                } else if (months.length) {
                                    // fallback：若找不到目標月，選擇第一個合理的候選（很可能是1月）
                                    const fallback = months[0];
                                    if (fallback && fallback.click) {
                                        fallback.click();
                                        console.warn('Target month January not found; clicked fallback month:', fallback.textContent);
                                    }
                                                                    // End after fallback month finishes loading
                                waitForCalendarUpdate(() => {
                                    endCalendarSilentUpdate(silentState);
                                }, januaryName);
                                } else {
                                    // No months found at all - end silent update immediately
                                    endCalendarSilentUpdate(silentState);
                                }
                            }
                        }, null); // No target month for year loading - just wait for year to stabilize
                    }
                } else {
                    // Normal next month navigation using pattern-based approach
                    const currentPatternIndex = getMonthIndex(currentMonthName);
                    if (currentPatternIndex >= 0 && currentPatternIndex < monthPattern.length - 1) {
                        const nextMonthName = getMonthByIndex(currentPatternIndex + 1);
                        if (nextMonthName && updateToMonth(nextMonthName)) {
                            const silentState = startCalendarSilentUpdate();
                            currentMonth.click();
                            waitForCalendarUpdate(() => {
                                endCalendarSilentUpdate(silentState);
                            }, nextMonthName);
                        }
                    } else {
                        // Fallback to array-based navigation
                        currentMonthIndex = currentMonthIndex < months.length - 1 ? currentMonthIndex + 1 : 0;
                        currentMonth = months[currentMonthIndex];
                        monthText.textContent = currentMonth.textContent;
                        // Update caret visibility immediately when month text changes
                        updateCaretVisibility();
                        const silentState = startCalendarSilentUpdate();
                        currentMonth.click();
                        waitForCalendarUpdate(() => {
                            endCalendarSilentUpdate(silentState);
                        });
                    }
                }
            };
            
            console.log('Compact calendar navigation created successfully');
            console.log('Language detected:', isEnglish ? 'English' : 'Spanish');
            console.log('January name:', januaryName, 'December name:', decemberName);
            console.log('Month pattern:', monthPattern);
            
            // Ensure the OnMouseOverDetailAdder processes the new carets
            if (window.onMouseOverDetailAdder) {
                setTimeout(() => {
                    window.onMouseOverDetailAdder.addClasses();
                }, 100);
            }
            
            return true;
        };
        
        // Try to create the navigation with retries
        let attempts = 0;
        const tryCreate = () => {
            attempts++;
            if (createCompactNav()) {
                console.log('Success on attempt', attempts);
                
                // First paint: just ensure calendar is ready, no hiding/revealing needed
                const cal = document.querySelector('.ajde_evcal_calendar');
                if (cal) {
                    // Mark as revealed so navigation animations will work properly
                    cal.setAttribute('data-revealed', '1');
                    
                    // Ensure any pending reveal class is removed
                    cal.classList.remove('calendar-reveal-pending');
                    
                    console.log('Calendar navigation created - grid should remain visible on first load');
                }
            } else if (attempts < 20) {
                setTimeout(tryCreate, 250);
            } else {
                console.log('Failed to create compact navigation after 20 attempts');
            }
        };
        
        // Start trying after a short delay
        setTimeout(tryCreate, 500);
        
        // Emergency fallback: ensure grid is never permanently hidden
        setTimeout(() => {
            const cal = document.querySelector('.ajde_evcal_calendar');
            if (cal && cal.classList.contains('calendar-reveal-pending')) {
                console.warn('Emergency fallback: Grid still hidden after 10 seconds, forcing visibility');
                const list = cal.querySelector('.eventon_events_list');
                if (list) {
                    list.style.display = '';
                    list.style.opacity = '';
                    list.style.height = '';
                    list.style.overflow = '';
                    list.style.transition = '';
                }
                cal.classList.remove('calendar-reveal-pending');
                cal.setAttribute('data-revealed', '1');
            }
        }, 10000);
    }
    
    // Mobile Landscape Warning Methods
    initMobileLandscapeWarning() {
        console.log('Initializing mobile landscape warning system');
        
        // Create the overlay element
        this.createLandscapeWarningOverlay();
        
        // Check initial orientation
        this.checkMobileLandscapeOrientation();
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            // Small delay to ensure orientation change is complete
            setTimeout(() => {
                this.checkMobileLandscapeOrientation();
            }, 100);
        });
        
        // Also listen for resize events (fallback for some devices)
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.checkMobileLandscapeOrientation();
            }, 100);
        });
    }
    
    createLandscapeWarningOverlay() {
        // Check if overlay already exists
        if (document.getElementById('landscape-warning-overlay')) {
            console.log('Landscape warning overlay already exists');
            return;
        }
        
        // Determine language for messages
        const isEnglish = document.documentElement.lang === "en-US";
        
        const title = isEnglish ? "Vertical Mode Recommended" : "Modo Vertical Recomendado";
        const message = isEnglish ? 
            "Please rotate your device to vertical orientation for the best experience." : 
            "Para la mejor experiencia, por favor rota tu dispositivo al modo vertical.";
        
        // Create overlay HTML
        const overlayHTML = `
            <div id="landscape-warning-overlay">
                <div class="warning-content">
                    <div class="warning-title">${title}</div>
                    <div class="warning-message">${message}</div>
                    <div class="phone-animation">
                        <div class="phone-outline"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert into DOM
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        
        this.landscapeOverlay = document.getElementById('landscape-warning-overlay');
        
        console.log('Landscape warning overlay created');
    }
    
    // Broad mobile/tablet detection - use for UI adaptations that should apply to tablets too
    // (menu behavior, calendar navigation, etc.)
    isMobileDevice() {
        return (window.innerWidth <= 768 || 
               window.innerHeight <= 768 ||
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0 ||
               ('ontouchstart' in window) || 
               (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
               (navigator.userAgent.toLowerCase().indexOf('android') !== -1) ||
               (navigator.userAgent.toLowerCase().indexOf('iphone') !== -1) ||
               (navigator.userAgent.toLowerCase().indexOf('ipad') !== -1));
    }
    
    // Precise mobile phone detection that excludes tablets - use for phone-specific features
    // like landscape orientation warnings that shouldn't apply to tablets
    isMobilePhone() {
        const userAgent = navigator.userAgent.toLowerCase();
        const hasTouch = navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || ('ontouchstart' in window);
        
        // Screen size thresholds - mobile phones typically have both dimensions smaller
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const maxDimension = Math.max(screenWidth, screenHeight);
        const minDimension = Math.min(screenWidth, screenHeight);
        
        // Mobile phone characteristics:
        // - Maximum dimension typically < 900px (excludes most tablets)
        // - Minimum dimension typically < 500px (excludes tablets in portrait)
        // - Aspect ratio typically > 1.3 (taller than wide when in portrait)
        const aspectRatio = maxDimension / minDimension;
        
        // Explicit tablet exclusions
        const isTablet = (
            userAgent.indexOf('ipad') !== -1 ||
            userAgent.indexOf('tablet') !== -1 ||
            (userAgent.indexOf('android') !== -1 && userAgent.indexOf('mobile') === -1) ||
            userAgent.indexOf('kindle') !== -1 ||
            userAgent.indexOf('silk') !== -1 ||
            userAgent.indexOf('playbook') !== -1 ||
            userAgent.indexOf('bb10') !== -1 ||
            userAgent.indexOf('rim') !== -1
        );
        
        // Desktop/laptop exclusions
        const isDesktop = (
            userAgent.indexOf('windows nt') !== -1 ||
            userAgent.indexOf('macintosh') !== -1 ||
            userAgent.indexOf('linux') !== -1
        ) && !hasTouch;
        
        // Positive mobile phone indicators
        const mobileIndicators = (
            userAgent.indexOf('mobile') !== -1 ||
            userAgent.indexOf('iphone') !== -1 ||
            userAgent.indexOf('ipod') !== -1 ||
            userAgent.indexOf('blackberry') !== -1 ||
            userAgent.indexOf('windows phone') !== -1
        );
        
        // Final determination: must meet size criteria AND not be a tablet/desktop
        const meetsPhoneSize = (
            maxDimension < 900 && 
            minDimension < 500 && 
            aspectRatio > 1.3
        );
        
        return (meetsPhoneSize && hasTouch && !isTablet && !isDesktop) || 
               (mobileIndicators && !isTablet && !isDesktop);
    }
    
    checkMobileLandscapeOrientation() {
        if (!this.landscapeOverlay) {
            console.log('Landscape overlay not found, skipping orientation check');
            return;
        }
        
        const isMobilePhone = this.isMobilePhone();
        const isLandscape = window.innerWidth > window.innerHeight;
        
        // Show warning ONLY if actual mobile phone (not tablet) is in landscape mode
        if (isMobilePhone && isLandscape) {
            console.log('Mobile phone in landscape detected - showing warning');
            this.showLandscapeWarning();
        } else {
            console.log('Portrait mode, tablet, or desktop detected - hiding warning');
            this.hideLandscapeWarning();
        }
    }
    
    showLandscapeWarning() {
        if (this.landscapeOverlay) {
            this.landscapeOverlay.style.display = 'flex';
            // Prevent scrolling when overlay is shown
            document.body.style.overflow = 'hidden';
            
            // Add body class for additional styling if needed
            document.body.classList.add('landscape-warning-active');
            
            console.log('Landscape warning overlay shown');
        }
    }
    
    hideLandscapeWarning() {
        if (this.landscapeOverlay) {
            this.landscapeOverlay.style.display = 'none';
            // Restore scrolling
            document.body.style.overflow = '';
            
            // Remove body class
            document.body.classList.remove('landscape-warning-active');
            
            console.log('Landscape warning overlay hidden');
        }
    }
    initOrganizadorxsTitleUpdater() {
        // Update organizadorxs card header title on page load
        const cardHeader = document.querySelector('#organizadorxs .card-header h2');
        if (cardHeader) {
            // Function to detect mobile device
            const isMobileDevice = () => {
                return (window.innerWidth <= 768 || 
                       navigator.maxTouchPoints > 0 || 
                       navigator.msMaxTouchPoints > 0 ||
                       ('ontouchstart' in window) || 
                       (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
                       (navigator.userAgent.toLowerCase().indexOf('android') !== -1));
            };
            
            const newTitle = isMobileDevice() ? 'ORGANIZADXR' : 'ORGANIZADORXS';
            cardHeader.textContent = newTitle;
        }
        
        console.log('Organizadorxs title updater initialized');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // Create Navigation instance and make it globally accessible for debugging
    window.navigation = new Navigation();
});