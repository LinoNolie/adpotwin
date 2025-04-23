import { useState, useCallback } from 'react';
import * as Keychain from 'react-native-keychain';
import { crashReporter } from '../utils/crashReporting';

export function useSecureStorage(key, options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { 
    accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    accessible = Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    authenticationPrompt = 'Authenticate to access secure data'
  } = options;

  const getValue = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const credentials = await Keychain.getInternetCredentials(key, {
        accessControl,
        accessible,
        authenticationPrompt
      });
      
      return credentials ? JSON.parse(credentials.password) : null;
    } catch (error) {
      setError(error);
      crashReporter.logError(error, { 
        context: 'secure_storage_get',
        key 
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [key, accessControl, accessible, authenticationPrompt]);

  const setValue = useCallback(async (value) => {
    setLoading(true);
    setError(null);

    try {
      await Keychain.setInternetCredentials(
        key,
        key,
        JSON.stringify(value),
        {
          accessControl,
          accessible,
          authenticationPrompt
        }
      );
      return true;
    } catch (error) {
      setError(error);
      crashReporter.logError(error, { 
        context: 'secure_storage_set',
        key 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [key, accessControl, accessible, authenticationPrompt]);

  const removeValue = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Keychain.resetInternetCredentials(key);
      return true;
    } catch (error) {
      setError(error);
      crashReporter.logError(error, { 
        context: 'secure_storage_remove',
        key 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [key]);

  const clear = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Keychain.resetGenericPassword();
      return true;
    } catch (error) {
      setError(error);
      crashReporter.logError(error, { 
        context: 'secure_storage_clear' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getValue,
    setValue,
    removeValue,
    clear,
    loading,
    error
  };
}