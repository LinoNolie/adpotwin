import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { logger } from './logger';
import { analytics } from './analytics';
import { notifications } from './notifications';

class BiometricsManager {
  constructor() {
    this.isAvailable = false;
    this.supportedTypes = [];
    this.initializeBiometrics();
  }

  async initializeBiometrics() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      this.isAvailable = hasHardware && isEnrolled;
      
      if (this.isAvailable) {
        this.supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      }
    } catch (error) {
      logger.error('Biometrics initialization failed', error);
      this.isAvailable = false;
    }
  }

  async authenticate(promptMessage = 'Authenticate to continue') {
    if (!this.isAvailable) {
      throw new Error('Biometric authentication not available');
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use device passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      logger.error('Authentication failed', error);
      throw error;
    }
  }

  getBiometryType() {
    if (Platform.OS === 'ios') {
      if (this.supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'FaceID';
      } else if (this.supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'TouchID';
      }
    } else if (Platform.OS === 'android') {
      return 'Biometric';
    }
    return 'None';
  }

  async checkBiometricSecurity() {
    try {
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
      return securityLevel;
    } catch (error) {
      logger.error('Failed to check biometric security level', error);
      return 'NONE';
    }
  }
}

export const biometrics = new BiometricsManager();