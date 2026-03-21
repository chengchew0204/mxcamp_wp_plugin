class EventFeatureSlider {
    constructor(container, options = {}) {
        this.container = container;
        this.currentSlide = 0;
        this.slides = [];
        this.slideCount = 0;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.arrowIconLeft = '<?xml version="1.0" encoding="UTF-8"?><svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 17 41.5"><defs><style>.cls-1 {fill: #f5f5f5;stroke-width: 0px;}</style></defs><path class="cls-1" d="M0,20.4c0-.3.1-.6.3-.8L14.6.5c.4-.6,1.3-.7,1.9-.2.6.4.7,1.3.3,1.9L3,20.5l13.7,18.8c.4.6.3,1.4-.3,1.9-.6.4-1.4.3-1.9-.3L.2,21.2c-.1-.2-.2-.5-.2-.8Z"/></svg>';
        this.arrowIconRight = '<?xml version="1.0" encoding="UTF-8"?><svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 17 41.5"><defs> <style>.cls-1 { fill: #f5f5f5; stroke-width: 0px;}</style></defs><path class="cls-1" d="M17,20.4c0-.3-.1-.6-.3-.8L2.4.5C2,0,1.1-.2.5.3,0,.7-.2,1.6.2,2.2l13.8,18.3L.3,39.3c-.4.6-.3,1.4.3,1.9.6.4,1.4.3,1.9-.3l14.3-19.7c.1-.2.2-.5.2-.8Z"/></svg>';
        
        this.init();
    }
    
    init() {
        console.log('EventFeatureSlider: Initializing slider for container', this.container);
        
        const ftImageContainer = this.container.querySelector('.evocard_box.ftimage');
        if (!ftImageContainer) {
            console.log('EventFeatureSlider: No ftimage container found');
            return;
        }
        
        const eventDescription = this.container.querySelector('.eventon_full_description, .eventon_desc_in');
        if (!eventDescription) {
            console.log('EventFeatureSlider: No event description found');
            return;
        }
        
        const galleryDiv = eventDescription.querySelector('.event-gallery-images');
        if (!galleryDiv) {
            console.log('EventFeatureSlider: No event-gallery-images found - slider not needed');
            return;
        }
        
        this.collectImages(ftImageContainer, galleryDiv);
        
        if (this.slides.length <= 1) {
            console.log('EventFeatureSlider: Only one or no images found, slider not needed');
            return;
        }
        
        this.buildSlider(ftImageContainer);
        this.setupNavigation();
        this.setupIndicators();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        
        console.log('EventFeatureSlider: Slider initialized with', this.slides.length, 'images');
    }
    
    collectImages(ftImageContainer, galleryDiv) {
        // Try injected <img> first (both Lite and Full after fixEventOnFullImages runs)
        var featuredImg = ftImageContainer.querySelector('.evo_event_main_img');

        // EventOn Full fallback: read image URL from data-f attribute on evocard_main_image
        if (!featuredImg) {
            var mainImageEl = ftImageContainer.querySelector('.evocard_main_image[data-f]');
            if (mainImageEl) {
                var dataF = mainImageEl.getAttribute('data-f');
                if (dataF) {
                    this.slides.push({ src: dataF, alt: '' });
                }
            }
        } else {
            this.slides.push({
                src: featuredImg.src,
                alt: featuredImg.alt || ''
            });
        }
        
        const galleryImages = galleryDiv.querySelectorAll('img');
        galleryImages.forEach(img => {
            const src = img.getAttribute('data-src') || img.src;
            if (src) {
                this.slides.push({
                    src: src,
                    alt: img.alt || ''
                });
            }
        });
        
        this.slideCount = this.slides.length;
    }
    
    buildSlider(ftImageContainer) {
        // EventOn Lite uses .evo_metarow_directimg; EventOn Full uses .evocard_main_image.direct
        const metarowDiv = ftImageContainer.querySelector('.evo_metarow_directimg')
            || ftImageContainer.querySelector('.evocard_main_image.direct')
            || ftImageContainer;

        const sliderHTML = `
            <div class="event-feature-slider">
                <div class="event-slider-wrapper">
                    <div class="event-slider-track">
                        ${this.slides.map((slide, index) => `
                            <div class="event-slide" style="transform: translateX(${index * 100}%)">
                                <img src="${slide.src}" 
                                     alt="${slide.alt}" 
                                     class="evo_event_main_img" 
                                     loading="${index === 0 ? 'eager' : 'lazy'}"
                                     decoding="${index === 0 ? 'sync' : 'async'}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button class="event-slider-nav event-slider-prev" aria-label="Previous image">
                    ${this.arrowIconLeft}
                </button>
                <button class="event-slider-nav event-slider-next" aria-label="Next image">
                    ${this.arrowIconRight}
                </button>
                <div class="event-slider-indicators">
                    ${this.slides.map((_, index) => `
                        <button class="event-slider-dot ${index === 0 ? 'active' : ''}" 
                                data-slide="${index}" 
                                aria-label="Go to image ${index + 1}">
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        metarowDiv.innerHTML = sliderHTML;
        
        this.sliderElement = metarowDiv.querySelector('.event-feature-slider');
        this.track = metarowDiv.querySelector('.event-slider-track');
        this.slideElements = metarowDiv.querySelectorAll('.event-slide');
        this.prevButton = metarowDiv.querySelector('.event-slider-prev');
        this.nextButton = metarowDiv.querySelector('.event-slider-next');
        this.indicators = metarowDiv.querySelectorAll('.event-slider-dot');
        
        // Force load images immediately after DOM is ready
        setTimeout(() => {
            this.preloadImages();
        }, 0);
        
        // Also preload after a short delay to catch any lazy loading interference
        setTimeout(() => {
            this.preloadImages();
        }, 100);
    }
    
    preloadImages() {
        // Force all images to load immediately by setting src directly
        console.log('EventFeatureSlider: Preloading images...', this.slides.length, 'images');
        
        // Check if slider is visible
        const isVisible = this.sliderElement && this.sliderElement.offsetParent !== null;
        console.log('EventFeatureSlider: Slider visible:', isVisible);
        
        this.slideElements.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img && this.slides[index]) {
                const targetSrc = this.slides[index].src;
                
                // Check if src needs to be set or reset
                if (!img.src || img.src !== targetSrc || img.src.includes('data:image')) {
                    console.log(`EventFeatureSlider: Setting src for image ${index + 1}:`, targetSrc);
                    
                    // Always set the src directly, overriding any lazy loading
                    img.src = targetSrc;
                    
                    // Remove any lazy loading attributes that might interfere
                    img.removeAttribute('data-src');
                    img.removeAttribute('loading');
                    
                    // Force decode to start loading immediately
                    if (img.decode) {
                        img.decode().catch(err => {
                            console.log(`EventFeatureSlider: Decode failed for image ${index + 1}, will load normally`);
                        });
                    }
                }
                
                // Force the browser to start loading
                if (img.complete) {
                    console.log(`EventFeatureSlider: Image ${index + 1} already loaded`);
                } else {
                    img.onload = () => {
                        console.log(`EventFeatureSlider: Image ${index + 1} loaded successfully`);
                    };
                    img.onerror = () => {
                        console.error(`EventFeatureSlider: Image ${index + 1} failed to load:`, targetSrc);
                        // Retry once
                        setTimeout(() => {
                            console.log(`EventFeatureSlider: Retrying image ${index + 1}`);
                            img.src = targetSrc;
                        }, 100);
                    };
                }
            }
        });
        
        // Force a reflow to trigger loading
        if (this.sliderElement) {
            this.sliderElement.offsetHeight;
        }
    }
    
    setupNavigation() {
        if (this.prevButton) {
            this.prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.goToPrevSlide();
            });
        }
        
        if (this.nextButton) {
            this.nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.goToNextSlide();
            });
        }
    }
    
    setupIndicators() {
        this.indicators.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.goToSlide(index);
            });
        });
    }
    
    setupKeyboardNavigation() {
        this.keyboardHandler = (e) => {
            if (!this.isSliderInView()) return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.goToPrevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.goToNextSlide();
            }
        };
        
        document.addEventListener('keydown', this.keyboardHandler);
    }
    
    setupTouchNavigation() {
        if (!this.sliderElement) return;
        
        this.sliderElement.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.sliderElement.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.goToNextSlide();
            } else {
                this.goToPrevSlide();
            }
        }
    }
    
    isSliderInView() {
        if (!this.sliderElement) return false;
        
        const rect = this.sliderElement.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slideCount) return;
        
        this.currentSlide = index;
        this.updateSlides();
        this.updateIndicators();
        
        // Ensure the current and next slides have their images loaded
        this.ensureImageLoaded(index);
        if (index + 1 < this.slideCount) {
            this.ensureImageLoaded(index + 1);
        }
        if (index - 1 >= 0) {
            this.ensureImageLoaded(index - 1);
        }
    }
    
    ensureImageLoaded(index) {
        if (index < 0 || index >= this.slideElements.length) return;
        
        const slide = this.slideElements[index];
        const img = slide.querySelector('img');
        
        if (img && (!img.src || img.src.includes('data:image'))) {
            console.log(`EventFeatureSlider: Loading image ${index + 1}`);
            img.src = this.slides[index].src;
        }
    }
    
    goToNextSlide() {
        const nextSlide = (this.currentSlide + 1) % this.slideCount;
        this.goToSlide(nextSlide);
    }
    
    goToPrevSlide() {
        const prevSlide = (this.currentSlide - 1 + this.slideCount) % this.slideCount;
        this.goToSlide(prevSlide);
    }
    
    updateSlides() {
        this.slideElements.forEach((slide, index) => {
            const offset = (index - this.currentSlide) * 100;
            slide.style.transform = `translateX(${offset}%)`;
        });
    }
    
    updateIndicators() {
        this.indicators.forEach((dot, index) => {
            if (index === this.currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    destroy() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
    }
}

function initEventFeatureSlider() {
    console.log('EventFeatureSlider: Initialization function called');
    
    const checkAndInitLightbox = () => {
        const lightboxes = document.getElementById('evo_lightboxes');
        
        if (!lightboxes) {
            console.log('EventFeatureSlider: No lightboxes element found yet');
            return;
        }
        
        console.log('EventFeatureSlider: Lightboxes element found, setting up observer');
        
        const initLightboxSlider = (lightboxEl) => {
            if (!lightboxEl || lightboxEl.hasAttribute('data-slider-initialized')) return;
            lightboxEl.setAttribute('data-slider-initialized', 'true');
            console.log('EventFeatureSlider: New lightbox detected, initializing slider');

            setTimeout(() => {
                const slider = new EventFeatureSlider(lightboxEl);
                if (slider && slider.sliderElement) {
                    setTimeout(() => slider.preloadImages(), 200);
                    setTimeout(() => slider.preloadImages(), 500);
                    setTimeout(() => slider.preloadImages(), 1000);
                }
            }, 150);
        };

        const findVisibleLightbox = () => {
            // EventOn Lite: .evo_lightbox.show
            // EventOn Full: .evo_lightbox with visible content (style != display:none)
            return lightboxes.querySelector('.evo_lightbox.show')
                || Array.from(lightboxes.querySelectorAll('.evo_lightbox')).find(el => {
                    return el.style.display !== 'none' && el.offsetParent !== null;
                });
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    const visibleLightbox = findVisibleLightbox();
                    if (visibleLightbox) initLightboxSlider(visibleLightbox);
                }
            });
        });
        
        observer.observe(lightboxes, {
            attributes: true,
            childList: true,
            subtree: true
        });
        
        const existingLightbox = findVisibleLightbox();
        if (existingLightbox) initLightboxSlider(existingLightbox);
    };
    
    const checkAndInitSinglePage = () => {
        const singleEventPage = document.querySelector('body.single-ajde_events');
        
        if (singleEventPage) {
            console.log('EventFeatureSlider: Single event page detected');
            const eventContainer = document.querySelector('.eventon_list_event');
            
            if (eventContainer) {
                console.log('EventFeatureSlider: Initializing slider for single event page');
                new EventFeatureSlider(eventContainer);
            }
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkAndInitLightbox();
            checkAndInitSinglePage();
        });
    } else {
        checkAndInitLightbox();
        checkAndInitSinglePage();
    }
    
    let lightboxCheckInterval = setInterval(() => {
        const lightboxes = document.getElementById('evo_lightboxes');
        if (lightboxes) {
            clearInterval(lightboxCheckInterval);
            checkAndInitLightbox();
        }
    }, 100);
    
    setTimeout(() => {
        clearInterval(lightboxCheckInterval);
    }, 5000);
}

initEventFeatureSlider();
