function SliderConstructor(el) {
    let divplaying = document.querySelectorAll('.videoplaying');
                // Parcourir chaque vidéo pour vérifier si elle est en cours de lecture
                divplaying.forEach(div => {
                    div.classList.remove('videoplaying');
                });
    document.getElementById(el) ? console.log(el) : console.log(false);
    const target = document.getElementById(el);
    let thisslide = 0;
    let arrowIconLeft = '<?xml version="1.0" encoding="UTF-8"?><svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 17 41.5"><defs><style>.cls-1 {fill: #f5f5f5;stroke-width: 0px;}</style></defs><path class="cls-1" d="M0,20.4c0-.3.1-.6.3-.8L14.6.5c.4-.6,1.3-.7,1.9-.2.6.4.7,1.3.3,1.9L3,20.5l13.7,18.8c.4.6.3,1.4-.3,1.9-.6.4-1.4.3-1.9-.3L.2,21.2c-.1-.2-.2-.5-.2-.8Z"/></svg>';
    let arrowIconRight = '<?xml version="1.0" encoding="UTF-8"?><svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 17 41.5"><defs> <style>.cls-1 { fill: #f5f5f5; stroke-width: 0px;}</style></defs><path class="cls-1" d="M17,20.4c0-.3-.1-.6-.3-.8L2.4.5C2,0,1.1-.2.5.3,0,.7-.2,1.6.2,2.2l13.8,18.3L.3,39.3c-.4.6-.3,1.4.3,1.9.6.4,1.4.3,1.9-.3l14.3-19.7c.1-.2.2-.5.2-.8Z"/></svg>';
    let slides = target.querySelectorAll('.slide-camp div');
    let slideSayisi = slides.length;
    let prev = target.querySelector('.prev');
    target.querySelector('.prev') ? console.log(true) : console.log(false);
    let next = target.querySelector('.next');
    prev.innerHTML = arrowIconLeft;
    next.innerHTML = arrowIconRight;
    // Add onmouseover-detail class to navigation carets for emphatic cursor
    prev.classList.add('onmouseover-detail');
    next.classList.add('onmouseover-detail');
    for (let index = 0; index < slides.length; index++) {
        const element = slides[index];
        element.style.transform = "translateX(" + 100 * (index) + "%)";
    }
    let loop = 0 + 1000 * slideSayisi;
    function chargeplayer(thisslide, play) {
        let numvideo = slides[thisslide].getAttribute('data-vimeo');
        let contentslide = slides[thisslide].innerHTML;
        console.log(thisslide, slides.length, numvideo);

        if (contentslide.length === 0) {
            let thisvideo = document.createElement('video');
            let divvideo = document.createElement('div');
            divvideo.style.height='100%';
            divvideo.style.width='100%';
            divvideo.style.position='relative';
            let divcontrols = document.createElement('div');
            divcontrols.style.height='100%';
            divcontrols.style.width='100%';
            divcontrols.style.position='absolute';
            divcontrols.style.zIndex='22!important';
            // Add onmouseover-detail class for emphatic cursor
            divcontrols.classList.add('onmouseover-detail');
            thisvideo.setAttribute('type', 'video/mp4');
            thisvideo.setAttribute('playsinline', 'playsinline');
            thisvideo.setAttribute('preload', 'auto');
            thisvideo.setAttribute('poster', 'https://archive.org/download/campgaleria' + numvideo + '.jpg');
            thisvideo.setAttribute('src', 'https://archive.org/download/campgaleria' + numvideo + '.mp4');
            thisvideo.style.transform = 'translateZ(0)';
            thisvideo.style.webkitTransform = 'translate3d(0, 0, 0)';
            thisvideo.style.zIndex = '0!important';
            thisvideo.style.left = 0;
            thisvideo.style.position = 'absolute';
            thisvideo.style.width = '100%';
            slides[thisslide].appendChild(divvideo);

            divvideo.appendChild(thisvideo);
            divvideo.appendChild(divcontrols);
            let playbut= document.createElement('img');
            playbut.setAttribute('src', 'https://camp.mx/wp-content/uploads/play-2.png');
            playbut.classList.add('playbut');
            playbut.style.position = 'absolute';
            // Add onmouseover-detail class for emphatic cursor
            playbut.classList.add('onmouseover-detail');

            divcontrols.appendChild(playbut);
            let pausebut= document.createElement('img');
            pausebut.setAttribute('src', 'https://camp.mx/wp-content/uploads/pause.svg');
            pausebut.classList.add('pausebut');
            // Add onmouseover-detail class for emphatic cursor
            pausebut.classList.add('onmouseover-detail');
            divcontrols.appendChild(pausebut);
            let fullscreenbut= document.createElement('img');
            fullscreenbut.setAttribute('src', 'https://camp.mx/wp-content/uploads/full-screen.svg');
            fullscreenbut.classList.add('fullscreenbut');
            // Add onmouseover-detail class for emphatic cursor
            fullscreenbut.classList.add('onmouseover-detail');
            divcontrols.appendChild(fullscreenbut);

            // Crée la barre de progression
            const progressContainer = document.createElement('div');
            progressContainer.classList.add('progressbarout');

            const progressBar = document.createElement('div');
            progressBar.style.width = '0%';
            progressBar.classList.add('progressbarin');

            progressContainer.appendChild(progressBar);
            divcontrols.appendChild(progressContainer);

            // Crée l'affichage du temps
            const timeDisplay = document.createElement('p');
            timeDisplay.classList.add('timevideo');
            divcontrols.appendChild(timeDisplay);

            // Affiche la durée totale lorsque les métadonnées de la vidéo sont chargées
            thisvideo.addEventListener('loadedmetadata', function() {
                const durationMinutes = Math.floor(thisvideo.duration / 60);
                const durationSeconds = Math.floor(thisvideo.duration % 60);

                timeDisplay.textContent = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
            });

            // Ajoute un écouteur d'événement pour mettre à jour la barre de progression et le temps restant
            thisvideo.addEventListener('timeupdate', function () {
                // Calcul du pourcentage de progression en fonction du temps écoulé
                const elapsedTime = thisvideo.currentTime; // Temps écoulé
                const totalTime = thisvideo.duration; // Durée totale
                const progress = (elapsedTime / totalTime) * 100; // Calcul du pourcentage de progression

                // Met à jour la largeur de la barre de progression
                progressBar.style.width = progress + '%';

                // Calcule le temps restant
                const remainingTime = totalTime - elapsedTime;
                const remainingMinutes = Math.floor(remainingTime / 60);
                const remainingSeconds = Math.floor(remainingTime % 60);

                // Affiche le temps restant
                timeDisplay.textContent = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            });



            let myparent = thisvideo.closest(".slider");
            function playvideo(){
                console.log('played', myparent);
                let othersliders = document.querySelectorAll('.slider');
                for (let i = 0; i < othersliders.length; i++) {
                    othersliders[i].classList.remove('play');
                }
                myparent.classList.add('play');
                let videos = document.querySelectorAll('.slider video');
                // Parcourir chaque vidéo pour vérifier si elle est en cours de lecture
                videos.forEach(video => {
                    video.pause();
                });
                let divplaying = document.querySelectorAll('.videoplaying');
                // Parcourir chaque vidéo pour vérifier si elle est en cours de lecture
                divplaying.forEach(div => {
                    div.classList.remove('videoplaying');
                });
                thisvideo.play();
                thisvideo.closest(".slide").classList.add('videoplaying');
                
                // Mark this slider as the active one for keyboard navigation
                othersliders.forEach(slider => slider.removeAttribute('data-keyboard-active'));
                myparent.setAttribute('data-keyboard-active', 'true');
            }
            let  playthisvideo = play;
            if(playthisvideo===true){
                playvideo();
            }
            function pausevideo(){
                console.log('pause', myparent);
                myparent.classList.remove('play');
                let divplaying = document.querySelectorAll('.videoplaying');
                // Parcourir chaque vidéo pour vérifier si elle est en cours de lecture
                divplaying.forEach(div => {
                    div.classList.remove('videoplaying');
                });
            }


            playbut.addEventListener('click',  (event)=>{
                event.preventDefault();
                playvideo();
            });
            pausebut.addEventListener('click', (event)=> {
                event.preventDefault();
                thisvideo.pause();
                pausevideo();
            });
            
            // Make entire video frame clickable for play/pause
            divcontrols.addEventListener('click', (event) => {
                event.preventDefault();
                
                // Don't trigger if clicking on existing control buttons
                if (event.target.classList.contains('playbut') || 
                    event.target.classList.contains('pausebut') || 
                    event.target.classList.contains('fullscreenbut')) {
                    return;
                }
                
                // Toggle play/pause based on current state
                if (thisvideo.paused) {
                    playvideo();
                } else {
                    thisvideo.pause();
                    pausevideo();
                }
            });
            thisvideo.addEventListener('ended', function (data) {
                thisvideo.currentTime = 0;
                goNext(true);
                //thisvideo.remove();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (document.mozFullScreenElement) { // Firefox
                    document.mozCancelFullScreen();
                } else if (document.webkitFullscreenElement) { // Chrome, Safari and Opera
                    document.webkitExitFullscreen();
                } else if (document.msFullscreenElement) { // IE/Edge
                    document.msExitFullscreen();
                }
            });
			console.log("---- adding fullscreen button event listener -----")
            fullscreenbut.addEventListener('click', (event) => {
                event.preventDefault();
                if (thisvideo.requestFullscreen) {
                    thisvideo.requestFullscreen();
                } else if (thisvideo.mozRequestFullScreen) { // Firefox
                    thisvideo.mozRequestFullScreen();
                } else if (thisvideo.webkitRequestFullscreen) { // Chrome, Safari and Opera
                    thisvideo.webkitRequestFullscreen();
                } else if (thisvideo.msRequestFullscreen) { // IE/Edge
                    thisvideo.msRequestFullscreen();
                } else {
					console.log("couldn't make video full screen :(")
				}
            });
			console.log("---- Bringing full screen button to FRONT -----")

            divcontrols.style.zIndex='22!important';
        }
    }
    function goNext(play) {
        loop++;
        for (let index = 0; index < slides.length; index++) {
            const element = slides[index];
            element.style.transform = "translateX(" + 100 * (index - loop % slideSayisi) + "%)";
        }
        if (thisslide < slides.length - 1) {
            thisslide++;
            console.log(thisslide);
        } else {
            thisslide = 0;
            console.log(thisslide);
        }
        if (play===true) {
            chargeplayer(thisslide, true);
        } else {
            chargeplayer(thisslide, false);
        }
        gtag('event', 'click', {
            'event_category': 'Gallery Slide',
            'event_label': 'Slide next',
            'value': 1
        });
    }
    function goPrev(play) {
        loop--;
        for (let index = 0; index < slides.length; index++) {
            const element = slides[index];
            element.style.transform = "translateX(" + 100 * (index - loop % slideSayisi) + "%)";
        }
        if (thisslide != 0) {
            thisslide--;
            console.log(thisslide);
        } else {
            thisslide = slides.length - 1;
            console.log(thisslide);
        }
        if (play===true) {
            chargeplayer(thisslide, true);
        } else {
            chargeplayer(thisslide, false);
        }
        gtag('event', 'click', {
            'event_category': 'Gallery Slide',
            'event_label': 'Slide prev',
            'value': 1
        });
    }
    chargeplayer(thisslide, false);
    next.addEventListener('click', (event)=>{
        event.preventDefault();
        
        // Check if any video is currently playing globally to maintain autoplay
        let allDivPlaying = document.querySelectorAll('.videoplaying');
        let wasPlaying = allDivPlaying.length > 0;
        
        // Stop current playback globally (as playvideo() does)
        let othersliders = document.querySelectorAll('.slider');
        othersliders.forEach(slider => slider.classList.remove('play'));
        
        let allVideos = document.querySelectorAll('.slider video');
        allVideos.forEach(video => video.pause());
        
        allDivPlaying.forEach(div => div.classList.remove('videoplaying'));
         
         // Navigate and maintain playing state if video was playing
         goNext(wasPlaying);
    });
    prev.addEventListener('click', (event)=>{
        event.preventDefault();
        
        // Check if any video is currently playing globally to maintain autoplay
        let allDivPlaying = document.querySelectorAll('.videoplaying');
        let wasPlaying = allDivPlaying.length > 0;
        
        // Stop current playback globally (as playvideo() does)
        let othersliders = document.querySelectorAll('.slider');
        othersliders.forEach(slider => slider.classList.remove('play'));
        
        let allVideos = document.querySelectorAll('.slider video');
        allVideos.forEach(video => video.pause());
        
        allDivPlaying.forEach(div => div.classList.remove('videoplaying'));
         
         // Navigate and maintain playing state if video was playing
         goPrev(wasPlaying);
    });
    // Store navigation functions on the target element for global access
    target.goNextFunc = goNext;
    target.goPrevFunc = goPrev;
    
    // Only add one global keyboard listener (check if it already exists)
    if (!window.globalSliderKeyboardListenerAdded) {
        window.globalSliderKeyboardListenerAdded = true;
        
        document.addEventListener('keydown', function (e) {
            if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
                                 // Find the currently active/playing slider
                 let activeSlider = document.querySelector('.slider.play') || 
                                  document.querySelector('.slider[data-keyboard-active="true"]') ||
                                  document.querySelector('.slider[data-keyboard-listener="true"]');
                
                if (activeSlider && (activeSlider.goNextFunc || activeSlider.goPrevFunc)) {
                    // Check if any video is currently playing globally to maintain autoplay
                    let allDivPlaying = document.querySelectorAll('.videoplaying');
                    let wasPlaying = allDivPlaying.length > 0;
                    
                    if (e.code === 'ArrowRight' && activeSlider.goNextFunc) {
                        activeSlider.goNextFunc(wasPlaying);
                    } else if (e.code === 'ArrowLeft' && activeSlider.goPrevFunc) {
                        activeSlider.goPrevFunc(wasPlaying);
                    }
                }
            }
        });
    }
    
    // Mark this slider as keyboard-enabled
    target.setAttribute('data-keyboard-listener', 'true');
}