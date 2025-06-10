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
			$post_excerpt = 
            $id = $p->ID;
            $caret = ($i == $j) ? '' : '<div class="caretdiviphone"><a style="scroll-behavior:smooth"><img decoding="async" src="https://camp.mx/img/caret3.svg" style="width:60px; margin:20px"></a></div>';
            
            if ($i != 1) {
                $output .= '<div class="caretdiv"><a href="#' . esc_attr($slide_id) . '" style="scroll-behavior:smooth"><img src="https://camp.mx/img/caret3.svg" style="width:60px; margin:20px" /></a></div></div>';
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
        <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/navigation-v4_0.js"></script>
        <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/slider_vimeo.js"></script>
		<script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/hovers.js"></script>
        <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/assets.js"></script>
        <script type="text/javascript" src="/wp-content/plugins/mxcamp_V3/BgVideoSound.js"></script>
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
?>