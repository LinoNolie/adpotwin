import { Linking } from 'react-native';
import { analytics } from './analytics';

class DeeplinkHandler {
  constructor() {
    this.handlers = new Map();
    this.initialURL = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      this.initialURL = await Linking.getInitialURL();
      Linking.addEventListener('url', this.handleURL);
      this.initialized = true;

      if (this.initialURL) {
        this.handleURL({ url: this.initialURL });
      }
    } catch (error) {
      console.error('Deeplink initialization error:', error);
    }
  }

  registerHandler(pattern, handler) {
    this.handlers.set(pattern, handler);
  }

  handleURL = ({ url }) => {
    if (!url) return;

    analytics.trackEvent('deeplink_opened', { url });

    try {
      const { hostname, pathname, searchParams } = new URL(url);
      const path = `${hostname}${pathname}`;

      for (const [pattern, handler] of this.handlers) {
        const match = path.match(new RegExp(pattern));
        if (match) {
          handler({
            url,
            path,
            params: match.groups || {},
            queryParams: Object.fromEntries(searchParams),
            full: match
          });
          return;
        }
      }

      console.warn(`No handler found for deeplink: ${url}`);
    } catch (error) {
      console.error('Error handling deeplink:', error);
    }
  }

  createDeeplink(route, params = {}, queryParams = {}) {
    const url = new URL('adpot://' + route);
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url.toString();
  }

  async openDeeplink(route, params = {}, queryParams = {}) {
    const url = this.createDeeplink(route, params, queryParams);
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
    
    console.warn(`Cannot open URL: ${url}`);
    return false;
  }

  destroy() {
    Linking.removeEventListener('url', this.handleURL);
    this.handlers.clear();
    this.initialized = false;
  }
}

export const deeplinking = new DeeplinkHandler();

// Register common routes
deeplinking.registerHandler('game/(?<potId>\\d+)', ({ params }) => {
  // Handle navigation to specific game
  navigation.navigate('Games', { potId: params.potId });
});

deeplinking.registerHandler('profile/(?<userId>\\d+)', ({ params }) => {
  // Handle navigation to user profile
  navigation.navigate('Profile', { userId: params.userId });
});

deeplinking.registerHandler('settings', () => {
  // Handle navigation to settings
  navigation.navigate('Settings');
});