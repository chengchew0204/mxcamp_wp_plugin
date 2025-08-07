<?php
/**
 * @package MxCamp_v3
 * @version 3.0
 */
/*
Plugin Name: MxCamp Slider V3
Plugin URI: https://nicochap.com
Description: Homepage Slider
Author: Nicolas Chapelain
Version: 3.0
Author URI: https://nicochap.com/
*/
/**
 * Add a hook for a shortcode tag
 */
function MxCamp_shortcodes_init_v3(){
    add_shortcode('mxcamp_get_posts_v3', 'mxcamp_get_posts_cb_v3');
}
add_action('init', 'MxCamp_shortcodes_init_v3');
/**
 * Register a shortcode
 *
 * @param array $atts Array of shortcode attributes
 */
function mxcamp_get_posts_cb_v3($atts) {
    // safeli extract custom arguments and set default values
    $atts = shortcode_atts(
        array(
            'post_type' => 'post',
        ), 
        $atts, 
        'mxcamp_get_posts_v3'
    );
    // define the array of query arguments
    $args = array(
        'cat' => 16,
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => 12,
        'orderby' => 'date',
        'order' => 'DESC'
    );
    $custom_posts = get_posts($args);
    $output = '';
	/**
	// Move MAPA as second item
	
	// Check if there are at least 2 items to avoid errors
	if (count($custom_posts) >= 2) {
		// Get the second item (index 1, since arrays are zero-indexed)
		$second_item = $custom_posts[1];

		// Remove the second item from its current position
		array_splice($custom_posts, 1, 1);

		// Insert the second item at the beginning (index 0)
		array_splice($custom_posts, 0, 0, [$second_item]);
	}**/

    if (!empty($custom_posts)) {
        $output .= '
        <link rel="stylesheet" type="text/css" href="/wp-content/plugins/mxcamp_V3/css/mxcamp_style-v3_0.css">
        <div class="slides" id="slides">
        <div id="inite" style="position: absolute; width: 100vw; height: 100dvh; display: grid; top: 0; left: 0; background:#000000; z-index:10">
        <p style="align-self: center; text-align: center;"><img src="https://camp.mx/img/oval.svg" style="width: 90px; height: auto;"></p>
        </div>
        ';

        $i = 0;
        $j = count($custom_posts);
        foreach ($custom_posts as $p) {
            $i++;
            setup_postdata($p);

            $large_image_url = get_the_post_thumbnail_url($p->ID, 'full');
            $slide_id = get_post_meta($p->ID, 'slide_id', true);
            $slide_title = get_post_meta($p->ID, 'slide_title', true);
            $title = $p->post_title;
			//$post_excerpt = 
            $id = $p->ID;
            $caret = ($i == $j) ? '' : '<div class="caretdiviphone"><a style="scroll-behavior:smooth"><img decoding="async" src="https://camp.mx/img/caret3.svg" style="width:60px; margin:20px"></a></div>';
            
            if ($i != 1) {
                $output .= '<div class="caretdiv"><a data-target-slide="' . esc_attr($slide_id) . '" style="scroll-behavior:smooth"><img src="https://camp.mx/img/caret3.svg" style="width:60px; margin:20px" /></a></div></div>';
            }
            $output .= '
            <div class="slide_10 closed" id="' . esc_attr($slide_id) . '" data-title="' . esc_attr($title) . '" data-post="' . esc_attr($id) . '" style="background-image:url(' . esc_url($large_image_url) . ')">
            <img src="' . esc_url($large_image_url) . '" style="display:none" preload>
            ' . $p->post_excerpt . '
            <div class="slide_10_bg"></div>
            <div class="slide_10_scroll">
            <svg class="ct-icon fakebutton" width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" data-type="type-1"><rect y="0.00" width="18" height="1.7" rx="1"></rect><rect y="6.15" width="18" height="1.7" rx="1"></rect><rect y="12.3" width="18" height="1.7" rx="1"></rect></svg>
            <div class="card ct-container">
            <div class="card-header"><h2>' . $slide_title . '</h2></div>
            <div class="card-content">
            <div class="tap-top"></div>
            <div class="tap-left"></div>
            <div class="tap-right"></div>
            ' . do_shortcode($p->post_content) . '
            <div class="tap-bottom"></div>
            <div class="hoverbackground" onclick="desHoverMe()" onmouseover="desHoverMe()"></div>
            </div>
            </div>
            </div>
            ';
        }
        wp_reset_postdata(); // Reset the global $post variable to the current post in the main query.
        $output .= '
        </div>
        </div>
        <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/navigation-v3_0.js"></script>
        <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/slider_vimeo.js"></script>
		<script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/hovers.js"></script>
        <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/assets.js"></script>
        <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/BgVideoSound.js"></script>
        <!-- <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/add-onmouseover-detail.js"></script> -->
        <script src="https://player.vimeo.com/api/player.js"></script>
		<script>
			document.addEventListener(\'DOMContentLoaded\', () => {
			  const menu = document.getElementById(\'menu-main-menu-es-1\') || document.getElementById(\'menu-main-menu-en-1\');
			  if (menu) {
				const items = menu.querySelectorAll(\'li\');
				items.forEach(li => {
				  const child = li.firstElementChild;
				  if (child && (child.tagName === \'A\')) {
					// Create the outer div
					const outerDiv = document.createElement(\'div\');
					outerDiv.classList.add(\'hover\');
					child.classList.forEach(cls => outerDiv.classList.add(cls));
					const dataPost = child.getAttribute(\'data-post\');
					if (dataPost) {
					  outerDiv.setAttribute(\'data-post\', dataPost);
					}
					outerDiv.style.height = \'2.2em\';
					outerDiv.style.background = \'none\';
					outerDiv.style.padding = \'0px\';
					
					const url = child.getAttribute(\'href\');
					const linkEl = document.createElement(\'a\');
					linkEl.setAttribute(\'href\', url);
					linkEl.setAttribute(\'target\', "_blank");

                    // Create the image element
					const imageUrl = url.includes("senem") ? "https://camp.mx/wp-content/uploads/senem-1.jpg" : "https://camp.mx/wp-content/uploads/worldpackers.jpg";
                    const img = document.createElement(\'img\');
                    img.alt = ""; // Empty alt text as in your example
                    img.classList.add(\'wp-image-846\');
                    img.setAttribute(\'data-src\', url);
                    img.src = imageUrl;
					// img.addEventListener(\'click\', function() {e.preventDefault(); document.appendChild(linkEl); linkEl.click();});
					
					linkEl.appendChild(img);

					// Create the hover-content div
					const hoverContent = document.createElement(\'div\');
					hoverContent.classList.add(\'hover-content\');
					hoverContent.style.marginTop = \'40px\';
                    
                    // Append the image to hoverContent
                     hoverContent.appendChild(linkEl);
//  					const linkText = document.createElement(\'a\');
//  					linkText.setAttribute(\'href\', url);
//  					linkText.setAttribute(\'target\', "_blank");
//  					linkText.textContent = url.includes("senem") ? \'senem.mx\' : \'worldpackers.com\';
//  					linkText.style.setProperty(\'color\', \'black\', \'important\');
//  					linkText.style.setProperty(\'text-transform\', \'lowercase\');
//  					linkText.style.setProperty(\'text-align\', \'center\');
//  					hoverContent.appendChild(linkText);
					
					// Create plain text for menu
					const menuText = document.createElement(\'p\');
					menuText.classList.add(\'menu-item\');
					menuText.classList.add(\'menu-item-type-custom\');
					menuText.classList.add(\'menu-item-object-custom\');
					menuText.textContent = child.textContent;

					// Assemble the structure
					outerDiv.appendChild(hoverContent);
					outerDiv.appendChild(menuText);
					li.removeChild(child);
					li.appendChild(outerDiv);    // Adds outerDiv to the li
				  }
				});
				 const person1 = new Hovers(); 
			  }
			});
		</script>
        ';
        
    } else {
        $output = '<strong>Oops, pas de posts</strong>';
    }

    return $output;
}

/**
 * Inject background click redirect on single event pages
 */
function mxcamp_inject_background_redirect() {
    if (is_singular('ajde_events')) {
        ?>
        <script type="text/javascript">
        (function() {
            'use strict';
            
            function initBackgroundRedirect() {
                console.log('Initializing single event background redirect...');
                
                // Detect language from multiple sources
                let languagePage = document.documentElement.lang;
                
                if (!languagePage || languagePage === '') {
                    if (window.location.href.includes('/en/')) {
                        languagePage = 'en-US';
                    } else if (document.querySelector('a[href*="/en/#"]')) {
                        languagePage = 'en-US';
                    } else if (document.querySelector('#menu-main-menu-en')) {
                        languagePage = 'en-US';
                    } else {
                        languagePage = 'es-ES';
                    }
                }
                
                const isEnglish = languagePage.includes('en');
                const redirectUrl = isEnglish ? 'https://camp.mx/calendar' : 'https://camp.mx/calendario';
                const eventsUrl = isEnglish ? 'https://camp.mx/events' : 'https://camp.mx/eventos';
                
                console.log('Language detected:', languagePage);
                console.log('Redirect URL will be:', redirectUrl);
                console.log('Events URL will be:', eventsUrl);
                console.log('Starting burger menu override process...');
                
                // Override burger menu behavior on single event pages
                function overrideBurgerMenu() {
                    console.log('overrideBurgerMenu function called...');
                    const burgerMenu = document.querySelector('button.ct-header-trigger.ct-toggle');
                    console.log('Burger menu element found:', burgerMenu);
                    if (burgerMenu) {
                        console.log('Found burger menu, overriding behavior...');
                        
                        // Remove data-toggle-panel attribute to prevent default panel behavior
                        burgerMenu.removeAttribute('data-toggle-panel');
                        burgerMenu.removeAttribute('aria-expanded');
                        
                        // Remove any existing click event listeners by cloning the element
                        const newBurgerMenu = burgerMenu.cloneNode(true);
                        newBurgerMenu.removeAttribute('data-toggle-panel');
                        newBurgerMenu.removeAttribute('aria-expanded');
                        burgerMenu.parentNode.replaceChild(newBurgerMenu, burgerMenu);
                        
                        // Add new click event that redirects to events page
                        newBurgerMenu.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Burger menu clicked on single event page, redirecting to:', eventsUrl);
                            
                            // Close the panel if it's open
                            const offcanvas = document.getElementById('offcanvas');
                            if (offcanvas) {
                                offcanvas.classList.remove('active');
                            }
                            
                            // Add transition effect
                            document.body.style.transition = 'opacity 0.2s ease';
                            document.body.style.opacity = '0.9';
                            
                            setTimeout(function() {
                                window.location.href = eventsUrl;
                            }, 150);
                        });
                        
                        console.log('Burger menu behavior overridden for single event page');
                        
                        // Also override any future script attempts to modify the burger menu
                        setTimeout(function() {
                            const checkBurger = document.querySelector('button.ct-header-trigger.ct-toggle');
                            if (checkBurger && checkBurger !== newBurgerMenu) {
                                console.log('Burger menu was replaced by another script, re-overriding...');
                                overrideBurgerMenu();
                            }
                        }, 2000);
                        
                    } else {
                        console.log('Burger menu not found, retrying in 500ms...');
                        setTimeout(overrideBurgerMenu, 500);
                    }
                }
                
                // Call the override function multiple times to ensure it works
                overrideBurgerMenu();
                setTimeout(overrideBurgerMenu, 1000);
                setTimeout(overrideBurgerMenu, 3000);
                
                // Backup approach - direct document click listener for burger menu
                document.addEventListener('click', function(e) {
                    const burgerButton = e.target.closest('button.ct-header-trigger.ct-toggle');
                    if (burgerButton) {
                        console.log('Direct burger menu click intercepted!');
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        // Close the panel if it's open
                        const offcanvas = document.getElementById('offcanvas');
                        if (offcanvas) {
                            offcanvas.classList.remove('active');
                        }
                        
                        console.log('Redirecting to events page from direct listener:', eventsUrl);
                        
                        // Add transition effect
                        document.body.style.transition = 'opacity 0.2s ease';
                        document.body.style.opacity = '0.9';
                        
                        setTimeout(function() {
                            window.location.href = eventsUrl;
                        }, 150);
                    }
                }, true); // Use capture phase to intercept early
                
                document.body.addEventListener('click', function(event) {
                    // Check if this is a burger menu click first
                    if (event.target.closest('button.ct-header-trigger.ct-toggle') || 
                        event.target.closest('.ct-header-trigger')) {
                        console.log('Burger menu click detected, letting it handle the redirect');
                        return;
                    }
                    
                    if (event.target.tagName === 'A' || 
                        event.target.tagName === 'BUTTON' || 
                        event.target.tagName === 'INPUT' || 
                        event.target.tagName === 'TEXTAREA' || 
                        event.target.tagName === 'SELECT' ||
                        event.target.tagName === 'VIDEO' ||
                        event.target.tagName === 'IMG' ||
                        event.target.closest('a') ||
                        event.target.closest('button') ||
                        event.target.closest('form') ||
                        event.target.closest('video') ||
                        event.target.closest('.video-events-grid') ||
                        event.target.closest('.fullscreen.video') ||
                        event.target.closest('nav') ||
                        event.target.closest('header') ||
                        event.target.closest('footer') ||
                        event.target.closest('#offcanvas') ||
                        event.target.closest('.ct-panel') ||
                        event.target.closest('.evolbclose') ||
                        event.target.closest('.ct-social-box') ||
                        event.target.closest('.evcal_evdata_row') ||
                        event.target.closest('.comment-form') ||
                        event.target.closest('.cta') ||
                        event.target.closest('.playbut') ||
                        event.target.closest('.pausebut')) {
                        console.log('Click on interactive element, not redirecting');
                        return;
                    }
                    
                    const main = document.getElementById('main');
                    const mainContainer = document.getElementById('main-container');
                    
                    if ((main && main.contains(event.target)) || 
                        (mainContainer && mainContainer.contains(event.target))) {
                        
                        console.log('Background clicked, redirecting to:', redirectUrl);
                        
                        document.body.style.transition = 'opacity 0.2s ease';
                        document.body.style.opacity = '0.9';
                        
                        setTimeout(function() {
                            window.location.href = redirectUrl;
                        }, 150);
                    }
                });
                
                const style = document.createElement('style');
                style.textContent = `
                    body.single-ajde_events {
                        cursor: pointer;
                    }
                    body.single-ajde_events a,
                    body.single-ajde_events button,
                    body.single-ajde_events input,
                    body.single-ajde_events textarea,
                    body.single-ajde_events select,
                    body.single-ajde_events video,
                    body.single-ajde_events nav,
                    body.single-ajde_events header,
                    body.single-ajde_events footer,
                    body.single-ajde_events .cta,
                    body.single-ajde_events .fullscreen.video,
                    body.single-ajde_events .comment-form {
                        cursor: auto !important;
                    }
                `;
                document.head.appendChild(style);
                
                console.log('Background redirect initialized successfully');
            }
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initBackgroundRedirect);
            } else {
                initBackgroundRedirect();
            }
            
            setTimeout(initBackgroundRedirect, 1000);
            
        })();
        </script>
        <?php
    }
}
add_action('wp_footer', 'mxcamp_inject_background_redirect');

/**
 * Inject hash-based URL redirects for events/eventos to calendar pages
 */
function mxcamp_inject_hash_redirects() {
    ?>
    <script type="text/javascript">
    (function() {
        'use strict';
        
        function checkHashRedirects() {
            const urlHash = window.location.hash;
            const currentPath = window.location.pathname;
            
            if (urlHash) {
                const cleanHash = urlHash.substring(1);
                
                // Redirect #events to calendar (English)
                if (cleanHash === 'events' && (currentPath.includes('/en') || document.documentElement.lang === 'en-US')) {
                    console.log('Redirecting #events to calendar');
                    window.location.href = 'https://camp.mx/calendar';
                    return;
                }
                
                // Redirect #eventos to calendario (Spanish)
                if (cleanHash === 'eventos' && (!currentPath.includes('/en') || document.documentElement.lang === 'es-ES')) {
                    console.log('Redirecting #eventos to calendario');
                    window.location.href = 'https://camp.mx/calendario';
                    return;
                }
            }
        }
        
        // Run immediately if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkHashRedirects);
        } else {
            checkHashRedirects();
        }
        
        // Also check on hash change events
        window.addEventListener('hashchange', checkHashRedirects);
        
    })();
    </script>
    <?php
}
add_action('wp_footer', 'mxcamp_inject_hash_redirects');


?>