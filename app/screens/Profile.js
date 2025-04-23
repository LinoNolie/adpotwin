import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { APP_CONFIG } from '../config';

export default function Profile() {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.GAME_ENDPOINTS.GET_USER_STATS}`);
      const data = await response.json();
      setUserStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={{ uri: userStats?.avatar_url || 'https://via.placeholder.com/150' }}
        />
        <Text style={styles.username}>{userStats?.username || 'User'}</Text>
        <Text style={styles.joinDate}>Member since {userStats?.join_date || 'N/A'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>${userStats?.balance || '0'}</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{userStats?.total_wins || '0'}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{userStats?.games_played || '0'}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {userStats?.recent_games?.map((game, index) => (
          <View key={index} style={styles.activityItem}>
            <Text style={styles.activityText}>
              {game.type} - ${game.amount} ({game.result})
            </Text>
            <Text style={styles.activityDate}>{game.date}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {userStats?.achievements?.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDesc}>{achievement.description}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  joinDate: {
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#00ff9d',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activityText: {
    color: '#fff',
  },
  activityDate: {
    color: '#666',
  },
  achievementItem: {
    marginBottom: 15,
  },
  achievementTitle: {
    color: '#00ff9d',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  achievementDesc: {
    color: '#666',
  },
  editButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#00ff9d',
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});