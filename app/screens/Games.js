import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { APP_CONFIG } from '../config';

export default function Games({ route, navigation }) {
  const [betAmount, setBetAmount] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [potDetails, setPotDetails] = useState(null);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    if (route.params?.potId) {
      fetchPotDetails(route.params.potId);
    }
  }, [route.params?.potId]);

  const fetchPotDetails = async (potId) => {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.GAME_ENDPOINTS.GET_POTS}/${potId}`);
      const data = await response.json();
      setPotDetails(data);
    } catch (error) {
      console.error('Error fetching pot details:', error);
    }
  };

  const handlePlaceBet = async () => {
    if (!betAmount || isNaN(betAmount)) {
      Alert.alert('Error', 'Please enter a valid bet amount');
      return;
    }

    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.GAME_ENDPOINTS.PLACE_BET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(betAmount),
          potId: route.params?.potId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsPlaying(true);
        startMultiplierAnimation();
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      Alert.alert('Error', 'Failed to place bet');
    }
  };

  const handleCashout = async () => {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.GAME_ENDPOINTS.CASHOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          potId: route.params?.potId,
          multiplier: multiplier,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsPlaying(false);
        Alert.alert('Success', `Cashed out at ${multiplier}x!`);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error cashing out:', error);
      Alert.alert('Error', 'Failed to cash out');
    }
  };

  const startMultiplierAnimation = () => {
    const interval = setInterval(() => {
      setMultiplier(prev => {
        const newValue = prev + 0.01;
        return parseFloat(newValue.toFixed(2));
      });
    }, 100);

    return () => clearInterval(interval);
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameInfo}>
        <Text style={styles.potTitle}>{potDetails?.title || 'Loading...'}</Text>
        <Text style={styles.potAmount}>
          Pot: ${potDetails?.amount || '0'}
        </Text>
      </View>

      <Animated.View 
        style={[
          styles.multiplierContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={styles.multiplierText}>{multiplier}x</Text>
      </Animated.View>

      {!isPlaying ? (
        <View style={styles.betContainer}>
          <TextInput
            style={styles.betInput}
            placeholder="Enter bet amount"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={betAmount}
            onChangeText={setBetAmount}
          />
          <TouchableOpacity 
            style={styles.betButton}
            onPress={handlePlaceBet}
          >
            <Text style={styles.buttonText}>Place Bet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.cashoutButton}
          onPress={handleCashout}
        >
          <Text style={styles.buttonText}>
            Cash Out (${(parseFloat(betAmount) * multiplier).toFixed(2)})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  gameInfo: {
    marginBottom: 40,
  },
  potTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  potAmount: {
    fontSize: 18,
    color: '#00ff9d',
  },
  multiplierContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  multiplierText: {
    fontSize: 48,
    color: '#00ff9d',
    fontWeight: 'bold',
  },
  betContainer: {
    gap: 16,
  },
  betInput: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
  },
  betButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#00ff9d',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff3333',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});