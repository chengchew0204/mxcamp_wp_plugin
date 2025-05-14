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
//                 spinnerContainer.style.width = '100%';
//                 spinnerContainer.style.heigth = '100%';
//                 spinnerContainer.style.top = '0';
//                 spinnerContainer.style.display = 'flex';
//                 spinnerContainer.style.alignItems = 'center';
//                 spinnerContainer.style.justifyContent = 'center';
//                 spinnerContainer.style.aspectRatio = '1/1';
//                 spinnerContainer.style.position = 'absolute';
//                 spinnerContainer.style.zIndex = '10';
                spinnerContainer.innerHTML=spinner;
				spinnerContainer.classList.add('card-video-loader');
                

                console.log('l element video existe bien !');
                //thisvideo.classList.remove('video-events-grid');
                console.log(thisvideo)
                //onprepare son parent fullscreen
                thisvideo.controls = false;
                let fullScreenDiv = document.createElement('div');
                fullScreenDiv.classList.add('fullscreen');
                //oncherche son futur emplacement
                let thisHeader = eventLightBox.querySelector('.evocard_box.ftimage > div');
                console.log(thisHeader);
                fullScreenDiv.appendChild(thisvideo);
                fullScreenDiv.appendChild(spinnerContainer);
                thisvideo.volume = 0.5;
                thisvideo.muted = false;
                setTimeout(() => {
					thisvideo.play();
				}, 1500);
                var controlsVisible = false;
                thisvideo.addEventListener('timeupdate', function () {
                    if (thisvideo.currentTime >= 0.5 && !controlsVisible) {
                        thisvideo.controls = true;
                        controlsVisible = false;
                        spinnerContainer.style.display="none";
                    }
                });
                //thisHeader.innerHTML= fullScreenDiv.appendChild(thisvideo);
                thisHeader.appendChild(fullScreenDiv);
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
            if (mutation.type === "childList") {
              console.log("A child node has been added or removed.");
              searchAndReplace();
            } else if (mutation.type === "attributes") {
              console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
          }
        };
        
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);
        
        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
        
        // Later, you can stop observing
//        observer.disconnect();

        
    }
}
replaceByVideo();
