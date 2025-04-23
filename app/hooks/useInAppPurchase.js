import { useState, useEffect, useCallback } from 'react';
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener,
  Product,
  Purchase,
} from 'react-native-iap';
import { analytics } from '../utils/analytics';
import { crashReporter } from '../utils/crashReporting';
import { notifications } from '../utils/notifications';

const productIds = [
  'com.adpot.coins.100',
  'com.adpot.coins.500',
  'com.adpot.coins.1000',
  'com.adpot.premium'
];

export function useInAppPurchase() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initializeIAP = async () => {
      try {
        await RNIap.initConnection();
        await loadProducts();

        purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
          if (purchase.transactionReceipt) {
            await handlePurchaseComplete(purchase);
          }
        });

        purchaseErrorSubscription = purchaseErrorListener((error) => {
          handlePurchaseError(error);
        });

      } catch (error) {
        setError(error);
        crashReporter.logError(error, { context: 'iap_initialization' });
      } finally {
        setLoading(false);
      }
    };

    initializeIAP();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      RNIap.endConnection();
    };
  }, []);

  const loadProducts = async () => {
    try {
      const available = await RNIap.getProducts(productIds);
      setProducts(available);
      
      analytics.trackEvent('iap_products_loaded', {
        count: available.length,
      });
    } catch (error) {
      setError(error);
      crashReporter.logError(error, { context: 'iap_load_products' });
    }
  };

  const handlePurchaseComplete = async (purchase) => {
    try {
      await RNIap.finishTransaction(purchase);
      
      analytics.trackEvent('purchase_completed', {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
      });

      notifications.showAlert(
        'Purchase Successful',
        'Thank you for your purchase!'
      );
    } catch (error) {
      crashReporter.logError(error, { 
        context: 'iap_finish_transaction',
        purchase 
      });
    } finally {
      setPurchaseInProgress(false);
    }
  };

  const handlePurchaseError = (error) => {
    setPurchaseInProgress(false);
    setError(error);
    
    if (error.code !== 'E_USER_CANCELLED') {
      crashReporter.logError(error, { context: 'iap_purchase_error' });
      notifications.showAlert(
        'Purchase Failed',
        'There was an error processing your purchase. Please try again.'
      );
    }
  };

  const purchaseProduct = async (productId) => {
    if (purchaseInProgress) return;
    
    setPurchaseInProgress(true);
    setError(null);

    try {
      await RNIap.requestPurchase(productId, false);
      
      analytics.trackEvent('purchase_initiated', {
        productId,
      });
    } catch (error) {
      handlePurchaseError(error);
    }
  };

  const restorePurchases = async () => {
    setLoading(true);
    setError(null);

    try {
      const restored = await RNIap.getAvailablePurchases();
      
      for (const purchase of restored) {
        await handlePurchaseComplete(purchase);
      }

      analytics.trackEvent('purchases_restored', {
        count: restored.length,
      });

      notifications.showAlert(
        'Purchases Restored',
        'Your purchases have been restored successfully.'
      );

      return restored;
    } catch (error) {
      setError(error);
      crashReporter.logError(error, { context: 'iap_restore_purchases' });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    purchaseInProgress,
    purchaseProduct,
    restorePurchases,
  };
}