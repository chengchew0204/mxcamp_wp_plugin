class Hovers {

    constructor() {
      this.init();
      this.activeHover = null;
      this.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      this.hideTimers = new Map(); // Store timers per hover element
      
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
        // If we have an open hover and the touch target is not inside it or its content,
        // close all hovers when user touches and drags elsewhere on the page
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
	  
	  // Special positioning for mobile devices to ensure highlight isn't hidden
	  if (this.isMobileDevice()) {
		const mobileSpacingAbove = 0;   // Gap when content is above (matches below spacing)
	    const mobileSpacingBelow = -19;   // Gap when content is below for closest possible positioning
	    
	    // On mobile, position the hover content below the highlight instead of to the side
	    preferredLeft = triggerRect.left;
	    preferredTop = triggerRect.bottom + mobileSpacingBelow; // Negative gap for overlap with highlight
	    
	    // Check if it would overflow right edge on mobile
	    if (preferredLeft + contentRect.width > viewportWidth - padding) {
	      // Center it under the highlight if possible
	      preferredLeft = Math.max(padding, Math.min(viewportWidth - contentRect.width - padding, 
	        triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2)));
	    }
	    
	        // Handle scrolling for mobile devices
    // Maximum height is 80% of viewport to allow more content visibility
    const maxContentHeight = Math.floor(viewportHeight * 0.8); 
	    
	    // Check if we should position above or below the trigger
	    const positionAbove = triggerRect.top > viewportHeight / 2; // Position above if in bottom half of screen
	    
	    if (positionAbove) {
	      // Position above the trigger with fixed height
	      hoverContent.style.bottom = (viewportHeight - triggerRect.top) + "px"; // No gap
	      hoverContent.style.top = "auto";
	      hoverContent.style.maxHeight = maxContentHeight + "px";
	    } else {
	      // Position below the trigger with fixed height
	      hoverContent.style.top = preferredTop + "px";
	      hoverContent.style.bottom = "auto";
	      hoverContent.style.maxHeight = maxContentHeight + "px";
	    }
	    
	    // Always apply scrolling styles for mobile
	    hoverContent.style.overflowY = "auto";
	    hoverContent.style.overflowX = "hidden";
	    hoverContent.style.webkitOverflowScrolling = "touch"; // Smooth scrolling on iOS
	    hoverContent.style.scrollbarWidth = "thin";
	    hoverContent.style.paddingRight = "10px"; // Add padding for better readability
	    
        // Add specific CSS to improve scrolling functionality
        hoverContent.style.touchAction = "pan-y"; // Enable vertical touch scrolling
        
        // Create a wrapper for content if it doesn't exist
        let contentWrapper = hoverContent.querySelector('.hover-content-wrapper');
        if (!contentWrapper) {
          // Temporarily store the original content
          const originalContent = hoverContent.innerHTML;
          
          // Create a wrapper div
          contentWrapper = document.createElement('div');
          contentWrapper.className = 'hover-content-wrapper';
          contentWrapper.style.width = '100%';
          contentWrapper.style.height = '100%';
          contentWrapper.style.overflow = 'auto';
          contentWrapper.style.webkitOverflowScrolling = 'touch';
          contentWrapper.style.touchAction = 'pan-y';
          
          // Clear the original content and append the wrapper
          hoverContent.innerHTML = '';
          hoverContent.appendChild(contentWrapper);
          
          // Restore the original content inside the wrapper
          contentWrapper.innerHTML = originalContent;
        }

        // Optimize media elements (images/videos) in hover content
        this.optimizeMediaInHoverContent(contentWrapper || hoverContent);
	    
	    // Add visual cue for scrollability when content exceeds the container
	    if (contentRect.height > maxContentHeight) {
	      const scrollIndicator = document.createElement('div');
	      scrollIndicator.className = 'scroll-indicator';
	      scrollIndicator.style.position = 'absolute';
	      scrollIndicator.style.bottom = '5px';
	      scrollIndicator.style.right = '10px';
	      scrollIndicator.style.width = '4px';
	      scrollIndicator.style.height = '20px';
	      scrollIndicator.style.background = 'rgba(0,0,0,0.3)';
	      scrollIndicator.style.borderRadius = '2px';
	      scrollIndicator.style.zIndex = '999';
	      
	      // Only add the indicator if it doesn't already exist
	      if (!hoverContent.querySelector('.scroll-indicator')) {
	        hoverContent.appendChild(scrollIndicator);
	      }
	    }
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