import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { APP_CONFIG } from '../config';

export default function Home({ navigation }) {
  const [pots, setPots] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPots = async () => {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.GAME_ENDPOINTS.GET_POTS}`);
      const data = await response.json();
      setPots(data.pots);
    } catch (error) {
      console.error('Error fetching pots:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPots();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPots();
    const interval = setInterval(fetchPots, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const PotCard = ({ pot }) => (
    <TouchableOpacity
      style={styles.potCard}
      onPress={() => navigation.navigate('Games', { potId: pot.id })}
    >
      <Text style={styles.potTitle}>{pot.title}</Text>
      <Text style={styles.potAmount}>${pot.amount}</Text>
      <View style={styles.potStats}>
        <Text style={styles.statText}>Players: {pot.players}</Text>
        <Text style={styles.statText}>Multiplier: {pot.multiplier}x</Text>
      </View>
      <View style={styles.potProgress}>
        <View 
          style={[styles.progressBar, { width: `${pot.timeLeft}%` }]} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#00ff9d"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Active Pots</Text>
      </View>
      
      <View style={styles.potsContainer}>
        {pots.map(pot => (
          <PotCard key={pot.id} pot={pot} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  potsContainer: {
    padding: 16,
    gap: 16,
  },
  potCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  potTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  potAmount: {
    fontSize: 24,
    color: '#00ff9d',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  potStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statText: {
    color: '#888',
    fontSize: 14,
  },
  potProgress: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff9d',
  },
});