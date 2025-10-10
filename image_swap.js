// document.addEventListener("DOMContentLoaded", () => {
window.addEventListener("load", () => {
  // Everything is fully loaded:
  // - DOM is parsed
  // - Stylesheets applied
  // - Images and other media loaded
  // - Fonts, if blocking, are also ready
    document.querySelectorAll(".slide_10[data-bg-high-res]").forEach(slide => {
        const highResUrl = slide.dataset.bgHighRes;
        const highResImg = new Image();

        // Attempt to load high-res in the background
        highResImg.src = highResUrl;

        highResImg.onload = () => {
        // Smooth fade-in when high-res is ready
        slide.style.transition = "background-image 0.4s ease, opacity 0.4s ease";
        slide.style.opacity = 0.6;
        setTimeout(() => {
            slide.style.backgroundImage = `url('${highResUrl}')`;
            slide.style.opacity = 1;
        }, 200);
        };

        highResImg.onerror = () => {
        // Graceful fallback — just keep low-res
        console.warn(`⚠️ Failed to load high-res image: ${highResUrl}`);
        slide.dataset.loadError = "true"; // optional flag
        };
    })
});