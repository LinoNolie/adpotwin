class SocialAuthManager {
    constructor() {
        this.providers = {
            facebook: 'https://www.facebook.com/v12.0/dialog/oauth',
            youtube: 'https://accounts.google.com/o/oauth2/v2/auth',
            twitter: 'https://twitter.com/i/oauth2/authorize',
            instagram: 'https://api.instagram.com/oauth/authorize'
        };
        this.clientId = 'your-client-id'; // Replace with actual client IDs
        this.redirectUri = 'https://adpot.win/auth/callback';
    }

    initAuth(provider) {
        const authUrl = this.buildAuthUrl(provider);
        window.location.href = authUrl;
    }

    buildAuthUrl(provider) {
        const base = this.providers[provider];
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: this.getScope(provider)
        });
        return `${base}?${params.toString()}`;
    }

    getScope(provider) {
        switch(provider) {
            case 'facebook': return 'email,public_profile';
            case 'youtube': return 'https://www.googleapis.com/auth/youtube.readonly';
            case 'twitter': return 'tweet.read users.read';
            case 'instagram': return 'basic';
            default: return '';
        }
    }
}