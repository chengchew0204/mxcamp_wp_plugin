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
    this.init();
  }

  // Initialisation de la navigation
  init() {
    this.handleScroll();
    this.setupIntersectionObserver();
    this.setupLazyLoading();
    
    // Don't automatically play videos on page load
    // Instead, wait for first user scroll or interaction
    this.preloadVisibleVideos();
    
    // Set initial load to false after a delay
    setTimeout(() => {
      this.initialLoad = false;
    }, 1000);
  }
  
  // Preload visible videos without playing them on initial load
  preloadVisibleVideos() {
    // Short delay to ensure DOM is fully processed
    setTimeout(() => {
      // Find all visible slides
      this.slider.querySelectorAll('.slide_10').forEach(slide => {
        const rect = slide.getBoundingClientRect();
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        );
        
        if (isVisible) {
          // This is a visible slide
          const video = slide.querySelector('.thefrontvideo');
          if (video) {
            this.preloadVideo(video);
            this.visibleDivId = slide.id;
            console.log('Preloaded video on slide', slide.id);
          }
        }
      });
    }, 500);
  }
  
  // Helper function to play a video immediately
  playVideoImmediately(video) {
    if (!video || !video.paused || this.isCardOpen()) return;
    
    // Don't play video on initial page load
    if (this.initialLoad) {
      console.log('Skipping autoplay during initial page load');
      return;
    }
    
    // Ensure video has preload set to auto
    video.preload = "auto";
    
    // Try to play the video
    video.play()
      .then(() => {
        console.log('Video started playing automatically');
      })
      .catch(err => {
        console.error('Error playing video:', err);
        
        // Try again with muted option, as browsers allow autoplay for muted videos
        if (!video.muted) {
          video.muted = true;
          video.play()
            .then(() => {
              console.log('Video playing muted due to autoplay restrictions');
            })
            .catch(innerErr => {
              console.error('Still cannot play video even when muted:', innerErr);
            });
        }
      });
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
    
    // Set preload attribute to auto
    video.preload = "auto";
    
    // Mark as loaded
    this.loadedVideos.add(video);
    
    console.log('Video preloaded');
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
    
    // Update the visible slide info
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
      this.visibleDivId = mostVisibleSlide.id;
      console.log('Most visible slide:', this.visibleDivId);
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
      
      // Only play if HIGHLY visible (ratio >= 0.5 or visibility >= 70%)
      if (entry.isIntersecting && isVideoVisible && (ratio >= 0.5 || visibilityPercentage >= 0.7)) {
        // Stocke l'ID de la div visible dans visibleDivId
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
          
          // Only play if not in initial page load
          if (!this.initialLoad) {
            // Play the video immediately without delay when it becomes visible
            this.playVideoImmediately(video);
          }
          
          this.checkForVideo(entry.target);
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

  // Vérifie si l'élément a une vidéo enfant avec la classe "thefrontvideo"
  checkForVideo(element) {
    if (!element) return;
    
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
	  
      document.body.classList.add('bgvideo'); // Ajoute la classe bgvideo au body
      console.log('il y a une video');
      if(this.videoIsMuted === false){
        video.muted = false;
      }
    } else {
      this.removePlayButton();
      document.body.classList.remove('bgvideo'); // Retire la classe bgvideo du body
      console.log('il n y a pas de video');
    }
  }

  // Ajoute un bouton de lecture du son de la vidéo
  addPlayButton(video) {
    this.removePlayButton(); // Supprime le bouton existant avant d'en ajouter un nouveau
    const playButton = document.createElement('div');
    playButton.id = 'playbutton';
    const playIcon = document.createElement('img');
    //playIcon.src = 'https://camp.mx/wp-content/uploads/soundwave.gif'; 
    playIcon.src = this.videoIsMuted ? 'https://camp.mx/wp-content/uploads/soundwave.gif' : 'https://camp.mx/wp-content/uploads/sound-wave.gif'; 
    playButton.appendChild(playIcon);
    playButton.addEventListener('click', () => {
      this.videoIsMuted = !this.videoIsMuted
      video.muted = this.videoIsMuted;
      playIcon.src = video.muted ? 'https://camp.mx/wp-content/uploads/soundwave.gif' : 'https://camp.mx/wp-content/uploads/sound-wave.gif'; 
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
    console.log('playbutton ajoute');
  }

  // Supprime le bouton de lecture du son
  removePlayButton() {
    const playButton = document.getElementById('playbutton');
    if (playButton) {
      playButton.remove();
      console.log('playbutton enleve');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  var videosound = new VideoSound();
});