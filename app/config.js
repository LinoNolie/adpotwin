export const APP_CONFIG = {
    API_BASE_URL: 'https://adpot.win/wp-json',
    API_VERSION: 'v1',
    AUTH_ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        SOCIAL_LOGIN: '/auth/social',
        VERIFY_TOKEN: '/auth/verify'
    },
    GAME_ENDPOINTS: {
        GET_POTS: '/pots',
        GET_USER_STATS: '/user/stats',
        PLACE_BET: '/bet/place',
        CASHOUT: '/bet/cashout'
    },
    SOCIAL_CONFIG: {
        FACEBOOK_APP_ID: 'YOUR_FB_APP_ID',
        TWITTER_KEY: 'YOUR_TWITTER_KEY',
        INSTAGRAM_CLIENT_ID: 'YOUR_IG_CLIENT_ID',
        TIKTOK_CLIENT_KEY: 'YOUR_TIKTOK_KEY'
    },
    APP_SETTINGS: {
        THEME: 'dark',
        ANIMATION_ENABLED: true,
        NOTIFICATION_ENABLED: true,
        AUTO_CASHOUT_ENABLED: false,
        DEFAULT_CURRENCY: 'USD'
    }
};