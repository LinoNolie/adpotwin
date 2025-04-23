<?php
function adpotwin_setup() {
    add_theme_support('title-tag');
    add_theme_support('custom-logo');
}
add_action('after_setup_theme', 'adpotwin_setup');

function adpotwin_scripts() {
    // Styles
    wp_enqueue_style('adpotwin-style', get_stylesheet_uri());
    wp_enqueue_style('adpotwin-main', get_template_directory_uri() . '/assets/css/index.css');
    wp_enqueue_style('adpotwin-cashout', get_template_directory_uri() . '/assets/css/cashout.css');
    wp_enqueue_style('adpotwin-slot', get_template_directory_uri() . '/assets/css/slot-animation.css');
    wp_enqueue_style('orbitron', 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');

    // Scripts
    wp_enqueue_script('adpotwin-userdata', get_template_directory_uri() . '/assets/js/userDataManager.js', array('jquery'), '1.0', true);
    wp_enqueue_script('adpotwin-payment', get_template_directory_uri() . '/assets/js/paymentProcessor.js', array('jquery'), '1.0', true);
    wp_enqueue_script('adpotwin-pots', get_template_directory_uri() . '/assets/js/pot-timers.js', array('jquery'), '1.0', true);
}
add_action('wp_enqueue_scripts', 'adpotwin_scripts');
