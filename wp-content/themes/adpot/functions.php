<?php
function adpot_setup() {
    add_theme_support('title-tag');
    add_theme_support('custom-logo');
}
add_action('after_setup_theme', 'adpot_setup');

function adpot_scripts() {
    wp_enqueue_style('orbitron', 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');
    wp_enqueue_script('adpot-userdata', get_template_directory_uri() . '/assets/js/userDataManager.js', array(), '1.0', true);
    wp_enqueue_script('adpot-payment', get_template_directory_uri() . '/assets/js/paymentProcessor.js', array(), '1.0', true);
    wp_enqueue_script('adpot-pots', get_template_directory_uri() . '/assets/js/pot-timers.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'adpot_scripts');