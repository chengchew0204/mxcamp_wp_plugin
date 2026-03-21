<?php
define('WP_USE_THEMES', false);
require_once __DIR__ . '/wp-load.php';

if (function_exists('do_action')) {
    do_action('breeze_clear_all_cache');
    echo "Breeze cache cleared\n";
} else {
    echo "WordPress not loaded\n";
}