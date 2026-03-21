class Hovers {

    constructor() {
      this.init();
      this.activeHover = null;
      this.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      this.hideTimers = new Map(); // Store timers per hover element
      this.backdrop = null; // Backdrop element for mobile overlays
      this.mobileTouchMoveLockHandler = null;
      
      // Create backdrop element for mobile devices
      if (this.isMobileDevice()) {
        this.createBackdrop();
      }
      
      // Add click handler for closing all hovers when clicking elsewhere on the page
      document.addEventListener('click', (e) => {
        // Don't close if clicking inside a hover element or its content
        if (!e.target.closest('.hover') && !e.target.closest('.hover-content')) {
          this.closeAllHovers();
        }
      });
      
      // Add global mousemove listener to detect when cursor is outside both trigger and content
      document.addEventListener('mousemove', (e) => {
        // Check all visible hover contents
        const visibleHovers = document.querySelectorAll('.hover-content[style*="display: block"]');
        visibleHovers.forEach(hoverContent => {
          const parentHover = hoverContent.closest('.hover');
          if (!parentHover) return;
          
          // Check if mouse is over the trigger or the content
          const isOverTrigger = parentHover.matches(':hover');
          const isOverContent = hoverContent.matches(':hover');
          
          if (!isOverTrigger && !isOverContent) {
            // Mouse is outside both, schedule hide
            this.scheduleHide(parentHover);
          } else {
            // Mouse is over one of them, cancel hide
            const timerId = this.hideTimers.get(parentHover);
            if (timerId) {
              clearTimeout(timerId);
              this.hideTimers.delete(parentHover);
            }
          }
        });
      });
      
      // Add scroll handler to detect when user scrolls away from hover content
      window.addEventListener('scroll', () => {
        // Skip auto-close on mobile devices (they use overlays with close button)
        if (this.isMobileDevice()) {
          return;
        }
        
        // Only process if we have hovers open
        if (document.body.classList.contains('hoveron')) {
          const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
          const scrollDifference = Math.abs(currentScrollPosition - this.lastScrollPosition);
          
          // If user has scrolled more than 30px, close all hovers
          // This ensures small scroll movements within the hover content don't trigger closing
          if (scrollDifference > 30) {
            this.closeAllHovers();
          }
          
          this.lastScrollPosition = currentScrollPosition;
        }
      }, { passive: true });
      
      // Add touchmove handler specifically for mobile
      document.addEventListener('touchmove', (e) => {
        // Skip auto-close for mobile overlays - they use explicit close button
        // Only close desktop hovers or menu hovers on touch
        if (this.isMobileDevice() && document.body.classList.contains('hoveron')) {
          // Don't auto-close mobile overlays on touchmove
          return;
        }
        
        // For desktop or non-overlay hovers, close when touching outside
        if (document.body.classList.contains('hoveron')) {
          const target = e.target;
          if (!target.closest('.hover-content') && !target.closest('.hover')) {
            this.closeAllHovers();
          }
        }
      }, { passive: true });
    }
    
    // Helper to detect mobile devices
    isMobileDevice() {
      return (
        window.innerWidth <= 768 || 
        navigator.maxTouchPoints > 0 || 
        navigator.msMaxTouchPoints > 0 ||
        ('ontouchstart' in window) || 
        (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) ||
        (navigator.userAgent.toLowerCase().indexOf('android') !== -1)
      );
    }
    
    // Create backdrop for mobile overlays
    createBackdrop() {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'hover-backdrop';
      this.backdrop.addEventListener('click', () => {
        this.closeAllHovers();
      });
      document.body.appendChild(this.backdrop);
    }
    
    // Lock page touch scrolling while allowing scroll inside hover content
    enableMobileTouchMoveLock() {
      if (this.mobileTouchMoveLockHandler) return;
      
      this.mobileTouchMoveLockHandler = (event) => {
        if (!document.body.classList.contains('hoveron')) return;
        
        // Allow scrolling inside hover content only
        if (event.target.closest('.hover-content')) return;
        
        // Block background page scrolling
        event.preventDefault();
      };
      
      document.addEventListener('touchmove', this.mobileTouchMoveLockHandler, { passive: false });
    }
    
    disableMobileTouchMoveLock() {
      if (!this.mobileTouchMoveLockHandler) return;
      document.removeEventListener('touchmove', this.mobileTouchMoveLockHandler);
      this.mobileTouchMoveLockHandler = null;
    }
  
    init() {
      var hovers = document.getElementsByClassName("hover");
      for (var i = 0; i < hovers.length; i++) {
        // Mouse events
        hovers[i].addEventListener('mouseenter', (e) => {
          // Cancel any pending hide timer for this specific hover
          const timerId = this.hideTimers.get(e.currentTarget);
          if (timerId) {
            clearTimeout(timerId);
            this.hideTimers.delete(e.currentTarget);
          }
          this.HoverMe(e.currentTarget);
        });
        hovers[i].addEventListener('mouseleave', (e) => {
          // Start a delay before hiding
          this.scheduleHide(e.currentTarget);
        });
        
        // Touch events for mobile - use touchstart/touchend
        hovers[i].addEventListener('touchstart', (e) => {
          // If touch starts inside visible hover content, do not retrigger hover open logic.
          if (e.target.closest('.hover-content')) {
            return;
          }
          
          // We need to prevent default for touch events on mobile menu
          // but only for menu-related hovers that have arrows
          if (e.currentTarget.closest('.mobile-menu') && e.currentTarget.querySelector('.menu-arrow')) {
            e.preventDefault();
          }
          this.HoverMe(e.currentTarget);
        });
        
        // Add event listeners to hover-content to keep it visible
        const hoverContent = hovers[i].querySelector('.hover-content');
        if (hoverContent) {
          hoverContent.addEventListener('mouseenter', (e) => {
            // Cancel any pending hide timer when entering hover content
            const parentHover = e.currentTarget.closest('.hover');
            if (parentHover) {
              const timerId = this.hideTimers.get(parentHover);
              if (timerId) {
                clearTimeout(timerId);
                this.hideTimers.delete(parentHover);
              }
            }
          });
          hoverContent.addEventListener('mouseleave', (e) => {
            // Start a delay before hiding when leaving hover content
            const parentHover = e.currentTarget.closest('.hover');
            if (parentHover) {
              this.scheduleHide(parentHover);
            }
          });
        }
      }
    }
    
    closeAllHovers() {
      // Clear all pending hide timers
      this.hideTimers.forEach((timerId, hoverElement) => {
        clearTimeout(timerId);
      });
      this.hideTimers.clear();
      
      var hovers = document.getElementsByClassName("hover");
      for (var i = 0; i < hovers.length; i++) {
        // Skip menu items
        if (!hovers[i].closest('.mobile-menu')) {
          this.desHoverMe(hovers[i]);
        }
      }
      this.activeHover = null;
    }

    // Helper to optimize video/image display in hover content
    optimizeMediaInHoverContent(hoverContent) {
      // Find all images and videos in the hover content
      const images = hoverContent.querySelectorAll('img');
      const videos = hoverContent.querySelectorAll('video');
      
      // Process images
      images.forEach(img => {
        // Make images responsive while preserving aspect ratio
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        
        // Add pointer-events to allow scrolling through the image
        img.style.pointerEvents = 'none';
      });
      
      // Process videos
      videos.forEach(video => {
        // Make videos responsive while preserving aspect ratio
        video.style.maxWidth = '100%';
        video.style.height = 'auto';
        video.style.display = 'block';
        
        // Add pointer-events to allow scrolling through the video
        video.style.pointerEvents = 'none';
        
        // If there's a poster, make sure it maintains aspect ratio
        if (video.hasAttribute('poster')) {
          const poster = video.getAttribute('poster');
          if (poster) {
            // Create a mock image to check the actual dimensions
            const img = new Image();
            img.onload = function() {
              // Set an aspect ratio based on the poster dimensions
              const aspectRatio = (this.height / this.width) * 100;
              video.style.aspectRatio = `${this.width} / ${this.height}`;
            };
            img.src = poster;
          }
        }
      });
    }
  
	HoverMe(el) {
	  // Close all other hovers immediately when opening a new one
	  var allHovers = document.getElementsByClassName("hover");
	  for (var i = 0; i < allHovers.length; i++) {
	    if (allHovers[i] !== el && !allHovers[i].closest('.mobile-menu')) {
	      // Clear any pending timer for this hover
	      const timerId = this.hideTimers.get(allHovers[i]);
	      if (timerId) {
	        clearTimeout(timerId);
	        this.hideTimers.delete(allHovers[i]);
	      }
	      // Close it immediately
	      this.desHoverMe(allHovers[i]);
	    }
	  }
	  
	  // Get the hover content element
	  let hoverContent = el.querySelector('.hover-content');
	  if (!hoverContent) return;
	  
	  // Skip processing for menu items (volunteer and restaurant sections)
	  // These are handled separately in navigation-v3_0.js
	  if (el.closest('.mobile-menu')) {
	    return;
	  }
	  
	  // Skip special positioning for burger menu hovers
	  // Check if this hover is inside mobile-menu or belongs to the menu structure
	  const isMenuHover = el.closest('.mobile-menu') || 
	                      el.closest('.menu-item') || 
	                      el.closest('#offcanvas');
	  
	  if (isMenuHover) {
	    // Keep original behavior for menu hovers - DO NOT MODIFY THIS SECTION
	    hoverContent.style.position = "absolute";
	    hoverContent.style.display = "block";
	    hoverContent.style.visibility = "visible";
	    
	    // For mobile devices, ensure proper positioning
	    if (this.isMobileDevice()) {
	      // Use CSS for positioning instead of JavaScript
	      // The CSS has special mobile media queries
	    }
	    
	    // Add class to mark body and handle video
	    setTimeout(() => {
	      document.body.classList.add('hoveron');
	      let thisVideo = hoverContent.querySelector('video');
	      if (thisVideo) {
	        thisVideo.play();
	        thisVideo.setAttribute('id', 'videoplaying');
	      }
	    }, 200);
	    return;
	  }
	  
	  // Store reference to the active hover element
	  this.activeHover = el;
	  this.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
	  
	  // Get dimensions and position of trigger element and window
	  let triggerRect = el.getBoundingClientRect();
	  
	  // Reset any previous positioning styles for measurement
	  hoverContent.style.position = "fixed"; // Changed to fixed for viewport-relative positioning
	  hoverContent.style.visibility = "hidden";
	  hoverContent.style.display = "block";
	  
	  // Remove any previous mobile-specific styles
	  hoverContent.style.maxHeight = "";
	  hoverContent.style.overflowY = "";
	  hoverContent.style.overflowX = "";
	  hoverContent.style.webkitOverflowScrolling = "";
	  hoverContent.style.scrollbarWidth = "";
	  hoverContent.style.paddingRight = "";
	  hoverContent.style.bottom = "";
	  
	  // Get content dimensions after reset
	  let contentRect = hoverContent.getBoundingClientRect();
	  
	  // Calculate position relative to viewport
	  const viewportWidth = window.innerWidth;
	  const viewportHeight = window.innerHeight;
	  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
	  
	  // Start with default positions
	  let preferredLeft = triggerRect.left + triggerRect.width + 5; // 5px gap
	  let preferredTop = triggerRect.top;
	  const padding = 20; // Padding from viewport edges
	  
	  // Mobile overlay approach - fixed full-screen overlay
	  if (this.isMobileDevice()) {
	    // Apply mobile overlay positioning and scrolling
	    hoverContent.style.position = 'fixed';
	    hoverContent.style.setProperty('top', '50%', 'important');
	    hoverContent.style.setProperty('left', '50%', 'important');
	    hoverContent.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
	    hoverContent.style.width = 'calc(100vw - 24px)';
	    hoverContent.style.maxWidth = 'calc(100vw - 24px)';
	    const maxAllowedHeight = Math.floor(viewportHeight * 0.75); // Top 17% + Bottom 8%
	    hoverContent.style.setProperty('max-height', `${maxAllowedHeight}px`, 'important');
	    hoverContent.style.overflowY = 'scroll';
	    hoverContent.style.overflowX = 'hidden';
	    hoverContent.style.webkitOverflowScrolling = 'touch';
	    hoverContent.style.touchAction = 'pan-y';
	    hoverContent.style.overscrollBehavior = 'contain';
	    hoverContent.style.zIndex = '2147483646';
	    
	    // Keep centered by default, but constrain within top 17% / bottom 8% bounds
	    const adjustMobileOverlayPosition = () => {
	      const minTop = Math.floor(viewportHeight * 0.17);
	      const bottomReserved = Math.floor(viewportHeight * 0.08);
	      const contentHeight = hoverContent.getBoundingClientRect().height;
	      const desiredCenterY = Math.round(viewportHeight / 2);
	      const minCenterY = minTop + Math.round(contentHeight / 2);
	      const maxCenterY = viewportHeight - bottomReserved - Math.round(contentHeight / 2);
	      const clampedCenterY = Math.max(minCenterY, Math.min(desiredCenterY, maxCenterY));
	      hoverContent.style.setProperty('top', `${clampedCenterY}px`, 'important');
	    };
	    
	    // Show backdrop and prevent body scroll
	    if (this.backdrop) {
	      this.backdrop.classList.add('active');
	      this.backdrop.style.display = 'block';
	    }
	    
    // Lock body scroll - avoid setting height:100vh which causes Safari viewport jumps
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    this.enableMobileTouchMoveLock();
	    
	    // Temporarily disable clicks on links to prevent accidental activation
	    const links = hoverContent.querySelectorAll('a, button');
	    links.forEach(link => {
	      link.style.pointerEvents = 'none';
	    });
	    
	    // Re-enable link clicks and check for scrollable content after a delay
	    setTimeout(() => {
	      links.forEach(link => {
	        link.style.pointerEvents = 'auto';
	      });
	      
	      if (hoverContent.scrollHeight > hoverContent.clientHeight) {
	        hoverContent.classList.add('has-scroll');
	      } else {
	        hoverContent.classList.remove('has-scroll');
	      }
	      
	      // Re-evaluate after links/media settle
	      adjustMobileOverlayPosition();
	    }, 300);
	    
	    // Initial/early positioning passes for stable mobile layout
	    requestAnimationFrame(adjustMobileOverlayPosition);
	    setTimeout(adjustMobileOverlayPosition, 80);
	    setTimeout(adjustMobileOverlayPosition, 600);
	    
	    // Prevent touches inside overlay from bubbling back to parent .hover handlers.
	    if (!hoverContent.dataset.touchGuardBound) {
	      const stopBubble = (event) => {
	        event.stopPropagation();
	      };
	      hoverContent.addEventListener('touchstart', stopBubble, { passive: true });
	      hoverContent.addEventListener('touchmove', stopBubble, { passive: true });
	      hoverContent.dataset.touchGuardBound = 'true';
	    }
	    
	    // Optimize media elements (images/videos) in hover content
	    this.optimizeMediaInHoverContent(hoverContent);
	  } else {
	    // Desktop positioning (keep existing behavior)
	    // Check if would overflow right edge
	    if (preferredLeft + contentRect.width > viewportWidth - padding) {
	      // Try positioning to the left if it would overflow right
	      preferredLeft = triggerRect.left - contentRect.width - 5;
	      
	      // If that would also overflow left, center it horizontally
	      if (preferredLeft < padding) {
	        preferredLeft = Math.max(padding, Math.min(viewportWidth - contentRect.width - padding, 
	          triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2)));
	      }
	    }
	    
	    // Check vertical positioning
	    // If content is taller than trigger, try to center it vertically
	    if (contentRect.height > triggerRect.height) {
	      preferredTop = triggerRect.top - (contentRect.height - triggerRect.height) / 2;
	      
	      // Check if this would overflow top edge
	      if (preferredTop < padding) {
	        preferredTop = padding;
	      }
	      
	      // Check if this would overflow bottom edge
	      if (preferredTop + contentRect.height > viewportHeight - padding) {
	        preferredTop = viewportHeight - contentRect.height - padding;
	        
	        // If content is too tall for viewport, align to top with padding
	        if (preferredTop < padding) {
	          preferredTop = padding;
	          // Set a max-height to make it scrollable if needed
	          hoverContent.style.maxHeight = (viewportHeight - (padding * 2)) + "px";
	          hoverContent.style.overflowY = "auto";
	          
	          // Optimize media elements (images/videos) in hover content for desktop too
	          this.optimizeMediaInHoverContent(hoverContent);
	        }
	      }
	    }
	    
	    // Apply desktop positions
	    hoverContent.style.left = preferredLeft + "px";
	    hoverContent.style.top = preferredTop + "px";
	  }
	  
	  // Apply left position for all devices (if not already set)
	  if (!hoverContent.style.left) {
	    hoverContent.style.left = preferredLeft + "px";
	  }
	  
	  hoverContent.style.visibility = "visible";
	  
	  // Store a reference to this hover element in the content
	  hoverContent.setAttribute('data-parent-hover', true);
	  
	  // Add class to mark body and handle video
	  setTimeout(() => {
	    document.body.classList.add('hoveron');
	    let thisVideo = hoverContent.querySelector('video');
	    if (thisVideo) {
	      thisVideo.play();
	      thisVideo.setAttribute('id', 'videoplaying');
	    }
	  }, 200);
	}
	
    scheduleHide(el) {
      // Skip auto-hide on mobile devices - they use overlays with explicit close button
      if (this.isMobileDevice() && !el.closest('.mobile-menu')) {
        return;
      }
      
      // Clear any existing timer for this specific element
      const existingTimer = this.hideTimers.get(el);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      // Set a new timer with 300ms delay
      const timerId = setTimeout(() => {
        this.desHoverMe(el);
        this.hideTimers.delete(el);
      }, 300);
      
      this.hideTimers.set(el, timerId);
    }

    desHoverMe(el) {
      // Skip for menu items - should be handled by navigation js
      if (el.closest('.mobile-menu')) {
        return;
      }
      
      // Get the hover content element
      let hoverContent = el.querySelector('.hover-content');
      if (!hoverContent) return;
      
      // Hide backdrop and restore body scroll (mobile overlay)
      if (this.backdrop) {
        this.backdrop.classList.remove('active');
        // Force display none as additional safety
        this.backdrop.style.display = 'none';
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      this.disableMobileTouchMoveLock();
      
      // Remove scroll indicator class
      hoverContent.classList.remove('has-scroll');
      
      // Remove the scroll indicator if it exists
      const scrollIndicator = hoverContent.querySelector('.scroll-indicator');
      if (scrollIndicator) {
        hoverContent.removeChild(scrollIndicator);
      }
      
      // Hide the hover content immediately
      hoverContent.style.display = "none";
      
      setTimeout(() => {
        let thisBody = document.body;
        let videoplaying = document.getElementById('videoplaying');
        if(videoplaying && videoplaying!=''){
          videoplaying.pause();
          videoplaying.removeAttribute('id');
        }
        thisBody.classList.remove('hoveron');
      }, 200);
    }
  }
  
  // Initialize the instance
  const person1 = new Hovers();