import { useRef, useCallback } from 'react';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { analytics } from '../utils/analytics';
import { deeplinking } from '../utils/deeplinking';

export function useNavigationHistory() {
  const navigation = useNavigation();
  const routes = useNavigationState(state => state.routes);
  const historyRef = useRef([]);

  const getCurrentRoute = useCallback(() => {
    const currentRoute = routes[routes.length - 1];
    return {
      name: currentRoute.name,
      params: currentRoute.params,
      timestamp: Date.now()
    };
  }, [routes]);

  const navigateWithHistory = useCallback((routeName, params = {}) => {
    const currentRoute = getCurrentRoute();
    historyRef.current.push(currentRoute);

    analytics.trackEvent('screen_navigation', {
      from: currentRoute.name,
      to: routeName,
      params
    });

    navigation.navigate(routeName, params);
  }, [navigation, getCurrentRoute]);

  const goBack = useCallback(() => {
    if (historyRef.current.length > 0) {
      const previousRoute = historyRef.current.pop();
      
      analytics.trackEvent('navigation_back', {
        from: getCurrentRoute().name,
        to: previousRoute.name
      });

      navigation.navigate(previousRoute.name, previousRoute.params);
      return true;
    }
    return false;
  }, [navigation, getCurrentRoute]);

  const resetHistory = useCallback(() => {
    historyRef.current = [];
  }, []);

  const getNavigationLink = useCallback((routeName, params = {}) => {
    return deeplinking.createDeeplink(routeName, params);
  }, []);

  const getHistory = useCallback(() => {
    return [...historyRef.current];
  }, []);

  const canGoBack = useCallback(() => {
    return historyRef.current.length > 0;
  }, []);

  const clearHistoryAndNavigate = useCallback((routeName, params = {}) => {
    resetHistory();
    navigation.reset({
      index: 0,
      routes: [{ name: routeName, params }],
    });
  }, [navigation, resetHistory]);

  return {
    navigateWithHistory,
    goBack,
    resetHistory,
    getNavigationLink,
    getHistory,
    canGoBack,
    clearHistoryAndNavigate,
    currentRoute: getCurrentRoute()
  };
}