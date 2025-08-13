
# MxCamp V3 Technical Manual

> **Disclaimer**  
> This document was composed with the assistance of Gemini AI. Use it at your own risk.

## 1. Plugin Overview

The MxCamp V3 Plugin is a highly interactive and visually rich website designed to showcase the MxCamp experience. It combines a custom WordPress theme with a sophisticated, full-page JavaScript-driven slider to create a seamless and immersive user journey.

The core of the site is a vertical-scrolling homepage that presents different aspects of the camp through a series of "slides." Each slide is a full-screen section that can contain a variety of content, including background videos, images, text, and interactive elements. The site is designed to be highly responsive, with a mobile-first approach that ensures a consistent experience across all devices.

### 1.1. Core Features

- **Interactive Homepage Slider**: A full-page, vertical-scrolling slider that serves as the primary navigation and content delivery mechanism.
- **Interactive Map**: A custom-built, image-based map with interactive polygons, hover effects, and multiple layers.
- **Dynamic Content Loading**: Content is loaded dynamically as the user scrolls, creating a seamless and engaging experience.
- **Video Backgrounds**: High-quality video backgrounds are used to create a visually immersive experience.
- **Custom WordPress Integration**: The site is built on WordPress, with a custom plugin and theme that provide a high degree of flexibility and control.
- **Multilingual Support**: The site is available in both English and Spanish, with a custom language switcher that seamlessly toggles between the two.
- **Event Calendar**: An integrated event calendar, powered by the EventON plugin, that is highly customized to match the site's design.
- **Hover Effects**: Interactive hover effects are used throughout the site to provide additional information and create a more engaging experience.

### 1.2. Intended User Experience

The intended user experience is one of immersion and discovery. The site is designed to be visually engaging and easy to navigate, with a focus on showcasing the beauty and excitement of the MxCamp experience. The interactive map, in particular, is designed to be a fun and engaging way for users to explore the camp and its various attractions.

## 2. Architecture & Stack

The MxCamp V3 project is built on a foundation of open-source technologies, with a focus on flexibility, and customization. The architecture is designed to be modular and extensible, allowing for easy maintenance and future development.

### 2.1. Tech Stack

- **WordPress**: The site is built on the WordPress content management system, which provides a robust and flexible foundation for managing content and users.
- **WPBakery**: The WPBakery page builder is used to create and manage the site's pages and layouts.
- **Leaflet.js**: The interactive map is built using the Leaflet.js library, which provides a lightweight and flexible framework for creating interactive maps.
- **Custom JavaScript**: The site features a significant amount of custom JavaScript, which is used to create the interactive slider, manage video playback, and handle other dynamic functionality.
- **Custom CSS**: The site's design is implemented using custom CSS, with a focus on responsive design and cross-browser compatibility.

### 2.2. Hosting Environment

The site is hosted on a standard LAMP stack (Linux, Apache, MySQL, and PHP), which is a common and reliable hosting environment for WordPress sites.

### 2.3. Folder & File Structure

The project's files are organized into a logical and intuitive folder structure, with a focus on separating concerns and promoting code reuse.

- **`mxcamp_V3/`**: The root directory of the project.
  - **`css/`**: Contains the project's CSS files.
    - **`mxcamp_style-v3_0.css`**: The main stylesheet for the project.
  - **`Post Contents/`**: Contains the HTML content for the site's posts.
    - **`leaflet_mapa.html`**: The HTML content for the interactive map.
  - **`add-onmouseover-detail.js`**: A utility script that adds a class to all clickable elements.
  - **`assets.js`**: Contains various utility functions.
  - **`BgVideoSound.js`**: Manages the playback of background videos.
  - **`hovers.js`**: Manages the display of hover content.
  - **`mxcamp.php`**: The main plugin file, which handles the integration with WordPress.
  - **`navigation-v3_0.js`**: The core script for the interactive slider.
  - **`replacevideo-module.js`**: Replaces the featured image in the EventON lightbox with a video.
  - **`slider_vimeo.js`**: Creates and manages the video slider in the gallery.
  - **`WP-AdditionalCustomizedCSS.css`**: Contains additional custom CSS for the project.

## 3. Key Components

The MxCamp V3 project is composed of several key components that work together to create a seamless and immersive user experience. This section provides a detailed explanation of each component and how it contributes to the overall functionality of the site.

### 3.1. Interactive Map

The interactive map is a custom-built, image-based map that allows users to explore the MxCamp property. It's built using the Leaflet.js library and features a variety of interactive elements, including:

- **Interactive Polygons**: The map features transparent polygons that are used to define clickable areas. When a user hovers over a polygon, a contour image is displayed, and when they click on it, a series of layers are toggled, creating an interactive experience.
- **Layer Toggling**: The map uses a series of image overlays to create a multi-layered effect. When a user clicks on a polygon, the `cycleLayer` function is called, which toggles the visibility of the different layers.
- **Hover Effects**: When a user hovers over a polygon, the `showContour` function is called, which displays a contour image that outlines the area.
- **Responsive Handling**: The map is designed to be fully responsive, with a mobile-first approach that ensures a consistent experience across all devices.

### 3.2. Interactive Slider

The interactive slider is the primary navigation and content delivery mechanism for the site. It's a full-page, vertical-scrolling slider that presents different aspects of the camp through a series of "slides." Each slide can contain a variety of content, including background videos, images, text, and interactive elements.

The slider is managed by the `Navigation` class in `navigation-v3_0.js`, which handles everything from the initial loading sequence and slide transitions to complex user interactions like hover previews, video playback, and responsive adjustments.

### 3.3. Multilingual Support

The site is available in both English and Spanish, with a custom language switcher that seamlessly toggles between the two. The language switcher is managed by the `changeLangue` function in `assets.js`, which modifies the language switcher button to toggle between the two languages.

### 3.4. Event Calendar

The site features an integrated event calendar, powered by the EventON plugin, that is highly customized to match the site's design. The calendar is styled using custom CSS in `WP-AdditionalCustomizedCSS.css`, and the `replacevideo-module.js` script is used to replace the featured image in the EventON lightbox with a video.

## 4. Code Analysis

The MxCamp V3 project is built on a foundation of well-structured and modular code. This section provides a detailed analysis of the core scripts and how they integrate to create the project's functionality.

### 4.1. `navigation-v3_0.js`

This script is the heart of the interactive slider and the primary driver of the user experience. It's a sophisticated, custom-built JavaScript module that manages the full-page, interactive slider.

- **`Navigation` Class**: The script is built around the `Navigation` class, which orchestrates the entire user experience. It manages the slider, menu, and all interactive elements.
- **Loading Overlay Management**: A sophisticated system to hide a loading overlay, with multiple triggers and fallbacks.
- **Dynamic Content Injection**: The `addGifToMapBackground` method dynamically creates and injects a video background for the "mapa" and "map" slides, complete with mobile optimizations and error handling.
- **Event Handling**: A structured approach to managing event listeners for various interactions.
- **State Management**: The class tracks the state of the application, including whether a card or menu is open.

### 4.2. `leaflet_mapa.html`

This file contains the HTML and JavaScript for the interactive map. It's a sophisticated and highly customized Leaflet.js implementation that is designed to be embedded within a WordPress environment.

- **Custom CRS**: The map uses `L.CRS.Simple`, indicating that it's an image-based map rather than a traditional geographic map.
- **Image Overlays**: The map is built using a series of image overlays, with a base image and additional layers that are toggled on and off.
- **Interactive Polygons**: The map features interactive polygons that are used to define clickable areas. These polygons are transparent and are used to trigger hover and click events.
- **Layer Cycling**: The `cycleLayer` function manages the toggling of layers when a polygon is clicked, creating an interactive experience.
- **Contour Display**: The `showContour` and `hideContour` functions are used to display and hide contour images when the user hovers over a polygon.
- **WordPress Integration**: The file includes several features that are specifically designed for WordPress compatibility, such as the `mapExit` divs and the `closeMap` function.

### 4.3. `mxcamp_style-v3_0.css`

This stylesheet is the backbone of the project's visual identity, providing a comprehensive set of rules that govern everything from typography and layout to complex animations and responsive design.

- **Custom Fonts**: The `ClearSans` font is used extensively, reinforcing the brand's visual identity.
- **Responsive Design**: The use of media queries is masterful, ensuring a seamless experience across all devices.
- **Slider Styling**: The `.slide_10` class and its variants are used to create a full-screen, interactive slider with complex animations and transitions.
- **Interactive Elements**: The CSS includes styles for hover effects, interactive menus, and other dynamic elements, indicating a close relationship with the project's JavaScript.
- **Third-Party Plugin Styling**: The stylesheet includes extensive customizations for the EventON and HBook plugins, ensuring a consistent design throughout the site.
- **Map Styling**: The CSS includes styles for the interactive map, including the `#gif-detail` element and the various map layers.

## 5. Dependencies & Libraries

The MxCamp V3 project relies on a number of external libraries, plugins, and APIs to provide its functionality. This section provides a comprehensive list of these dependencies and their roles in the project.

### 5.1. Libraries

- **Leaflet.js**: A lightweight and flexible JavaScript library for creating interactive maps. It's used to create the custom, image-based map of the MxCamp property.
- **Vimeo Player API**: A JavaScript library for controlling the Vimeo player. It's used to create and manage the video slider in the gallery.

### 5.2. WordPress Plugins

- **WPBakery**: A page builder plugin that is used to create and manage the site's pages and layouts.
- **EventON**: An event calendar plugin that is used to manage the site's events. It's highly customized to match the site's design.
- **HBook**: A booking plugin that is used to manage reservations for the camp. It's also highly customized to match the site's design.

## 6. Workflow & Logic

The MxCamp V3 project is a highly interactive and dynamic application, with a complex event flow that is driven by user interaction. This section provides a detailed overview of the application's workflow and logic, from the initial page load to the user's interaction with the various components.

### 6.1. Initial Page Load

1.  **WordPress Initialization**: WordPress loads the theme and plugins, including the custom `mxcamp` plugin.
2.  **Shortcode Execution**: The `[mxcamp_get_posts_v3]` shortcode is executed, which queries the database for the latest posts and generates the HTML for the interactive slider.
3.  **JavaScript Initialization**: The various JavaScript files are loaded and executed, including `navigation-v3_0.js`, which initializes the `Navigation` class.
4.  **Slider Initialization**: The `Navigation` class initializes the interactive slider, setting up the initial state and event listeners.
5.  **Loading Overlay**: A loading overlay is displayed while the site is initializing, and is then hidden once the site is ready.

### 6.2. User Interaction

- **Scrolling**: The user can scroll through the slides using the mouse wheel, trackpad, or by clicking on the navigation arrows.
- **Opening a Card**: When the user clicks on a slide, the card is opened, revealing the content of the post.
- **Closing a Card**: The user can close the card by clicking on the close button or by clicking outside of the card.
- **Interacting with the Map**: The user can interact with the map by hovering over and clicking on the interactive polygons.
- **Switching Languages**: The user can switch between English and Spanish by clicking on the language switcher button.
- **Viewing Events**: The user can view the event calendar and click on individual events to view more details.
- **Booking a Reservation**: The user can book a reservation using the HBook plugin.

## 7. Customization & Extensibility

The MxCamp V3 project is designed to be highly customizable and extensible, allowing for easy maintenance and future development. This section provides a detailed guide on how to customize and extend the project's functionality.

### 7.1. Adding/Editing Layers

To add or edit layers on the interactive map, you will need to modify the `areas` object in `leaflet_mapa.html`. This object contains the polygon coordinates and layer images for each area of the map.

To add a new area, simply add a new key to the `areas` object with the following properties:

- **`polygon`**: An array of polygon coordinates.
- **`layers`**: An array of layer image URLs.
- **`contour`**: The URL of the contour image.

To edit an existing area, simply modify the properties of the corresponding key in the `areas` object.

### 7.2. Changing Animations

The site's animations are primarily controlled by CSS, with some additional logic in the JavaScript files. To change the animations, you will need to modify the relevant CSS and JavaScript files.

- **CSS Animations**: The `mxcamp_style-v3_0.css` file contains a number of CSS animations, which can be modified to change the timing, duration, and other properties of the animations.
- **JavaScript Animations**: The `navigation-v3_0.js` file contains some JavaScript-driven animations, which can be modified to change the behavior of the animations.

### 7.3. Adjusting Responsive Layouts

The site's responsive layouts are controlled by media queries in the CSS files. To adjust the responsive layouts, you will need to modify the media queries in the `mxcamp_style-v3_0.css` and `WP-AdditionalCustomizedCSS.css` files.

## 8. Troubleshooting & Common Issues

This section documents known glitches and their possible fixes, as well as general troubleshooting guidance.

### 8.1. Troubleshooting

- **Check the Console**: The first step in troubleshooting any issue is to check the browser's developer console for errors.
- **Clear the Cache**: If you're experiencing issues with the site's styling or functionality, try clearing your browser's cache.
- **Disable Plugins**: If you're experiencing issues with the site's functionality, try disabling all plugins except for the `mxcamp` plugin.
- **Contact Support**: If you're still experiencing issues, please contact the developer for assistance.

## 9. Performance Considerations

The MxCamp V3 project is a highly interactive and visually rich application, which can present some performance challenges. This section provides guidance on how to optimize the site's performance, with a focus on speed, asset loading, and mobile performance.

### 9.1. Asset Optimization

- **Image Compression**: All images should be compressed to reduce their file size.
- **Video Compression**: All videos should be compressed to reduce their file size.
- **Lazy Loading**: The site uses lazy loading to defer the loading of images and videos until they are needed.
- **CDN**: The site uses a content delivery network (CDN) to serve assets from a location that is geographically closer to the user.

### 9.2. Code Optimization

- **Minification**: All CSS and JavaScript files should be minified to reduce their file size.
- **Concatenation**: All CSS and JavaScript files should be concatenated into a single file to reduce the number of HTTP requests.
- **Caching**: The site uses caching to store frequently accessed data in memory, which can significantly improve performance.

### 9.3. Mobile Performance

- **Responsive Images**: The site uses responsive images to serve different image sizes for different screen sizes.
- **Mobile-First CSS**: The site uses a mobile-first approach to CSS, which ensures that the mobile experience is optimized.
- **Touch Events**: The site uses touch events to provide a more responsive experience on mobile devices.

## 10. Maintenance Guide

### 10.1. Debugging

- **Check the Console**: The first step in troubleshooting any issue is to check the browser's developer console for errors.
- **Clear the Cache**: If you're experiencing issues with the site's styling or functionality, try clearing your browser's cache.
- **Disable Plugins**: If you're experiencing issues with the site's functionality, try disabling all plugins except for the `mxcamp` plugin.
- **Contact Support**: If you're still experiencing issues, please contact the developer for assistance.

### 10.2. Extending the System

The MxCamp V3 project is designed to be highly customizable and extensible. To extend the system, you can:

- **Create a new plugin**: You can create a new plugin to add new functionality to the site.
- **Create a child theme**: You can create a child theme to customize the site's design without modifying the parent theme.
- **Modify the existing code**: You can modify the existing code to add new functionality or change the behavior of the site.
