class VideoSound {
  constructor() {
    // Variables globales
    this.scrollTimer = null;
    this.currentVideo = null; // Référence à la vidéo actuellement en lecture
    this.slider = document.getElementById('slides');
    this.footer = document.getElementById('footer');
    this.visibleDivId = null;
    this.videoIsMuted = true;
    this.loadedVideos = new Set(); // Track which videos have been loaded
    this.initialLoad = true; // Flag to track initial page load
    this.videoSpinners = new Map(); // Track video loading spinners
    this.init();
  }

  // Initialisation de la navigation
  init() {
    this.handleScroll();
    this.setupIntersectionObserver();
    this.setupLazyLoading();
    
    // Clean up any existing play buttons first
    this.removePlayButton();
    document.body.classList.remove('bgvideo');
    
    // Set up periodic cleanup to ensure sound buttons don't persist where they shouldn't
    this.setupPeriodicCleanup();
    
    // Aggressively preload and prepare videos for immediate playback
    this.preloadAllVideos();
    
    // Set initial load to false much sooner for faster video activation
    setTimeout(() => {
      this.initialLoad = false;
      // Immediately try to play the first visible video
      this.playInitialVisibleVideo();
      // Initialize sound button state based on current slide
      this.updateSoundButtonState();
    }, 200);
  }
  
  // Set up periodic cleanup to ensure sound buttons don't persist incorrectly
  setupPeriodicCleanup() {
    // Check every 2 seconds if sound button is where it shouldn't be
    setInterval(() => {
      const playButton = document.getElementById('playbutton');
      const hasBgVideo = document.body.classList.contains('bgvideo');
      
      if ((playButton || hasBgVideo) && this.visibleDivId) {
        const shouldShow = this.shouldSlideShowSoundButton(this.visibleDivId);
        const isCardOpen = this.isCardOpen();
        
        // If sound button exists but shouldn't, or if card is open, remove it
        if (!shouldShow || isCardOpen) {
          console.log(`PERIODIC CLEANUP: Removing sound button from slide "${this.visibleDivId}" (shouldShow: ${shouldShow}, cardOpen: ${isCardOpen})`);
          this.removePlayButton();
          document.body.classList.remove('bgvideo');
        }
      }
    }, 2000); // Check every 2 seconds
  }
  
  // Aggressively preload ALL videos for immediate playback
  preloadAllVideos() {
    // Shorter delay for faster activation
    setTimeout(() => {
      // Preload ALL videos, not just visible ones
      this.slider.querySelectorAll('.thefrontvideo').forEach(video => {
        // Set additional attributes for faster loading first
        video.setAttribute('preload', 'auto');
        video.setAttribute('playsinline', 'true');
        
        // Now preload with spinner
        this.preloadVideo(video);
        console.log('Aggressively preloaded video with spinner');
      });
      
      // Also identify the initially visible slide
      this.updateVisibleSlideInfo();
    }, 100);
  }
  
  // Play the initial visible video immediately after preload
  playInitialVisibleVideo() {
    const visibleSlide = document.getElementById(this.visibleDivId);
    if (visibleSlide) {
      const video = visibleSlide.querySelector('.thefrontvideo');
      if (video) {
        this.playVideoImmediately(video);
        console.log('Playing initial video on slide:', this.visibleDivId);
      }
    }
  }
  
  // Helper function to play a video immediately
  playVideoImmediately(video) {
    if (!video || this.isCardOpen()) return;
    
    // Allow video playback even during initial load for immediate activation
    // Only skip if explicitly paused by user or card is open
    
    // Always show loading spinner first - videos often take time to load
    this.showVideoSpinner(video);
    console.log('Video loading spinner shown for readyState:', video.readyState);
    
    // Set up event listeners for video loading states with more reliable cleanup
    const hideSpinnerAndCleanup = () => {
      console.log('Video ready - hiding spinner and cleaning up listeners');
      this.hideVideoSpinner(video);
      // Clean up all listeners
      video.removeEventListener('canplay', hideSpinnerAndCleanup);
      video.removeEventListener('canplaythrough', hideSpinnerAndCleanup);
      video.removeEventListener('loadeddata', hideSpinnerAndCleanup);
      video.removeEventListener('playing', hideSpinnerAndCleanup);
      video.removeEventListener('error', hideSpinnerAndCleanup);
    };
    
    // Listen for video ready events
    video.addEventListener('canplay', hideSpinnerAndCleanup, { once: true });
    video.addEventListener('canplaythrough', hideSpinnerAndCleanup, { once: true });
    video.addEventListener('loadeddata', hideSpinnerAndCleanup, { once: true });
    video.addEventListener('playing', hideSpinnerAndCleanup, { once: true });
    video.addEventListener('error', hideSpinnerAndCleanup, { once: true });
    
    // Ensure video has preload set to auto
    video.preload = "auto";
    
    // Try to play the video
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Video play() promise resolved successfully');
        })
        .catch(err => {
          console.error('Error playing video:', err);
          
          // Try again with muted option, as browsers allow autoplay for muted videos
          if (!video.muted) {
            console.log('Retrying with muted video...');
            video.muted = true;
            const mutedPlayPromise = video.play();
            
            if (mutedPlayPromise !== undefined) {
              mutedPlayPromise
                .then(() => {
                  console.log('Video playing muted due to autoplay restrictions');
                })
                .catch(innerErr => {
                  console.error('Still cannot play video even when muted:', innerErr);
                  this.hideVideoSpinner(video);
                });
            }
          } else {
            this.hideVideoSpinner(video);
          }
        });
    } else {
      console.log('Video play() returned undefined - older browser');
    }
  }

  // Setup lazy loading for videos
  setupLazyLoading() {
    // Pre-load only the first visible video
    setTimeout(() => {
      const firstVideo = document.querySelector('.thefrontvideo');
      if (firstVideo) {
        this.preloadVideo(firstVideo);
      }
    }, 100);
  }

  // Preload a video to improve initial playback speed
  preloadVideo(video) {
    if (!video || this.loadedVideos.has(video)) return;
    
    // Don't show spinner during preload - only during actual play attempts
    // This prevents conflicts with the playVideoImmediately spinner
    console.log('Preloading video for readyState:', video.readyState);
    
    // Set preload attribute to auto
    video.preload = "auto";
    
    // Mark as loaded
    this.loadedVideos.add(video);
    
    console.log('Video preloaded');
  }

  // Create video loading spinner for a specific video
  createVideoSpinner(video) {
    if (!video) {
      console.error('Cannot create spinner - no video provided');
      return;
    }
    
    if (this.videoSpinners.has(video)) {
      console.log('Spinner already exists for this video');
      return this.videoSpinners.get(video);
    }
    
    const slide = video.closest('.slide_10');
    if (!slide) {
      console.error('Cannot create spinner - video not inside slide_10');
      return;
    }
    
    // Create spinner container
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'video-loading-spinner';
    
    // Create spinner element
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    spinnerContainer.appendChild(spinner);
    slide.appendChild(spinnerContainer);
    
    // Store reference
    this.videoSpinners.set(video, spinnerContainer);
    
    console.log('Video loading spinner created for slide:', slide.id);
    return spinnerContainer;
  }

  // Show video loading spinner
  showVideoSpinner(video) {
    if (!video) return;
    
    let spinner = this.videoSpinners.get(video);
    if (!spinner) {
      spinner = this.createVideoSpinner(video);
    }
    
    if (spinner) {
      spinner.classList.remove('hide');
      spinner.style.display = 'block';
      spinner.style.opacity = '1';
      const slide = video.closest('.slide_10');
      console.log('Video loading spinner shown for slide:', slide ? slide.id : 'unknown');
      
      // Safety timeout to hide spinner if video events don't fire
      setTimeout(() => {
        if (spinner && !spinner.classList.contains('hide')) {
          console.log('Safety timeout: hiding video spinner after 10 seconds');
          this.hideVideoSpinner(video);
        }
      }, 10000);
      
    } else {
      console.error('Failed to show video spinner - spinner not created');
    }
  }

  // Hide video loading spinner
  hideVideoSpinner(video) {
    if (!video) return;
    
    const spinner = this.videoSpinners.get(video);
    if (spinner) {
      spinner.classList.add('hide');
      // Remove after transition
      setTimeout(() => {
        if (spinner.classList.contains('hide')) {
          spinner.style.display = 'none';
        }
      }, 300);
      console.log('Video loading spinner hidden');
    }
  }

  // Remove video loading spinner
  removeVideoSpinner(video) {
    if (!video) return;
    
    const spinner = this.videoSpinners.get(video);
    if (spinner && spinner.parentNode) {
      spinner.parentNode.removeChild(spinner);
      this.videoSpinners.delete(video);
      console.log('Video loading spinner removed');
    }
  }

  // Pause all videos and reset their playback position
  pauseAndResetAllVideos() {
    const videos = document.querySelectorAll('.thefrontvideo');
    videos.forEach(video => {
      try {
        // First pause the video
        video.pause();
        
        // Then reset its playback position to the beginning
        video.currentTime = 0;
        
        // Hide any loading spinner
        this.hideVideoSpinner(video);
        
        console.log('Video stopped and reset to beginning');
      } catch (err) {
        console.error('Error resetting video:', err);
      }
    });
  }

  // Pause a specific video and reset its playback position
  pauseAndResetVideo(video) {
    if (!video) return;
    
    try {
      // First pause the video
      video.pause();
      
      // Then reset its playback position to the beginning
      video.currentTime = 0;
      
      // Hide any loading spinner
      this.hideVideoSpinner(video);
      
      console.log('Video stopped and reset to beginning');
    } catch (err) {
      console.error('Error resetting video:', err);
    }
  }

  // Gestionnaire d'événements de défilement
  handleScroll() {
    // Track scroll state
    let isScrolling = false;
    let lastScrollTop = this.slider.scrollTop;
    
    this.slider.addEventListener('scroll', () => {
      // User has scrolled, so we're no longer in initial load state
      this.initialLoad = false;
      
      // Get current scroll position
      const currentScrollTop = this.slider.scrollTop;
      
      // Check if we've scrolled significantly (more than 50px)
      const hasScrolledSignificantly = Math.abs(currentScrollTop - lastScrollTop) > 50;
      
      // Only execute pause logic once when scrolling starts
      if (!isScrolling || hasScrolledSignificantly) {
        isScrolling = true;
        lastScrollTop = currentScrollTop;
        
        // Force stop ALL videos and reset to beginning
        this.pauseAndResetAllVideos();
        
        // Coupe le son de la vidéo actuelle si elle est en cours de lecture
        if (this.currentVideo) {
          this.currentVideo.muted = true;
          this.currentVideo = null; // Réinitialise la vidéo actuelle
        }
      }
      
      // Reset timer on each scroll event
      clearTimeout(this.scrollTimer);
      
      // Set a new timer
      this.scrollTimer = setTimeout(() => {
        // Scrolling has stopped
        isScrolling = false;
        this.handleScrollStop();
      }, 150);
    });
  }

  // Fonction appelée lorsque le défilement s'arrête
  handleScrollStop() {
    // Ensure all videos are stopped and reset to beginning
    this.pauseAndResetAllVideos();
    
    // Then mute all videos
    this.muteAllVideos();
    
    // Clear current video reference before updating slide info
    this.currentVideo = null;
    
    // Update the visible slide info (this will also update sound button state)
    this.updateVisibleSlideInfo();
    
    // Find the visible video and play only that one
    var visibleid = document.getElementById(this.visibleDivId);
    if (visibleid) {
      this.checkForVideo(visibleid);
      
      // Play only the video in the visible slide (from the beginning)
      const video = visibleid.querySelector('.thefrontvideo');
      if (video) {
        this.playVideoImmediately(video);
      }
    }
  }
  
  // Update which slide is currently visible
  updateVisibleSlideInfo() {
    // Find the most visible slide
    let maxVisibleArea = 0;
    let mostVisibleSlide = null;
    
    this.slider.querySelectorAll('.slide_10').forEach(slide => {
      const rect = slide.getBoundingClientRect();
      
      // Calculate how much of the slide is visible in the viewport
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
      
      // If both dimensions are positive, calculate visible area
      if (visibleHeight > 0 && visibleWidth > 0) {
        const visibleArea = visibleHeight * visibleWidth;
        
        // If this slide has more visible area than the previous max, update
        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          mostVisibleSlide = slide;
        }
      }
    });
    
    // Update the visible slide ID if we found one
    if (mostVisibleSlide) {
      const previousVisibleId = this.visibleDivId;
      this.visibleDivId = mostVisibleSlide.id;
      console.log('Most visible slide:', this.visibleDivId);
      
      // Update sound button state when visible slide changes
      if (previousVisibleId !== this.visibleDivId) {
        this.updateSoundButtonState();
      }
    }
  }
  
  // Update sound button state based on currently visible slide
  updateSoundButtonState() {
    if (!this.visibleDivId) {
      console.log('No visible slide ID, hiding sound button');
      this.removePlayButton();
      document.body.classList.remove('bgvideo');
      return;
    }
    
    const shouldShowSoundButton = this.shouldSlideShowSoundButton(this.visibleDivId);
    
    console.log(`updateSoundButtonState: slide="${this.visibleDivId}", shouldShow=${shouldShowSoundButton}`);
    
    if (shouldShowSoundButton) {
      document.body.classList.add('bgvideo');
      // Show the sound button immediately for designated slides
      this.addPlayButton();
      console.log('Sound button should be visible for slide:', this.visibleDivId);
    } else {
      this.removePlayButton();
      document.body.classList.remove('bgvideo');
      console.log('Sound button hidden for slide:', this.visibleDivId);
    }
  }

  muteAllVideos() {
      const videos = document.querySelectorAll('.thefrontvideo');
	  
      videos.forEach(video => {
           video.muted = true;
      }); 
  }

  // Configuration de l'observateur d'intersection
  setupIntersectionObserver() {
    const options = {
      root: this.slider, // Utilise l'élément slider comme root
      rootMargin: '-10% 0px', // More aggressive margin to detect leaving viewport
      threshold: [0.05, 0.1, 0.3, 0.5] // More granular thresholds
    };

    const observer = new IntersectionObserver(this.handleIntersect.bind(this), options);

    this.slider.querySelectorAll('.slide_10').forEach(div => {
      observer.observe(div);
    });
  }

  // Gestionnaire d'événements d'intersection
  handleIntersect(entries, observer) {
    // First, pause and reset videos in slides that are no longer visible
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.1) {
        const video = entry.target.querySelector('.thefrontvideo');
        if (video && !video.paused) {
          // Stop video and reset to beginning
          this.pauseAndResetVideo(video);
        }
      }
    });
    
    // Then, play only the most visible video
    entries.forEach(entry => {
      // Find the video inside the slide
      const video = entry.target.querySelector('.thefrontvideo');
      
      if (!video) return;
      
      // Check if the video element is actually visible in the viewport
      const videoRect = video.getBoundingClientRect();
      const isVideoVisible = (
        videoRect.top < window.innerHeight &&
        videoRect.bottom > 0 &&
        videoRect.left < window.innerWidth &&
        videoRect.right > 0
      );
      
      // Calculate visibility percentage
      const visibleHeight = Math.min(videoRect.bottom, window.innerHeight) - Math.max(videoRect.top, 0);
      const visibleWidth = Math.min(videoRect.right, window.innerWidth) - Math.max(videoRect.left, 0);
      const totalArea = videoRect.width * videoRect.height;
      const visibleArea = visibleHeight * visibleWidth;
      const visibilityPercentage = (totalArea > 0) ? (visibleArea / totalArea) : 0;
      
      // Get intersection ratio to determine how much of element is visible
      const ratio = entry.intersectionRatio || 0;
      
      // Play if moderately visible (lowered threshold for faster activation)
      if (entry.isIntersecting && isVideoVisible && (ratio >= 0.3 || visibilityPercentage >= 0.4)) {
        // Stocke l'ID de la div visible dans visibleDivId
        const previousVisibleId = this.visibleDivId;
        this.visibleDivId = entry.target.id;
        
        // Update all other slides before playing this one
        this.updateVisibleSlideInfo();
        
        // Only play if this is STILL the most visible slide after update
        if (this.visibleDivId === entry.target.id) {
          // Preload the video
          this.preloadVideo(video);
          
          // Preload the next video if possible
          const nextSlide = entry.target.nextElementSibling;
          if (nextSlide) {
            const nextVideo = nextSlide.querySelector('.thefrontvideo');
            if (nextVideo) {
              this.preloadVideo(nextVideo);
            }
          }
          
          // Play the video immediately when it becomes visible (removed initial load restriction)
          this.playVideoImmediately(video);
          
          this.checkForVideo(entry.target);
          
          // Update sound button state if visible slide changed
          if (previousVisibleId !== this.visibleDivId) {
            this.updateSoundButtonState();
          }
        } else {
          // This is not the most visible slide, stop the video and reset
          this.pauseAndResetVideo(video);
        }
      } else if (video) {
        // Pause video when it leaves the viewport and reset to beginning
        this.pauseAndResetVideo(video);
      }
    });
  }


  // Helper method to check if a card is open
  isCardOpen() {
    return document.body.classList.contains('bodycardopened');
  }

  // Helper method to check if a slide should show the sound button
  shouldSlideShowSoundButton(slideId) {
    const slidesWithSoundButton = [
      'calendario', 'calendar',
      'nosotrxs', 'about', 
      'restaurant', 'restaurante'
    ];
    return slidesWithSoundButton.includes(slideId);
  }
  
  // Method to be called when cards are opened or closed
  onCardStateChange() {
    if (this.isCardOpen()) {
      // Card is open, hide sound button
      this.removePlayButton();
      document.body.classList.remove('bgvideo');
      console.log('Card opened - sound button hidden');
    } else {
      // Card is closed - AGGRESSIVE cleanup to ensure sound button only appears on designated slides
      console.log('Card closed - performing aggressive cleanup');
      
      // Step 1: Force remove ALL sound buttons and clear state
      this.forceCleanupSoundButton();
      
      // Step 2: Wait a moment then check if we should show sound button
      setTimeout(() => {
        this.updateSoundButtonState();
      }, 50);
    }
  }
  
  // Aggressive cleanup method to ensure sound button is completely removed
  forceCleanupSoundButton() {
    console.log('=== Force Cleanup Sound Button ===');
    
    // Remove ALL play buttons from DOM
    const allPlayButtons = document.querySelectorAll('#playbutton');
    allPlayButtons.forEach(btn => btn.remove());
    
    // Remove bgvideo class
    document.body.classList.remove('bgvideo', 'unmuted');
    
    // Clear video references
    this.currentVideo = null;
    
    // Remove any video event listeners that might re-add the button
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
      if (video._timeupdateHandler) {
        video.removeEventListener('timeupdate', video._timeupdateHandler);
        video._timeupdateHandler = null;
      }
    });
    
    console.log('Aggressive cleanup complete - all sound buttons removed');
  }

  // Check if slide should show sound button and handle video if present
  checkForVideo(element) {
    if (!element) return;
    
    const slideId = element.id;
    const shouldShowSoundButton = this.shouldSlideShowSoundButton(slideId);
    
    console.log(`checkForVideo called for slide: ${slideId}, shouldShow: ${shouldShowSoundButton}`);
    
    // ONLY handle video logic for slides that should show sound button
    // Completely ignore videos on non-designated slides
    if (shouldShowSoundButton) {
    const video = element.querySelector('.thefrontvideo');
      
    if (video) {
      this.currentVideo = video; // Définit la vidéo actuelle
	  var playButtonAdded = false;
	  var that = this;
	  
	  // Remove any existing timeupdate listeners to avoid duplicates
	  video.removeEventListener('timeupdate', video._timeupdateHandler);
	  
	  // Create a new timeupdate handler
	  video._timeupdateHandler = function() {
        if (video.currentTime >= 0.5 && playButtonAdded == false) {
            that.addPlayButton(video);
			playButtonAdded = true;
        }
      };
	  
	  // Add the new handler
	  video.addEventListener('timeupdate', video._timeupdateHandler);
	  
      if(this.videoIsMuted === false){
        video.muted = false;
        }
      }
      
      // Only update sound button state if this is the currently visible slide
      if (this.visibleDivId === slideId) {
        document.body.classList.add('bgvideo');
        // Show the sound button immediately for designated slides
        this.addPlayButton(video);
        console.log('Sound button enabled for designated slide:', slideId);
      }
    } else {
      // For non-designated slides, NEVER show sound button regardless of video presence
      if (this.visibleDivId === slideId) {
      this.removePlayButton();
        document.body.classList.remove('bgvideo');
        console.log('Sound button DISABLED for non-designated slide:', slideId);
      }
      
      // Clear currentVideo if it was from this non-designated slide
      if (this.currentVideo && this.currentVideo.closest('.slide_10') === element) {
        this.currentVideo = null;
        console.log('Cleared video reference for non-designated slide:', slideId);
      }
    }
  }

  // Ajoute un bouton de lecture du son de la vidéo
  addPlayButton(video = null) {
    // SAFETY CHECK: Only add sound button if we're on a designated slide
    if (!this.visibleDivId || !this.shouldSlideShowSoundButton(this.visibleDivId)) {
      console.log(`BLOCKED: Attempted to add sound button on non-designated slide: ${this.visibleDivId}`);
      return; // Don't add the button
    }
    
    // SAFETY CHECK: Don't add button if card is open
    if (this.isCardOpen()) {
      console.log('BLOCKED: Attempted to add sound button while card is open');
      return;
    }
    
    console.log(`ALLOWED: Adding sound button for designated slide: ${this.visibleDivId}`);
    
    this.removePlayButton(); // Supprime le bouton existant avant d'en ajouter un nouveau
    const playButton = document.createElement('div');
    playButton.id = 'playbutton';
    const playIcon = document.createElement('img');
    //playIcon.src = 'https://camp.mx/wp-content/uploads/soundwave.gif'; 
    playIcon.src = this.videoIsMuted ? 'https://camp.mx/wp-content/uploads/soundwave.gif' : 'https://camp.mx/wp-content/uploads/sound-wave.gif'; 
    playButton.appendChild(playIcon);
    playButton.addEventListener('click', () => {
      this.videoIsMuted = !this.videoIsMuted
      
      // If there's a current video, mute/unmute it
      if (video) {
      video.muted = this.videoIsMuted;
      } else if (this.currentVideo) {
        this.currentVideo.muted = this.videoIsMuted;
      }
      
      playIcon.src = this.videoIsMuted ? 'https://camp.mx/wp-content/uploads/soundwave.gif' : 'https://camp.mx/wp-content/uploads/sound-wave.gif'; 
      
      if(!this.videoIsMuted){
        document.body.classList.add('unmuted')
        playIcon.src = 'https://camp.mx/wp-content/uploads/sound-wave.gif';
        console.log('bodyunmuted et change sound')
      }else{
        document.body.classList.remove('unmuted')
      }
    });
    /*if(!this.videoIsMuted){
      playIcon.src = 'https://camp.mx/wp-content/uploads/sound-wave.gif';
      console.log('bodyunmuted et change sound')
    }*/
    this.footer.appendChild(playButton);
    console.log('playbutton ajoute for slide:', this.visibleDivId);
  }

  // Supprime le bouton de lecture du son
  removePlayButton() {
    // Remove all play buttons (in case there are duplicates)
    const allPlayButtons = document.querySelectorAll('#playbutton');
    allPlayButtons.forEach(btn => {
      btn.remove();
      console.log('playbutton removed');
    });
    
    if (allPlayButtons.length > 0) {
      console.log(`Removed ${allPlayButtons.length} play button(s)`);
    }
  }

  // Debug function to test video spinner visibility
  testVideoSpinner() {
    console.log('=== Testing Video Spinner ===');
    const videos = document.querySelectorAll('.thefrontvideo');
    console.log('Found videos:', videos.length);
    
    if (videos.length > 0) {
      const firstVideo = videos[0];
      const slide = firstVideo.closest('.slide_10');
      console.log('Testing spinner on slide:', slide ? slide.id : 'unknown');
      
      // Show spinner for 5 seconds
      this.showVideoSpinner(firstVideo);
      console.log('Spinner should now be visible on the first video slide');
      
      setTimeout(() => {
        this.hideVideoSpinner(firstVideo);
        console.log('Spinner hidden after 5 seconds');
      }, 5000);
    } else {
      console.log('No videos found to test spinner on');
    }
  }

  // Debug function to diagnose video playback issues
  debugVideoPlayback() {
    console.log('=== Debugging Video Playback ===');
    const videos = document.querySelectorAll('.thefrontvideo');
    console.log('Total videos found:', videos.length);
    
    videos.forEach((video, index) => {
      const slide = video.closest('.slide_10');
      console.log(`Video ${index + 1}:`);
      console.log('  - Slide ID:', slide ? slide.id : 'unknown');
      console.log('  - Video src:', video.src || video.currentSrc || 'no source');
      console.log('  - Ready state:', video.readyState);
      console.log('  - Paused:', video.paused);
      console.log('  - Muted:', video.muted);
      console.log('  - Preload:', video.preload);
      console.log('  - Autoplay:', video.autoplay);
      console.log('  - Current time:', video.currentTime);
      console.log('  - Duration:', video.duration);
      console.log('  - Network state:', video.networkState);
      console.log('  - Error:', video.error);
      console.log('  - Card opened:', this.isCardOpen());
      console.log('  ---');
    });
    
    console.log('Current visible div ID:', this.visibleDivId);
    console.log('Is initial load:', this.initialLoad);
  }

  // Debug function to manually try playing a video
  forcePlayVideo() {
    console.log('=== Force Playing First Video ===');
    const videos = document.querySelectorAll('.thefrontvideo');
    if (videos.length > 0) {
      const firstVideo = videos[0];
      console.log('Attempting to force play first video...');
      this.playVideoImmediately(firstVideo);
    } else {
      console.log('No videos found to force play');
    }
  }
  
  // Debug function to check current sound button state
  debugSoundButtonState() {
    console.log('=== Sound Button Debug ===');
    console.log('Current visible slide ID:', this.visibleDivId);
    console.log('Should show sound button:', this.shouldSlideShowSoundButton(this.visibleDivId));
    console.log('Body has bgvideo class:', document.body.classList.contains('bgvideo'));
    console.log('Play button exists:', !!document.getElementById('playbutton'));
    console.log('Is card open:', this.isCardOpen());
    console.log('Current video:', this.currentVideo);
    
    const visibleSlide = document.getElementById(this.visibleDivId);
    if (visibleSlide) {
      console.log('Visible slide has video:', !!visibleSlide.querySelector('.thefrontvideo'));
    }
    
    // Check if there are any stale play buttons
    const allPlayButtons = document.querySelectorAll('#playbutton');
    console.log('Total play buttons in DOM:', allPlayButtons.length);
    if (allPlayButtons.length > 1) {
      console.warn('Multiple play buttons detected! Cleaning up...');
      // Remove all but the last one
      for (let i = 0; i < allPlayButtons.length - 1; i++) {
        allPlayButtons[i].remove();
      }
    }
  }
  
  // Force remove all play buttons and reset state
  forceResetSoundButton() {
    console.log('=== Force Resetting Sound Button ===');
    
    // Remove all play buttons
    const allPlayButtons = document.querySelectorAll('#playbutton');
    allPlayButtons.forEach(btn => btn.remove());
    console.log('Removed', allPlayButtons.length, 'play buttons');
    
    // Remove bgvideo class
    document.body.classList.remove('bgvideo');
    
    // Clear current video reference
    this.currentVideo = null;
    
    // Update state based on current slide
    this.updateSoundButtonState();
    
    console.log('Sound button state reset complete');
  }
  
  // Method specifically for cleaning up after meditation card closes
  onMeditationCardClosed(slideId) {
    console.log('=== Meditation Card Closed Cleanup ===');
    console.log('Slide ID:', slideId);
    
    // Force remove all sound buttons
    this.removePlayButton();
    document.body.classList.remove('bgvideo');
    
    // Clear any video references
    this.currentVideo = null;
    
    // Verify the slide shouldn't show sound button
    const shouldShow = this.shouldSlideShowSoundButton(slideId);
    console.log(`Meditation slide "${slideId}" should show sound button: ${shouldShow}`);
    
    if (shouldShow) {
      console.warn('WARNING: Meditation slide is in designated list! This should not happen.');
    }
    
    // Double-check cleanup worked
    setTimeout(() => {
      const playButton = document.getElementById('playbutton');
      const hasBgVideo = document.body.classList.contains('bgvideo');
      
      if (playButton || hasBgVideo) {
        console.warn('Sound button cleanup failed, forcing removal...');
        this.removePlayButton();
        document.body.classList.remove('bgvideo');
      } else {
        console.log('Meditation card cleanup successful - no sound button');
      }
    }, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Make VideoSound instance globally accessible
  window.videoSound = new VideoSound();
});