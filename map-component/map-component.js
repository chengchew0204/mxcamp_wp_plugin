/**
 * Interactive Map Component - Core Logic
 * Version: 1.0.0
 * Single source of truth for map functionality
 */

(function() {
  'use strict';

  // Global state
  let hasOpenedMap = false;
  let currentActiveBuilding = null;
  let currentLayer = undefined;
  let handleClickOutside;
  let handleOpenDetail;

  // Initialize when DOM is ready
  function initializeMap() {
    console.log('Initializing Interactive Map Component v1.0.0');
    
    // Initialize all systems
    setAllClickListeners();
    
    // Initialize subsystems
    const imagePreloader = new ImagePreloader();
    const contourEngine = new SimpleContourEngine();
    const overlayManager = initializeOverlayManager();
    const mapDemo = new MapDemo();
    
    // Make available globally for debugging
    window.mapComponent = {
      version: '1.0.0',
      imagePreloader,
      contourEngine,
      overlayManager,
      mapDemo,
      resetMap: resetMapToInitialState
    };
    
    console.log('Map component initialized successfully');
  }

  // Reset map to initial state
  function resetMapToInitialState() {
    console.log('Resetting map to initial state...');
    
    currentLayer = undefined;
    currentActiveBuilding = null;
    
    const allLayers = document.querySelectorAll('.layer');
    allLayers.forEach(layer => {
      layer.classList.remove('active', 'transitioning');
      layer.style.zIndex = -1;
      layer.style.display = 'none';
      layer.style.opacity = '';
    });
    
    const baseMap = document.querySelector("#map");
    if (baseMap) {
      baseMap.style.display = 'block';
      baseMap.classList.add('active');
      baseMap.style.zIndex = 0;
      baseMap.style.opacity = '1';
    }
    
    if (window.mapComponent && window.mapComponent.overlayManager) {
      window.mapComponent.overlayManager.hideAll();
    }
    
    removeAllClickListeners();
    
    try {
      document.removeEventListener('click', handleClickOutside);
    } catch (e) {
      console.log('No handleClickOutside to remove');
    }
    
    if (window.mapComponent && window.mapComponent.contourEngine && 
        window.mapComponent.contourEngine.resetToInitialState) {
      window.mapComponent.contourEngine.resetToInitialState();
    }
    
    setTimeout(() => {
      setAllClickListeners();
    }, 100);
    
    console.log('Map reset complete - ready for fresh interaction');
  }

  // Close map
  function closeMap(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Closing map...');
    
    resetMapToInitialState();
    
    const mapHeader = document.querySelector("#map .card-header") || 
                     document.querySelector("#mapa .card-header");
    if (mapHeader) {
      mapHeader.click();
    } else {
      console.warn('Map header not found for closing');
    }
  }

  // Add exit listeners
  function addExitListeners() {
    const mapExits = document.querySelectorAll(".mapExit");
    mapExits.forEach((map) => {
      map.addEventListener('click', closeMap);
    });
    console.log("Exit listeners added");
  }

  // Click outside handler
  function clickOutside(event, ele, cb) {
    if (event.target.classList.contains('mapExit')) return;

    if (!ele.contains(event.target)) {
      if (currentLayer) {
        currentLayer.style.zIndex = -1;
      }
      currentLayer = undefined;
      currentActiveBuilding = null;
      
      if (window.mapComponent && window.mapComponent.overlayManager) {
        window.mapComponent.overlayManager.hideAll();
      }
      
      event.preventDefault();
      removeAllClickListeners();
      setAllClickListeners();
      cb();
      document.removeEventListener('click', handleClickOutside);
    }
  }

  function onClickOutside(event, ele, cb) {
    console.log('clicked outside event:' + event + ' ele:' + ele + ' cb:' + cb);
    handleClickOutside = (event) => clickOutside(event, ele, cb);
    document.addEventListener('click', handleClickOutside);
  }

  // Open detail layer
  function openDetail(event, element, mapIds, prevMapId) {
    if (currentActiveBuilding && currentActiveBuilding !== element) {
      resetBuildingToLayer1(currentActiveBuilding);
    }
    
    currentActiveBuilding = element;
    
    if (window.mapComponent && window.mapComponent.contourEngine && 
        window.mapComponent.contourEngine.hideActiveBuilding) {
      window.mapComponent.contourEngine.hideActiveBuilding(element);
    }
    
    let mapIdsCopy = [...mapIds];
    let currentMapIndex = 0;
    let nextMapId = mapIdsCopy[currentMapIndex];
    let nextNextMapId = mapIdsCopy[currentMapIndex + 1];
    let map = document.querySelector("#mapa");
    let nextLayer = document.querySelector("#" + nextMapId);
    
    if (!nextLayer) {
      console.warn(`Layer ${nextMapId} not found`);
      return;
    }

    const oldLayer = currentLayer;

    const performTransition = () => {
      console.log(`Switching to layer: ${nextMapId}`);
      
      if (window.mapComponent && window.mapComponent.overlayManager) {
        window.mapComponent.overlayManager.showForLayer(nextMapId);
      }
      
      if (nextLayer.complete && nextLayer.naturalWidth > 0) {
        const allLayers = document.querySelectorAll('.layer');
        allLayers.forEach(layer => {
          layer.classList.remove('active');
          layer.style.zIndex = -1;
          layer.style.display = 'none';
        });
        
        if (oldLayer) {
          oldLayer.style.display = 'block';
          oldLayer.classList.add('active');
          oldLayer.style.zIndex = 0;
        }
        
        nextLayer.style.display = 'block';
        nextLayer.classList.add("active");
        nextLayer.style.zIndex = 2;
          
        setTimeout(() => {
          if (oldLayer && oldLayer !== nextLayer) {
            oldLayer.classList.remove("active");
            oldLayer.style.zIndex = -1;
            oldLayer.style.display = 'none';
          }
          currentLayer = nextLayer;
          nextLayer.style.zIndex = 0;
          handleSequence();
        }, 50);
      } else {
        const onLoad = () => {
          nextLayer.removeEventListener("load", onLoad);
          performTransition();
        };
        nextLayer.addEventListener("load", onLoad, { once: true });
      }
    };

    const handleSequence = () => {
      if (prevMapId) {
        let prevLayer = document.querySelector("#" + prevMapId);
        if (prevLayer) {
          prevLayer.classList.remove("active");
          prevLayer.style.zIndex = -1;
        }
        document.removeEventListener("click", handleClickOutside);
      } else {
        try {
          document.removeEventListener("click", handleClickOutside);
        } catch {
          console.log("handleClickOutside is not defined");
        }
      }

      if (nextNextMapId) {
        let prevLayerId = mapIdsCopy.shift();
        setClickListeners(element, mapIdsCopy, prevLayerId);
        onClickOutside(event, element, function() {
          nextLayer.classList.remove("active");
          nextLayer.style.zIndex = -1;
        });
      } else {
        try {
          element.addEventListener("click", function() {
            if (currentLayer) {
              currentLayer.classList.remove("active");
              currentLayer.style.zIndex = -1;
            }
            currentLayer = undefined;
            currentActiveBuilding = null;
            
            if (window.mapComponent && window.mapComponent.overlayManager) {
              window.mapComponent.overlayManager.hideAll();
            }
            
            removeAllClickListeners();
            document.removeEventListener("click", handleClickOutside);
            setTimeout(() => {
              setAllClickListeners();
            }, 0);
          });
        } catch {
          console.log("handleClickOutside is not defined");
        }
        onClickOutside(event, element, function() {
          nextLayer.classList.remove("active");
          nextLayer.style.zIndex = -1;
        });
      }
    };

    performTransition();
  }

  function setClickListeners(element, mapIds, prevMapId = undefined) {
    element.addEventListener("click", handleOpenDetail = (event) => 
      openDetail(event, element, mapIds, prevMapId), { once: true });
  }

  function resetBuildingToLayer1(buildingElement) {
    let newElement = buildingElement.cloneNode(true);
    buildingElement.parentNode.replaceChild(newElement, buildingElement);
    
    const buildingId = newElement.id;
    const originalMaps = {
      'casita-detail': ["casita-down-1", "casita-down-2"],
      'central-detail': ["central-down-1", "central-down-2", "central-down-3"],
      'chozas-detail': ["chozas-down-1"],
      'calle-detail': ["calle-down-1", "calle-down-2", "calle-down-3"],
      'jardin-detail': ["jardin-down-1", "jardin-down-2", "jardin-down-3", "jardin-down-4"],
      'cosina-detail': ["central-down-1", "central-down-2", "central-down-3"]
    };
    
    if (originalMaps[buildingId]) {
      setClickListeners(newElement, originalMaps[buildingId]);
    }
  }

  function setAllClickListeners() {
    const casitaDetail = document.querySelector("#casita-detail");
    const centralDetail = document.querySelector("#central-detail");
    const chozasDetail = document.querySelector("#chozas-detail");
    const calleDetail = document.querySelector("#calle-detail");
    const jardinDetail = document.querySelector("#jardin-detail");
    const cosinaDetail = document.querySelector("#cosina-detail");

    if (casitaDetail) setClickListeners(casitaDetail, ["casita-down-1", "casita-down-2"]);
    if (centralDetail) setClickListeners(centralDetail, ["central-down-1", "central-down-2", "central-down-3"]);
    if (chozasDetail) setClickListeners(chozasDetail, ["chozas-down-1"]);
    if (calleDetail) setClickListeners(calleDetail, ["calle-down-1", "calle-down-2", "calle-down-3"]);
    if (jardinDetail) setClickListeners(jardinDetail, ["jardin-down-1", "jardin-down-2", "jardin-down-3", "jardin-down-4"]);
    if (cosinaDetail) setClickListeners(cosinaDetail, ["central-down-1", "central-down-2", "central-down-3"]);
    
    addExitListeners();
  }

  function removeAllClickListeners() {
    let clickableElements = document.getElementsByClassName("detail");
    for (let element of clickableElements) {
      if (element.classList.contains('mapExit') || element.id === 'central-detail-demo') continue;
      
      let newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
    }
    try {
      document.removeEventListener("click", handleClickOutside);
    } catch (e) {
      console.log('No handleClickOutside to remove');
    }
  }

  // IMAGE PRELOADER
  class ImagePreloader {
    constructor() {
      this.preloadedImages = new Map();
      this.isPreloading = false;
    }

    async preloadAllMapLayers() {
      if (this.isPreloading) return;
      this.isPreloading = true;

      console.log('Starting map layer preloading...');

      const mapLayerUrls = [
        'https://camp.mx/wp-content/uploads/02-central-down-1.webp',
        'https://camp.mx/wp-content/uploads/03-central-down-2.webp',
        'https://camp.mx/wp-content/uploads/04-central-down-3.webp',
        'https://camp.mx/wp-content/uploads/05-chozas-down-1.webp',
        'https://camp.mx/wp-content/uploads/06-casa-down-1.webp',
        'https://camp.mx/wp-content/uploads/07-casa-down-2.webp',
        'https://camp.mx/wp-content/uploads/08-calle-down-1.webp',
        'https://camp.mx/wp-content/uploads/09-calle-down-2.webp',
        'https://camp.mx/wp-content/uploads/10-calle-down-3.webp',
        'https://camp.mx/wp-content/uploads/11-foro-down-1.webp',
        'https://camp.mx/wp-content/uploads/12-foro-down-2.webp',
        'https://camp.mx/wp-content/uploads/13-foro-down-3.webp',
        'https://camp.mx/wp-content/uploads/14-foro-down-4.webp'
      ];

      const preloadPromises = mapLayerUrls.map(url => this.preloadImage(url));

      try {
        await Promise.all(preloadPromises);
        console.log('All map layers preloaded successfully!');
      } catch (error) {
        console.warn('Some images failed to preload:', error);
      }

      this.isPreloading = false;
    }

    preloadImage(url) {
      return new Promise((resolve, reject) => {
        if (this.preloadedImages.has(url)) {
          resolve(url);
          return;
        }

        const img = new Image();
        img.onload = () => {
          this.preloadedImages.set(url, img);
          console.log(`Preloaded: ${url.split('/').pop()}`);
          resolve(url);
        };
        img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
        img.src = url;
      });
    }

    isImagePreloaded(url) {
      return this.preloadedImages.has(url);
    }
  }

  // CONTOUR ENGINE
  class SimpleContourEngine {
    constructor() {
      this.contourConfig = {
        'central-detail': 'https://camp.mx/wp-content/uploads/palapa-hover-central.png',
        'casita-detail': 'https://camp.mx/wp-content/uploads/palapa-hover-casa.png',
        'chozas-detail': 'https://camp.mx/wp-content/uploads/palapa-hover-chozas.png',
        'calle-detail': 'https://camp.mx/wp-content/uploads/palapa-hover-calle.png',
        'jardin-detail': 'https://camp.mx/wp-content/uploads/palapa-hover-foro.png',
        'cosina-detail': 'https://camp.mx/wp-content/uploads/palapa-hover-central.png'
      };

      this.activeContours = new Set();
      this.contourElements = new Map();
      this.overlay = null;
      
      this.init();
    }

    createOverlay() {
      if (document.getElementById('contour-overlay')) {
        this.overlay = document.getElementById('contour-overlay');
        return;
      }

      const mapContainer = document.querySelector('.map-container');
      if (!mapContainer) return;
      
      this.overlay = document.createElement('div');
      this.overlay.id = 'contour-overlay';
      this.overlay.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 15;
      `;
      mapContainer.appendChild(this.overlay);
    }

    createContourElement(areaId) {
      const contour = document.createElement('img');
      contour.src = this.contourConfig[areaId];
      contour.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        display: none;
      `;
      contour.dataset.area = areaId;
      this.overlay.appendChild(contour);
      this.contourElements.set(areaId, contour);
      return contour;
    }

    showContour(areaId) {
      if (!this.contourConfig[areaId]) return;
      
      const targetElement = document.querySelector(`#${areaId}`);
      if (currentActiveBuilding === targetElement) {
        console.log(`Skipping contour for active building: ${areaId}`);
        return;
      }
      
      let contour = this.contourElements.get(areaId);
      if (!contour) {
        contour = this.createContourElement(areaId);
      }

      contour.style.display = 'block';
      requestAnimationFrame(() => {
        contour.style.opacity = '0.8';
      });
      
      this.activeContours.add(areaId);
      console.log(`Showing contour for: ${areaId}`);
    }

    hideContour(areaId) {
      const contour = this.contourElements.get(areaId);
      if (!contour) return;

      contour.style.opacity = '0';
      setTimeout(() => {
        contour.style.display = 'none';
      }, 300);
      
      this.activeContours.delete(areaId);
      console.log(`Hiding contour for: ${areaId}`);
    }

    hideAllContours() {
      this.activeContours.forEach(areaId => this.hideContour(areaId));
      console.log(`Hiding all contours`);
    }

    hideActiveBuilding(buildingElement) {
      if (!buildingElement || !buildingElement.id) return;
      
      const areaId = buildingElement.id;
      if (this.contourConfig[areaId]) {
        this.hideContour(areaId);
        console.log(`Hiding contour for newly active building: ${areaId}`);
      }
    }

    resetToInitialState() {
      console.log('Resetting contour engine...');
      
      this.hideAllContours();
      this.activeContours.clear();
      
      this.contourElements.forEach((contour, areaId) => {
        contour.style.opacity = '0';
        contour.style.display = 'none';
      });
      
      console.log('Contour engine reset complete');
    }

    setupEventListeners() {
      const mapContainer = document.getElementById('imap');
      if (!mapContainer) return;

      let isClickAction = false;

      mapContainer.addEventListener('mouseover', (event) => {
        if (isClickAction) return;
        
        const detail = event.target.closest('.detail.onmouseover-detail');
        if (!detail || !this.contourConfig[detail.id]) return;
        
        this.hideAllContours();
        this.showContour(detail.id);
      });

      mapContainer.addEventListener('mouseout', (event) => {
        if (isClickAction) return;
        
        const detail = event.target.closest('.detail.onmouseover-detail');
        if (!detail || !this.contourConfig[detail.id]) return;
        
        const relatedTarget = event.relatedTarget;
        if (relatedTarget && detail.contains(relatedTarget)) {
          return;
        }
        
        this.hideContour(detail.id);
      });

      mapContainer.addEventListener('click', (event) => {
        isClickAction = true;
        
        const detail = event.target.closest('.detail.onmouseover-detail');
        
        if (detail && this.contourConfig[detail.id]) {
          this.hideContour(detail.id);
        } else {
          this.hideAllContours();
        }
        
        setTimeout(() => { isClickAction = false; }, 50);
        
        event.stopPropagation();
      });
    }

    init() {
      console.log('Initializing Simple Contour Engine...');
      
      this.createOverlay();
      this.setupEventListeners();
      
      console.log('Simple Contour Engine Ready');
    }

    destroy() {
      this.contourElements.forEach(contour => contour.remove());
      this.contourElements.clear();
      this.activeContours.clear();
      if (this.overlay) {
        this.overlay.remove();
      }
    }
  }

  // OVERLAY MANAGER
  class OverlayManager {
    constructor(opts) {
      this.items = opts.items || [];
      this.mountSelector = opts.mount || '#media-overlay';
      this.mountEl = document.querySelector(this.mountSelector) || 
                     document.getElementById('media-overlay');
      if (!this.mountEl) {
        const container = document.querySelector('.map-container');
        if (container) {
          this.mountEl = document.createElement('div');
          this.mountEl.id = 'media-overlay';
          container.appendChild(this.mountEl);
        }
      }
      this.dom = new Map();
      console.log('OverlayManager initializing with', this.items.length, 'items');
      this.build();
      this.hideAll();
    }

    build() {
      this.items.forEach(item => {
        const root = document.createElement('div');
        root.className = 'media-item';
        root.id = item.id;

        const s = root.style;
        if (item.rect) {
          if (item.rect.top != null) s.top = item.rect.top;
          if (item.rect.left != null) s.left = item.rect.left;
          if (item.rect.right != null) s.right = item.rect.right;
          if (item.rect.width != null) s.width = item.rect.width;
          if (item.rect.height != null) s.height = item.rect.height;
        }

        const frame = document.createElement('div');
        frame.className = 'frame';
        if (item.box) {
          if (item.box.background) frame.style.background = item.box.background;
          if (item.box.border) frame.style.border = item.box.border;
          if (item.box.radius) frame.style.borderRadius = item.box.radius;
          if (item.box.shadow) frame.style.boxShadow = item.box.shadow;
        }

        let mediaEl;
        if (item.type === 'image') {
          mediaEl = document.createElement('img');
          mediaEl.src = item.src;
          mediaEl.alt = item.alt || '';
        } else {
          mediaEl = document.createElement('video');
          mediaEl.autoplay = true;
          mediaEl.loop = true;
          mediaEl.muted = true;
          mediaEl.playsInline = true;
          if (item.poster) mediaEl.poster = item.poster;
          const source = document.createElement('source');
          source.src = item.src;
          source.type = item.mime || 'video/mp4';
          mediaEl.appendChild(source);
        }

        root.style.pointerEvents = 'none';

        root.appendChild(frame);
        root.appendChild(mediaEl);
        this.mountEl.appendChild(root);
        this.dom.set(item.id, root);
        console.log(`Built media item: ${item.id}`);
      });
      
      console.log('OverlayManager build complete');
    }

    showForLayer(layerId) {
      this.items.forEach(item => {
        const el = this.dom.get(item.id);
        if (!el) return;
        
        if (item.showOn && item.showOn.includes(layerId)) {
          console.log(`Showing media overlay: ${item.id} for layer: ${layerId}`);
          el.style.display = 'block';
          el.style.transition = 'opacity 160ms ease';
          el.style.opacity = '1';
        } else {
          if (el.style.display !== 'none') {
            console.log(`Hiding media overlay: ${item.id}`);
          }
          el.style.transition = 'opacity 120ms ease';
          el.style.opacity = '0';
          setTimeout(() => {
            if (el.style.opacity === '0') {
              el.style.display = 'none';
            }
          }, 120);
        }
      });
    }

    hideAll() {
      this.dom.forEach(el => {
        el.style.transition = 'opacity 120ms ease';
        el.style.opacity = '0';
        setTimeout(() => { el.style.display = 'none'; }, 120);
      });
    }
  }

  function initializeOverlayManager() {
    return new OverlayManager({
      mount: '#media-overlay',
      items: []
    });
  }

  // DEMO SYSTEM
  class MapDemo {
    constructor() {
      this.demoCursor = null;
      this.isRunning = false;
      this.userInteractionDisabled = false;
      this.hasRunDemo = false;
      this.demoInterrupted = false;
      this.init();
    }

    init() {
      this.demoCursor = document.getElementById('demo-cursor');
      if (this.demoCursor) {
        this.waitForMapCardOpen();
      }
    }

    waitForMapCardOpen() {
      if (this.isMapCardOpen()) {
        console.log('Map card is already open...');
        if (!this.hasRunDemo) {
          if (this.isMobileDevice()) {
            console.log('Mobile device detected - waiting for positioning');
            this.waitForMobileMapPositioning();
          } else {
            console.log('Desktop device - starting demo');
            this.startDemo();
          }
        }
        return;
      }

      this.startMonitoring();
    }

    isMobileDevice() {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
      const isMobile = isMobileUA || (hasTouch && isSmallScreen);
      
      console.log('Mobile detection:', {
        userAgent: isMobileUA,
        hasTouch,
        isSmallScreen,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        finalResult: isMobile
      });
      
      return isMobile;
    }

    isMapCardOpen() {
      const mapContainer = document.getElementById('imap');
      if (!mapContainer) return false;
      
      let currentElement = mapContainer;
      for (let i = 0; i < 10; i++) {
        if (!currentElement || !currentElement.parentNode) break;
        currentElement = currentElement.parentNode;
        
        if (currentElement.classList &&
            currentElement.classList.contains('slide_10') &&
            currentElement.classList.contains('opened')) {
          return true;
        }
      }
      return false;
    }

    startMonitoring() {
      console.log('Monitoring for map card opening...');
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const body = mutation.target;
            if ((body.classList.contains('map') || body.classList.contains('mapa')) &&
                body.classList.contains('bodycardopened')) {
              console.log('Map card opened!');
              
              if (!this.hasRunDemo) {
                if (this.isMobileDevice()) {
                  this.waitForMobileMapPositioning();
                } else {
                  setTimeout(() => {
                    this.startDemo();
                  }, 400);
                }
              }
              
              observer.disconnect();
            }
          }
        });
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    waitForMobileMapPositioning() {
      console.log('Waiting for mobile positioning...');
      
      if (typeof window.mapscroll !== 'undefined' && window.mapscroll === 0) {
        console.log('Positioning complete');
        this.startDemo();
        return;
      }
      
      const checkPositioning = setInterval(() => {
        if (typeof window.mapscroll !== 'undefined' && window.mapscroll === 0) {
          console.log('Mobile positioning complete');
          clearInterval(checkPositioning);
          this.startDemo();
        }
      }, 100);
      
      setTimeout(() => {
        if (typeof window.mapscroll === 'undefined' || window.mapscroll !== 0) {
          console.log('Positioning timeout');
          clearInterval(checkPositioning);
          this.startDemo();
        }
      }, 10000);
    }

    disableUserInteraction() {
      this.userInteractionDisabled = true;
      
      const mapContainer = document.getElementById('imap');
      if (mapContainer) {
        mapContainer.classList.add('demo-active');
        this.originalOverflow = mapContainer.style.overflow;
        this.originalOverflowX = mapContainer.style.overflowX;
        this.originalOverflowY = mapContainer.style.overflowY;
        mapContainer.style.overflow = 'hidden';
        mapContainer.style.overflowX = 'hidden';
        mapContainer.style.overflowY = 'hidden';
      }
      
      this.originalClickHandler = this.handleDocumentClick.bind(this);
      document.addEventListener('click', this.originalClickHandler, true);
      document.addEventListener('touchstart', this.originalClickHandler, true);
      document.addEventListener('touchend', this.originalClickHandler, true);
      
      this.preventScrollHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      document.addEventListener('scroll', this.preventScrollHandler, true);
      document.addEventListener('touchmove', this.preventScrollHandler, true);
      if (mapContainer) {
        mapContainer.addEventListener('scroll', this.preventScrollHandler, true);
        mapContainer.addEventListener('touchmove', this.preventScrollHandler, true);
      }
      
      this.originalPointerEvents = new Map();
      const detailElements = document.querySelectorAll('.detail');
      detailElements.forEach(detail => {
        if (!detail.classList.contains('mapExit')) {
          this.originalPointerEvents.set(detail, detail.style.pointerEvents || 'auto');
          detail.style.pointerEvents = 'none';
        }
      });
      
      console.log('User interaction disabled for demo');
    }

    enableUserInteraction() {
      this.userInteractionDisabled = false;
      
      const mapContainer = document.getElementById('imap');
      if (mapContainer) {
        mapContainer.classList.remove('demo-active');
        mapContainer.style.overflow = this.originalOverflow || '';
        mapContainer.style.overflowX = this.originalOverflowX || '';
        mapContainer.style.overflowY = this.originalOverflowY || '';
      }
      
      if (this.originalClickHandler) {
        document.removeEventListener('click', this.originalClickHandler, true);
        document.removeEventListener('touchstart', this.originalClickHandler, true);
        document.removeEventListener('touchend', this.originalClickHandler, true);
        this.originalClickHandler = null;
      }
      
      if (this.preventScrollHandler) {
        document.removeEventListener('scroll', this.preventScrollHandler, true);
        document.removeEventListener('touchmove', this.preventScrollHandler, true);
        if (mapContainer) {
          mapContainer.removeEventListener('scroll', this.preventScrollHandler, true);
          mapContainer.removeEventListener('touchmove', this.preventScrollHandler, true);
        }
        this.preventScrollHandler = null;
      }
      
      if (this.originalPointerEvents) {
        this.originalPointerEvents.forEach((originalValue, element) => {
          element.style.pointerEvents = originalValue;
        });
        this.originalPointerEvents.clear();
      }
      
      const allDetailElements = document.querySelectorAll('.detail');
      allDetailElements.forEach(detailElement => {
        detailElement.style.pointerEvents = 'auto';
      });
      
      if (mapContainer) {
        mapContainer.style.pointerEvents = 'auto';
      }
      
      console.log('User interaction enabled');
    }

    handleDocumentClick(event) {
      if (this.userInteractionDisabled && event.isTrusted === false && event.demoGenerated) {
        return true;
      }
      
      if (this.userInteractionDisabled && event.isTrusted && this.isRunning) {
        console.log('User interrupted demo');
        this.interruptDemo(event);
        return false;
      }
      
      if (this.userInteractionDisabled) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    }

    async interruptDemo(userEvent) {
      console.log('Demo interrupted');
      
      this.demoInterrupted = true;
      await this.fadeOutCursor();
      this.enableUserInteraction();
      this.isRunning = false;
      this.demoInterrupted = false;
      
      resetMapToInitialState();
      
      setTimeout(() => {
        const clickedElement = document.elementFromPoint(userEvent.clientX, userEvent.clientY);
        if (clickedElement) {
          const newEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: userEvent.clientX,
            clientY: userEvent.clientY
          });
          clickedElement.dispatchEvent(newEvent);
        }
      }, 200);
    }

    async startDemo() {
      if (this.isRunning || this.hasRunDemo) return;
      
      this.isRunning = true;
      this.hasRunDemo = true;
      this.demoInterrupted = false;
      console.log('Starting demo...');
      
      this.disableUserInteraction();
      
      await this.showCursorAtCentral();
      if (this.demoInterrupted) return;
      
      await this.wait(75);
      if (this.demoInterrupted) return;
      
      await this.performCentralClickSequence();
      if (this.demoInterrupted) return;
      
      await this.wait(100);
      if (this.demoInterrupted) return;
      
      this.enableUserInteraction();
      
      setTimeout(() => {
        removeAllClickListeners();
        setAllClickListeners();
      }, 100);
      
      await this.fadeOutCursor();
      
      this.isRunning = false;
      console.log('Demo complete!');
    }

    async showCursorAtCentral() {
      return new Promise((resolve) => {
        this.ensureCursorVisibility();
        
        this.demoCursor.style.top = '59.5%';
        this.demoCursor.style.left = '46.5%';
        this.demoCursor.style.opacity = '0';
        this.demoCursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        
        this.demoCursor.classList.add('fade-in');
        
        const animationInterval = setInterval(() => {
          this.ensureCursorVisibility();
        }, 100);
        
        setTimeout(() => {
          clearInterval(animationInterval);
          this.demoCursor.classList.remove('fade-in');
          this.demoCursor.style.opacity = '1';
          this.demoCursor.style.transform = 'translate(-50%, -50%) scale(1)';
          this.ensureCursorVisibility();
          resolve();
        }, 750);
      });
    }

    async performCentralClickSequence() {
      const centralDetailDemo = document.querySelector('#central-detail-demo');
      if (!centralDetailDemo) return;

      console.log('Starting click sequence...');
      
      await this.performDemoClick(centralDetailDemo, 'ani-02-central-down-1', 'Click 1');
      if (this.demoInterrupted) return;
      await this.wait(250);
      if (this.demoInterrupted) return;
      
      await this.performDemoClick(centralDetailDemo, 'ani-03-central-down-2', 'Click 2');
      if (this.demoInterrupted) return;
      await this.wait(250);
      if (this.demoInterrupted) return;
      
      await this.performDemoClick(centralDetailDemo, 'ani-04-central-down-3', 'Click 3');
      if (this.demoInterrupted) return;
      await this.wait(250);
      if (this.demoInterrupted) return;
      
      await this.performFinalClick(centralDetailDemo, 'Click 4');
    }

    async performDemoClick(element, layerId, logMessage) {
      console.log(logMessage);
      
      this.ensureCursorVisibility();
      this.demoCursor.classList.add('click-animation');
      await this.wait(75);
      
      const fakeLayer = document.querySelector('#' + layerId);
      if (fakeLayer) {
        const allLayers = document.querySelectorAll('.layer');
        allLayers.forEach(layer => {
          layer.classList.remove('active');
          layer.style.zIndex = -1;
          layer.style.display = 'none';
        });
        
        fakeLayer.style.display = 'block';
        fakeLayer.classList.add('active');
        fakeLayer.style.zIndex = 2;
        fakeLayer.style.opacity = '1';
        
        currentLayer = fakeLayer;
        
        setTimeout(() => {
          fakeLayer.style.zIndex = 0;
        }, 50);
      }
      
      this.maintainCursorDuringTransition();
      
      setTimeout(() => {
        this.demoCursor.classList.remove('click-animation');
        this.demoCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        this.demoCursor.style.opacity = '1';
        this.ensureCursorVisibility();
      }, 200);
    }

    async performFinalClick(element, logMessage) {
      console.log(logMessage);
      
      this.ensureCursorVisibility();
      this.demoCursor.classList.add('click-animation');
      await this.wait(75);
      
      resetMapToInitialState();
      this.maintainCursorDuringTransition();
      
      setTimeout(() => {
        this.demoCursor.classList.remove('click-animation');
        this.demoCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        this.demoCursor.style.opacity = '1';
        this.ensureCursorVisibility();
      }, 400);
    }

    ensureCursorVisibility() {
      if (!this.demoCursor) return;
      
      this.demoCursor.style.zIndex = '99999';
      this.demoCursor.style.display = 'block';
      this.demoCursor.style.visibility = 'visible';
      this.demoCursor.style.pointerEvents = 'none';
    }

    maintainCursorDuringTransition() {
      const maintainInterval = setInterval(() => {
        this.ensureCursorVisibility();
      }, 50);
      
      setTimeout(() => {
        clearInterval(maintainInterval);
        this.ensureCursorVisibility();
      }, 200);
    }

    async fadeOutCursor() {
      return new Promise((resolve) => {
        this.demoCursor.classList.remove('click-animation', 'fade-in');
        this.demoCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        this.demoCursor.style.opacity = '1';
        
        setTimeout(() => {
          this.demoCursor.classList.add('fade-out');
          
          setTimeout(() => {
            this.demoCursor.classList.remove('fade-out');
            this.demoCursor.style.opacity = '0';
            resolve();
          }, 300);
        }, 50);
      });
    }

    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    restartDemo() {
      if (this.isRunning) return;
      this.hasRunDemo = false;
      this.startDemo();
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMap);
  } else {
    initializeMap();
  }

})();
