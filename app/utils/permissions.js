import { Platform, PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { notifications } from './notifications';
import { analytics } from './analytics';

class PermissionsManager {
  constructor() {
    this.cachedPermissions = new Map();
  }

  async checkPermission(permission) {
    try {
      if (this.cachedPermissions.has(permission)) {
        return this.cachedPermissions.get(permission);
      }

      const result = await check(this.getPermissionConstant(permission));
      this.cachedPermissions.set(permission, result);
      return result;
    } catch (error) {
      console.error('Permission check error:', error);
      return RESULTS.DENIED;
    }
  }

  async requestPermission(permission) {
    try {
      const result = await request(this.getPermissionConstant(permission));
      this.cachedPermissions.set(permission, result);
      
      analytics.trackEvent('permission_request', {
        permission,
        result,
      });

      return result;
    } catch (error) {
      console.error('Permission request error:', error);
      return RESULTS.DENIED;
    }
  }

  getPermissionConstant(permission) {
    const platform = Platform.select({
      ios: PERMISSIONS.IOS,
      android: PERMISSIONS.ANDROID,
    });

    switch (permission) {
      case 'camera':
        return platform.CAMERA;
      case 'photos':
        return Platform.OS === 'ios' 
          ? platform.PHOTO_LIBRARY 
          : platform.READ_EXTERNAL_STORAGE;
      case 'notifications':
        return platform.NOTIFICATIONS;
      case 'location':
        return platform.LOCATION_WHEN_IN_USE;
      default:
        throw new Error(`Unknown permission: ${permission}`);
    }
  }

  async ensurePermission(permission, rationale) {
    const status = await this.checkPermission(permission);

    if (status === RESULTS.DENIED) {
      if (rationale) {
        await notifications.showAlert(
          'Permission Required',
          rationale,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings',
              onPress: () => this.requestPermission(permission)
            }
          ]
        );
      } else {
        return await this.requestPermission(permission);
      }
    }

    return status === RESULTS.GRANTED;
  }

  async requestMultiplePermissions(permissions) {
    const results = {};
    for (const permission of permissions) {
      results[permission] = await this.requestPermission(permission);
    }
    return results;
  }

  clearCache() {
    this.cachedPermissions.clear();
  }
}

export const permissions = new PermissionsManager();