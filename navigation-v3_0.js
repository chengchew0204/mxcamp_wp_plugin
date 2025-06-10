/*
2025-05-05 Burger menu test
Hovering the menu items to show a preview of the content
*/ 
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
        // Create safe closeAllPreviews function for use before MenuConstruct
        if (!window.closeAllPreviews) {
            window.closeAllPreviews = function() {
                // Will be overridden by actual implementation in MenuConstruct
                console.log("Placeholder closeAllPreviews called before initialization");
            };
        }
        //orientation
        this.currentOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        // initialisation de la navigation
        this.init();
	
    }
    
    // initialisation de la navigation
    init() {
        const inite = document.getElementById("inite");
        this.replaceDefaultBurgerFunction();
        this.LetsListen();
        this.MenuConstruct();
		this.addGifToMapBackground()
        this.initScrollEvent();
        this.initEscapeButton();
        this.UrlVerif();
        this.ashTagLinks();
        this.empecherDefilementSurChangementOrientation();
        inite.style.display = "none";
        this.getVisibleSlideInfo();
        this.initArrowKeyNavigation();
    }
	
	addGifToMapBackground() {
		try {
			const mapa = document.querySelector("div.slide_10#mapa");
			const gifDetail = document.createElement("div");
			gifDetail.id = "gif-detail";
			mapa.append(gifDetail);
		} catch {
			const map = document.querySelector("div.slide_10#map");
			const gifDetail = document.createElement("div");
			gifDetail.id = "gif-detail";
			map.append(gifDetail);
		}
	}
	
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
        var urlHash = window.location.hash;
        // Vérifier si un hash existe
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
    
            const NewMenuItem = document.createElement('li');
            const NewParagraph = document.createElement('p');
            NewParagraph.classList.add('menu-item', 'menu-item-type-custom', 'menu-item-object-custom');
            NewParagraph.setAttribute('data-post', postId);
            NewParagraph.textContent = postTitle;
            const slideData = {
                post: postId,
                divId: divId,
                openTheCard: true
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
    
            NewMenuItem.appendChild(NewParagraph);
            list.appendChild(NewMenuItem);
    
            let thiscaretdiv = item.querySelector('.caretdiv a');
            if (thiscaretdiv) {
                var cleanHash = thiscaretdiv.getAttribute('href').substring(1);
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
        arrowImg.src = isMobileDevice() ? "https://camp.mx/img/caret28.svg" : "https://camp.mx/img/caret28.svg";
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
        
        // Function to detect mobile device
        function isMobileDevice() {
            return (window.innerWidth <= 768 || 
                   navigator.maxTouchPoints > 0 || 
                   navigator.msMaxTouchPoints > 0 ||
                   ('ontouchstart' in window) || 
                   (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
                   (navigator.userAgent.toLowerCase().indexOf('android') !== -1));
        }
        
        // Create shared function to close all previews
        function closeAllPreviews() {
            // Close volunteer preview
            volunteerIsHovering = false;
            arrowImg.style.transform = 'rotate(-90deg)';
            hoverDiv.style.display = 'none';
            volunteerPreviewShown = false;
            
            // Close restaurant preview
            restaurantIsHovering = false;
            arrowImgRestaurant.style.transform = 'rotate(-90deg)';
            hoverDivRestaurant.style.display = 'none';
            restaurantPreviewShown = false;
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
        
        // Change hover behavior - only enable hover events on arrows, not paragraph text
        
        // For volunteer section, set up proper hover events
        // Create named event handler functions we can reference
        const volunteerArrowMouseEnter = () => {
            if (!isMobileDevice()) {
                clearTimeout(volunteerHoverTimer);
                showVolunteerPreview();
            }
        };
        
        const volunteerArrowMouseLeave = () => {
            if (!isMobileDevice()) {
                volunteerIsHovering = false;
                hideVolunteerPreview();
            }
        };
        
        // Add hover event listeners only to the arrow
        arrowImg.addEventListener('mouseenter', volunteerArrowMouseEnter);
        arrowImg.addEventListener('mouseleave', volunteerArrowMouseLeave);
        
        // Add hover event listeners to the hover div to maintain hover state
        hoverDiv.addEventListener('mouseenter', () => {
            if (!isMobileDevice()) {
                clearTimeout(volunteerHoverTimer);
                volunteerIsHovering = true;
            }
        });
        
        hoverDiv.addEventListener('mouseleave', () => {
            if (!isMobileDevice()) {
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
        NewMenuItem.appendChild(NewParagraph);
        
        const artistMenuItem = list.querySelectorAll("li")[3];
        artistMenuItem.after(NewMenuItem);
    
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
    }
   //on met  des listen sur els ahtag internes a la page qui ont la class openthecard
   ashTagLinks(){
     let linksToOpenCard = document.querySelectorAll('.openthecard');
    linksToOpenCard.forEach(item => {
        var url = item.getAttribute('href');
        var parsedUrl = new URL(url);
        var hash = parsedUrl.hash;
        var hashWithoutHash = hash.substring(1);
        const slideData = {
            post: url,
            divId: hashWithoutHash,
            openTheCard: true
        };
        item.addEventListener('click', (e)=>{e.preventDefault; this.gotoSlide(slideData)});
        item.style.behavior='smooth';
    })
     //trouver var url
    }
    //navigation to the slide
    gotoSlide(obj) {
        // Close all previews when navigating to a slide
        if (typeof window.closeAllPreviews === 'function') {
            window.closeAllPreviews();
        }
        
        const divId = obj.divId;
        const openCard = obj.openTheCard === undefined ? true : obj.openTheCard;
        const element = document.getElementById(divId);
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
            // Store the handler reference
            this.eventHandlers[slideId+'scroll'] = this.openCard.bind(this, { divId: slideId });
            // Ajouter l'événement click en utilisant une méthode liée
            slideScroll.addEventListener('click', this.eventHandlers[slideId+'scroll']);
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
                tapTop.addEventListener('click', this.eventHandlers[slideId+'tap']);
                tapLeft.addEventListener('click', this.eventHandlers[slideId+'tap']);
                tapRight.addEventListener('click', this.eventHandlers[slideId+'tap']);
                tapBottom.addEventListener('click', this.eventHandlers[slideId+'tap']);
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
        
        gtag('event', 'Open_Card', {
            'event_category': slideId,
            'event_label': slideId,
            'value': 1
          });
        console.log('START opening card', 'slideid', this.targetSlide, 'cardopened', this.cardopened);
        this.downloadsources(slideId);
        if(this.cardopened===true){console.log('closing last card');this.closeCards();}
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
          this.theFrontVideo.forEach(function(el) {
       //     console.log(el);
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
		
        if(slideId==="mapa" || slideId==="map"){
			setTimeout(() => { 
				//document.getElementById('focus-point').scrollIntoView({behavior: "auto"})
				const mapContainer = document.getElementById('imap'); //Get scroll object
				mapContainer.scrollLeft = 0;
				mapContainer.scrollTop=(mapContainer.scrollHeight-mapContainer.offsetHeight)*2/3;//allign vertical
				console.log('Map scrolled to Pos:'+mapContainer.scrollLeft+', '+mapContainer.scrollTop+' Max:'+mapContainer.scrollWidth+','+mapContainer.scrollHeight+' Size:'+mapContainer.offsetWidth+','+mapContainer.offsetHeight);
				
				// Initialize map interactions
				this.initMapInteractions();
		    },100)
		}
       // Supprimer l'événement a slide_scroll click en utilisant la référence stockée
        const zoneClick = slideopened.querySelector('.slide_10_scroll');
        zoneClick.removeEventListener('click', this.eventHandlers[slideId+'scroll'], false);
        // Ajoute lèvenement a header
        const cardHeader = slideopened.querySelector('.card-header');
        this.eventHandlers[slideId+'header'] = this.closeCardsE.bind(this);
        cardHeader.addEventListener('click', this.eventHandlers[slideId+'header']);
        this.cardopened = true;
        console.log('END opening card', 'slideid', this.targetSlide, 'cardopened', this.cardopened);
    }
    closeCardsE(event) {
        event.stopPropagation();
        this.closeCards();
    }
    closeCards(){
        console.log('START closing card', 'slideid', this.targetSlide, 'cardopened', this.cardopened);
        //console.log(this.targetSlide);
        if(this.targetSlide==='gallery'||this.targetSlide==='galeria'){
            this.removeVideosFromGallery();
        }
        this.body.classList.remove(this.targetSlide);
        this.body.classList.remove('bodycardopened');
        const slideopened = document.getElementById(this.targetSlide);
        slideopened.classList.add('closed');
        slideopened.classList.remove('opened');
        // enleve lèvenement a header
        const cardHeader = slideopened.querySelector('.card-header');
        cardHeader.removeEventListener('click', this.eventHandlers[this.targetSlide+'header']);
        // remet l'événement
        const zoneClick = slideopened.querySelector('.slide_10_scroll');
        this.eventHandlers[this.targetSlide+'scroll'] = this.openCard.bind(this, { divId: this.targetSlide });
        zoneClick.addEventListener('click', this.eventHandlers[this.targetSlide+'scroll'], false);
        this.targetSlide = 'none';
        this.cardopened = false;
        this.theFrontVideo.forEach(function(el) {
       //     console.log(el);
            el.play();
        });
        //this.theFrontVideo.play();
        console.log('END closing card', 'slideid', this.targetSlide, 'cardopened', this.cardopened);
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
        if(this.cardopened === true && this.scrolling === false && !document.fullscreenElement){
            let divcardopened=document.getElementById(this.targetSlide)
            var topLen = divcardopened.getBoundingClientRect().top;
           var heightScreen = window.innerHeight
           if ((topLen > heightScreen/2)||(topLen < (-heightScreen/2))){
            this.closeCards();
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
            this.closeCards();
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
    initMapInteractions() {
        // Initialize interactive map hover effects for CASA, CHOZAS, CENTRAL, CALLE, FORO
        console.log('Initializing map interactions');
        
        const mapContainer = document.getElementById('imap');
        if (!mapContainer) {
            console.log('Map container not found');
            return;
        }
        
        // Map area definitions with their corresponding detail divs, layer images, and contour images
        const mapAreas = {
            'central': {
                detailId: 'central-detail',
                layers: ['central-down-1', 'central-down-2', 'central-down-3'],
                contourImage: 'https://camp.mx/wp-content/uploads/palapa-hover-central.png',
                isClicked: false
            },
            'casita': {
                detailId: 'casita-detail', 
                layers: ['casita-down-1', 'casita-down-2'],
                contourImage: 'https://camp.mx/wp-content/uploads/palapa-hover-casa.png',
                isClicked: false
            },
            'chozas': {
                detailId: 'chozas-detail',
                layers: ['chozas-down-1', 'chozas-down-2'],
                contourImage: 'https://camp.mx/wp-content/uploads/palapa-hover-chozas.png',
                isClicked: false
            },
            'calle': {
                detailId: 'calle-detail',
                layers: ['calle-down-1', 'calle-down-2', 'calle-down-3'],
                contourImage: 'https://camp.mx/wp-content/uploads/palapa-hover-calle.png',
                isClicked: false
            },
            'jardin': {
                detailId: 'jardin-detail',
                layers: ['jardin-down-1', 'jardin-down-2', 'jardin-down-3', 'jardin-down-4'],
                contourImage: 'https://camp.mx/wp-content/uploads/palapa-hover-foro.png',
                isClicked: false
            }
        };
        
        // Store map areas for later reference
        this.mapAreas = mapAreas;
        
        // Preload all contour images for faster display
        this.preloadContourImages(mapAreas);
        
        // Create contour overlay container
        this.createContourOverlay();
        
        // Store current contour for tracking
        this.currentContour = null;
        
        // Add hover and click event listeners to each detail area
        Object.keys(mapAreas).forEach(areaName => {
            const area = mapAreas[areaName];
            const detailElement = document.getElementById(area.detailId);
            
            if (detailElement) {
                // Add mouseenter event to show contour
                detailElement.addEventListener('mouseenter', () => {
                    console.log(`Mouse entered ${areaName}`);
                    this.showContour(areaName);
                });
                
                // Add mouseleave event to hide contour
                detailElement.addEventListener('mouseleave', () => {
                    console.log(`Mouse left ${areaName}`);
                    this.hideContour();
                });
                
                // Add click event to toggle layers
                detailElement.addEventListener('click', (e) => {
                    console.log(`Clicked on ${areaName}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMapArea(areaName);
                });
                
                console.log(`Added hover and click events for ${areaName} area`);
            } else {
                console.log(`Detail element not found for ${areaName}: ${area.detailId}`);
            }
        });
    }
    
    preloadContourImages(mapAreas) {
        // Preload all contour images to improve hover performance
        console.log('Preloading contour images...');
        this.preloadedImages = {};
        
        Object.keys(mapAreas).forEach(areaName => {
            const area = mapAreas[areaName];
            const img = new Image();
            img.onload = () => {
                console.log(`Preloaded contour image for ${areaName}`);
            };
            img.onerror = () => {
                console.error(`Failed to preload contour image for ${areaName}: ${area.contourImage}`);
            };
            img.src = area.contourImage;
            this.preloadedImages[areaName] = img;
        });
    }
    
    isOnFirstLayer(areaName) {
        // Check if the area is currently showing the first layer (z-index: -1)
        const area = this.mapAreas[areaName];
        if (!area) return false;
        
        // Check if all layers for this area have z-index: -1 (first layer state)
        const allLayersOnFirstLevel = area.layers.every(layerId => {
            const layer = document.getElementById(layerId);
            if (!layer) return true; // If layer doesn't exist, consider it as first level
            
            const zIndex = window.getComputedStyle(layer).zIndex;
            return zIndex === '-1' || zIndex === 'auto';
        });
        
        return allLayersOnFirstLevel;
    }
    
    createContourOverlay() {
        // Create overlay container for contour images if it doesn't exist
        if (!document.getElementById('map-contour-overlay')) {
            const mapContainer = document.getElementById('imap');
            this.contourOverlay = document.createElement('div');
            this.contourOverlay.id = 'map-contour-overlay';
            this.contourOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 15;
            `;
            mapContainer.appendChild(this.contourOverlay);
        } else {
            this.contourOverlay = document.getElementById('map-contour-overlay');
        }
    }
    
    
    showContour(areaName) {
        const area = this.mapAreas[areaName];
        if (!area) return;
        
        // If same contour is already showing, do nothing
        if (this.currentContour === areaName) return;
        
        // Clear any existing contour
        this.hideContour();
        
        // Get preloaded image
        const preloadedImg = this.preloadedImages && this.preloadedImages[areaName];
        if (!preloadedImg) {
            console.log(`No preloaded image for ${areaName}`);
            return;
        }
        
        // Create and show contour
        const contourImg = document.createElement('img');
        contourImg.src = preloadedImg.src;
        contourImg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
            pointer-events: none;
            object-fit: cover;
            z-index: 20;
        `;
        
        this.contourOverlay.appendChild(contourImg);
        this.currentContour = areaName;
        console.log(`Showing contour for ${areaName}`);
    }
    
    hideContour() {
        if (this.contourOverlay) {
            this.contourOverlay.innerHTML = '';
            this.currentContour = null;
            console.log('Hiding all contours');
        }
    }
    
    toggleMapArea(areaName) {
        const area = this.mapAreas[areaName];
        if (!area) return;
        
        // Toggle the clicked state
        area.isClicked = !area.isClicked;
        
        if (area.isClicked) {
            // Show the layers (contour behavior is independent)
            this.showMapLayers(area.layers);
            console.log(`Activated ${areaName} area - layers shown`);
        } else {
            // Hide the layers (contour behavior is independent)
            this.hideMapLayers(area.layers);
            console.log(`Deactivated ${areaName} area - layers hidden`);
        }
    }
    
    showMapLayers(layerIds) {
        // Show the specified map layers by changing their z-index
        layerIds.forEach(layerId => {
            const layer = document.getElementById(layerId);
            if (layer) {
                layer.style.zIndex = '1';
                layer.style.opacity = '1';
                layer.style.transition = 'opacity 0.3s ease';
            }
        });
    }
    
    hideMapLayers(layerIds) {
        // Hide the specified map layers by changing their z-index back
        layerIds.forEach(layerId => {
            const layer = document.getElementById(layerId);
            if (layer) {
                layer.style.zIndex = '-1';
                layer.style.opacity = '0.8';
                layer.style.transition = 'opacity 0.3s ease';
            }
        });
    }
    initializeCompactCalendarNav() {
        // Implementation of initializeCompactCalendarNav method
        console.log('Compact calendar navigation initialized for eventos/events section');
        
        // Immediately hide original navigation to prevent glitch
        const hideOriginalNavigation = () => {
            const calendar = document.querySelector('.ajde_evcal_calendar');
            if (calendar) {
                // Hide all year and month links immediately
                const allLinks = Array.from(calendar.querySelectorAll('a'));
                allLinks.forEach(link => {
                    const text = link.textContent.trim();
                    if (/^(2024|2025|2026|2027)$/.test(text) || /^(ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)$/i.test(text)) {
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
                if (/^(2024|2025|2026|2027)$/.test(text)) {
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
                } else if (/^(ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)$/i.test(text)) {
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
                return false;
            }
            
            // Default to 2025 and MAY if no current selection
            if (!currentYear) {
                currentYear = years.find(y => y.textContent === '2025') || years[0];
            }
            if (!currentMonth) {
                currentMonth = months.find(m => m.textContent.toUpperCase() === 'MAY') || months[4]; // MAY is at index 4
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
            yearLeft.style.cssText = `background-image: url(https://camp.mx/img/caret28.svg); background-repeat: no-repeat; background-size: ${yearCaretSize}; content: ''; display: inline-block; width: ${yearCaretSize}; height: ${yearCaretSize}; cursor: pointer; transform: rotate(90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: 3px; top: 5px; transition: transform 0.5s ease; vertical-align: top;`;
            yearLeft.onmouseover = () => yearLeft.style.opacity = '1';
            yearLeft.onmouseout = () => yearLeft.style.opacity = '1';
            
            const yearText = document.createElement('span');
            yearText.textContent = currentYear.textContent;
            yearText.style.cssText = 'margin: 0 8px; min-width: 60px; text-align: center; font-weight: 500; font-size: 22px; background-color: rgba(245, 245, 245, 0.95); color: rgba(0, 0, 0, 0.85); padding: 3px 8px 4px 8px;';
            
            const yearRight = document.createElement('div');
            yearRight.style.cssText = `background-image: url(https://camp.mx/img/caret28.svg); background-repeat: no-repeat; background-size: ${yearCaretSize}; content: ''; display: inline-block; width: ${yearCaretSize}; height: ${yearCaretSize}; cursor: pointer; transform: rotate(-90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: -2px; top: 5.7px; transition: transform 0.5s ease; vertical-align: top;`;
            yearRight.onmouseover = () => yearRight.style.opacity = '1';
            yearRight.onmouseout = () => yearRight.style.opacity = '1';
            
            // Month navigation elements  
            const monthLeft = document.createElement('div');
            // Use the same mobile detection variable from above
            const monthLeftMargin = isMobileDevice ? '8px' : '20px';
            monthLeft.style.cssText = `background-image: url(https://camp.mx/img/caret28.svg); background-repeat: no-repeat; background-size: ${yearCaretSize}; content: ''; display: inline-block; width: ${yearCaretSize}; height: ${yearCaretSize}; cursor: pointer; transform: rotate(90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; margin-left: ${monthLeftMargin}; flex-shrink: 0; position: relative; left: 3px; top: 5px; transition: transform 0.5s ease; vertical-align: top;`;
            monthLeft.onmouseover = () => monthLeft.style.opacity = '1';
            monthLeft.onmouseout = () => monthLeft.style.opacity = '1';
            
            const monthText = document.createElement('span');
            monthText.textContent = currentMonth.textContent;
            monthText.style.cssText = 'margin: 0 8px; min-width: 60px; text-align: center; font-weight: 500; text-transform: uppercase; font-size: 22px; background-color: rgba(245, 245, 245, 0.95); color: rgba(0, 0, 0, 0.85); padding: 3px 8px 4px 8px;';
            
            const monthRight = document.createElement('div');
            monthRight.style.cssText = `background-image: url(https://camp.mx/img/caret28.svg); background-repeat: no-repeat; background-size: ${yearCaretSize}; content: ''; display: inline-block; width: ${yearCaretSize}; height: ${yearCaretSize}; cursor: pointer; transform: rotate(-90deg); transform-origin: 9px 6px; filter: brightness(0) invert(1); opacity: 1; flex-shrink: 0; position: relative; left: -2px; top: 5.7px; transition: transform 0.5s ease; vertical-align: top;`;
            monthRight.onmouseover = () => monthRight.style.opacity = '1';
            monthRight.onmouseout = () => monthRight.style.opacity = '1';
            
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
                    return true;
                }
                return false;
            };
            
            // Helper function to change year and update display
            const changeYear = (direction) => {
                if (direction === 'previous' && currentYearIndex > 0) {
                    currentYearIndex--;
                    currentYear = years[currentYearIndex];
                    yearText.textContent = currentYear.textContent;
                    return true;
                } else if (direction === 'next' && currentYearIndex < years.length - 1) {
                    currentYearIndex++;
                    currentYear = years[currentYearIndex];
                    yearText.textContent = currentYear.textContent;
                    return true;
                }
                return false;
            };
            
            // Year navigation with intelligent month defaults
            yearLeft.onclick = () => {
                if (changeYear('previous')) {
                    // When going to previous year, default to December
                    updateToMonth('DIC');
                    // Click year first, then month
                    currentYear.click();
                    setTimeout(() => currentMonth.click(), 100);
                }
            };
            
            yearRight.onclick = () => {
                if (changeYear('next')) {
                    // When going to next year, default to January
                    updateToMonth('ENE');
                    // Click year first, then month
                    currentYear.click();
                    setTimeout(() => currentMonth.click(), 100);
                }
            };
            
            // Intelligent month navigation with automatic year adjustment
            monthLeft.onclick = () => {
                // If we're at January (ENE), go to December of previous year
                if (currentMonth.textContent.toUpperCase() === 'ENE') {
                    if (changeYear('previous')) {
                        updateToMonth('DIC');
                        // Click year first, then month
                        currentYear.click();
                        setTimeout(() => currentMonth.click(), 100);
                    }
                } else {
                    // Normal previous month navigation
                    currentMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : months.length - 1;
                    currentMonth = months[currentMonthIndex];
                    monthText.textContent = currentMonth.textContent;
                    currentMonth.click();
                }
            };
            
            monthRight.onclick = () => {
                // If we're at December (DIC), go to January of next year
                if (currentMonth.textContent.toUpperCase() === 'DIC') {
                    if (changeYear('next')) {
                        updateToMonth('ENE');
                        // Click year first, then month
                        currentYear.click();
                        setTimeout(() => currentMonth.click(), 100);
                    }
                } else {
                    // Normal next month navigation
                    currentMonthIndex = currentMonthIndex < months.length - 1 ? currentMonthIndex + 1 : 0;
                    currentMonth = months[currentMonthIndex];
                    monthText.textContent = currentMonth.textContent;
                    currentMonth.click();
                }
            };
            
            console.log('Compact calendar navigation created successfully');
            return true;
        };
        
        // Try to create the navigation with retries
        let attempts = 0;
        const tryCreate = () => {
            attempts++;
            if (createCompactNav()) {
                console.log('Success on attempt', attempts);
            } else if (attempts < 20) {
                setTimeout(tryCreate, 250);
            } else {
                console.log('Failed to create compact navigation after 20 attempts');
            }
        };
        
        // Start trying after a short delay
        setTimeout(tryCreate, 500);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    var navigation = new Navigation();
});