function replaceByVideo(){

    let checkIfCalendarExist = setInterval(lookForIt, 100);
    

    function lookForIt(){
        let eventLightBox = document.getElementById('evo_lightboxes');
        
        if(eventLightBox){
            //Interval pour chercher l'élément
            console.log('evo_lightboxes is here');
            clearInterval(checkIfCalendarExist);
            replaceNow();
        }else{
            console.log('searching evo_lightboxes');
        }
    }
    
    function replaceNow(){
        function searchAndReplace(){
            let eventLightBox = document.getElementById('evo_lightboxes');
            let thisvideo = eventLightBox.querySelector('.eventon_full_description video.video-events-grid');
            if(thisvideo && thisvideo!=''){

                //initialisation du spiner
                let spinnerContainer =  document.createElement('div');
                let spinner = `<img src="/img/oval.svg" style="width: 70px;height: auto; margin:auto">`;
                spinnerContainer.innerHTML=spinner;
				spinnerContainer.classList.add('card-video-loader');
                

                console.log('l element video existe bien !');
                console.log(thisvideo)
                
                // Store original video source for reloading if needed
                const originalSrc = thisvideo.src;
                
                //onprepare son parent fullscreen
                let fullScreenDiv = document.createElement('div');
                fullScreenDiv.classList.add('fullscreen');
                //oncherche son futur emplacement
                let thisHeader = eventLightBox.querySelector('.evocard_box.ftimage > div');
                console.log(thisHeader);
                
                // Move video to new container first
                fullScreenDiv.appendChild(thisvideo);
                fullScreenDiv.appendChild(spinnerContainer);
                thisHeader.appendChild(fullScreenDiv);
                
                // Reset video properties after moving
                thisvideo.controls = false;
                thisvideo.volume = 0.5;
                thisvideo.muted = false;
                
                // Reload the video source to ensure proper loading after DOM move
                if (originalSrc) {
                    thisvideo.src = originalSrc;
                    thisvideo.load(); // Force reload
                }
                
                var controlsVisible = false;
                
                // Function to safely play video with error handling
                function playVideoSafely() {
                    const playPromise = thisvideo.play();
                    
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log('Video started playing successfully');
                            })
                            .catch(error => {
                                console.log('Video play failed:', error);
                                // Try to play muted if unmuted play fails
                                thisvideo.muted = true;
                                thisvideo.play()
                                    .then(() => {
                                        console.log('Video started playing muted');
                                    })
                                    .catch(mutedError => {
                                        console.log('Muted video play also failed:', mutedError);
                                    });
                            });
                    }
                }
                
                // Wait for video to be ready before playing
                function onVideoReady() {
                    console.log('Video is ready to play');
                    setTimeout(() => {
                        playVideoSafely();
                    }, 500); // Shorter delay since video is ready
                }
                
                // Check if video is already ready
                if (thisvideo.readyState >= 3) { // HAVE_FUTURE_DATA or greater
                    onVideoReady();
                } else {
                    // Wait for video to be ready
                    thisvideo.addEventListener('canplay', onVideoReady, { once: true });
                    
                    // Fallback timeout in case canplay doesn't fire
                    setTimeout(() => {
                        if (thisvideo.readyState < 3) {
                            console.log('Video still not ready, trying to play anyway');
                            playVideoSafely();
                        }
                    }, 3000);
                }
                
                // Handle timeupdate for showing controls
                thisvideo.addEventListener('timeupdate', function () {
                    if (thisvideo.currentTime >= 0.5 && !controlsVisible) {
                        thisvideo.controls = true;
                        controlsVisible = true; // Fixed: was set to false
                        spinnerContainer.style.display="none";
                        console.log('Controls shown and spinner hidden');
                    }
                });
                
                // Handle video loading errors
                thisvideo.addEventListener('error', function(e) {
                    console.error('Video loading error:', e);
                    spinnerContainer.style.display="none";
                });
                
                // Handle video stalling
                thisvideo.addEventListener('stalled', function(e) {
                    console.log('Video loading stalled');
                });
                
                console.log('video replaced');
            }else{
                console.log('pas delement video trouve');
            }
        }
        let targetNode = document.getElementById('evo_lightboxes');
        console.log(targetNode);
        //element trouver, on lui attribut un event
        const config = { attributes: true, childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        const callback = (mutationList, observer) => {
          for (const mutation of mutationList) {
//
            if (mutation.type === "childList") {
              console.log("A child node has been added or removed.");
              searchAndReplace();
            } else if (mutation.type === "attributes") {
              console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
          }
        };

        //TEST
        // Create an observer instance linked to the callback function 
        const observer = new MutationObserver(callback);
        
        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
        
        // Later, you can stop observing
//        observer.disconnect();

        
    }
}
replaceByVideo();
