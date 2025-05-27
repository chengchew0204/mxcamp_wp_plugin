function removeVideosFromGallery(){
    let gallerySlides = document.querySelectorAll('.slide-camp .slide');
    if(gallerySlides.length>0){
        for(i=0; i<gallerySlides.length; i++){
            gallerySlides[i].innerHTML ='';
        }
    }
}

function enroute2(){
 
var seconde=0;
setInterval(function () {
  let theBody = document.body;
  if(!theBody.classList.contains('gallery')&&!theBody.classList.contains('galeria')){
    seconde-=1;
    ciel2(seconde);
  }
}, 50);
}
let mapscroll = 1;

function mapScroll() {
  const mapContainer = document.getElementById('imap');
  const mapScrollWidth = mapContainer.scrollWidth; 
  const mapWidth = mapContainer.offsetWidth;

  const isOpen = mapContainer?.parentNode?.parentNode?.parentNode?.parentNode?.className === 'slide_10 opened';

  if (isOpen) {
    setTimeout(() => {
      // Verifica nuevamente si sigue abierto antes de continuar
      const stillOpen = mapContainer?.parentNode?.parentNode?.parentNode?.parentNode?.className === 'slide_10 opened';
      if (!stillOpen) return; // Si ya no está abierto, no hacer nada

      if (mapscroll > 0) {
        if (mapscroll === 1 && mapContainer.scrollLeft === 0) {
          mapscroll = 2;
          return;
        }

        if (mapscroll === 2) {
          const nearEnd = mapContainer.scrollLeft >= mapScrollWidth - mapWidth - 1;

          if (!nearEnd) {
            mapContainer.scrollLeft += 35;
          } else {
            mapscroll = 0;
          }
        }
      }
    }, 500);
  } else {
    mapscroll = 1;
  }
}

function ciel2(seconde){
    if(document.getElementById("galeria")){var ciel = document.getElementById("galeria");}
    else if(document.getElementById("gallery")){var ciel = document.getElementById("gallery");}
    ciel.style.backgroundPosition = seconde + "px 0px";
    mapScroll()
}
function changeLangue(){
  const languageButtons = document.querySelector('.ct-social-box')
  let lastButton = languageButtons.lastElementChild;
  lastButton.setAttribute('target', '_self')
  lastButton.removeAttribute('rel')
  const languagePage = document.documentElement.lang
  if (languagePage==='en-US'){
    lastButton.setAttribute('href', '/');
    lastButton.querySelector('span').style.background="url(https://mx.camp/img/icon/es_mx.png) no-repeat center center !important";
    document.documentElement.setAttribute("translate", "yes");
    console.log('language changed en_US');
  }else{
   lastButton.querySelector('span').style.background="url(https://mx.camp/img/icon/en.png) no-repeat center center !important";
    document.documentElement.setAttribute("translate", "no");
    console.log('language changed es_MX');
  }
}



//Events repace image by 

function ReplaceVideoPage(){
  let thisvideo = document.querySelector('body.single-ajde_events .eventon_full_description video.video-events-grid');
  if(thisvideo && thisvideo!=''){
      console.log('l element video existe bien !');
      console.log(thisvideo)
      //onprepare son parent fullscreen
      let fullScreenDiv = document.createElement('div');
      fullScreenDiv.classList.add('fullscreen');
      //oncherche son futur emplacement
      let thisHeader = eventLightBox.querySelector('.evocard_box.ftimage > div');
      console.log(thisHeader);
      fullScreenDiv.appendChild(thisvideo);
      thisvideo.volume = 0.5;
      thisvideo.muted = false;

      thisHeader.replaceWith(fullScreenDiv);
      console.log('video replaced');
  }else{
      console.log('pas delement video trouve test');
  }
}

function setEventText() {
	let eventTexts = document.getElementsByClassName("eventon_desc_in")
	console.log("eventTexts: ", eventTexts)
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("Loading...", window.location.href)
  ReplaceVideoPage();
  changeLangue();
  enroute2();
  console.log("Loaded...")
});