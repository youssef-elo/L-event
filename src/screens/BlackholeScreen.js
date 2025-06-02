import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

export default function BlackholeScreen() {
  const { user, accessToken, refreshUserData } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [blackholeData, setBlackholeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlackholeData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshUserData(), fetchBlackholeData()]);
    setRefreshing(false);
  }, [refreshUserData]);

  const fetchBlackholeData = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      // Get detailed cursus information
      const response = await fetch(`https://api.intra.42.fr/v2/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBlackholeData(data);
      }
    } catch (error) {
      console.error('Error fetching blackhole data:', error);
      Alert.alert('Error', 'Failed to fetch blackhole information');
    } finally {
      setLoading(false);
    }
  };

  const calculateBlackholeCountdown = () => {
    if (!blackholeData || !blackholeData.cursus_users) return null;

    // Find the 42cursus
    const cursus42 = blackholeData.cursus_users.find(cu => cu.cursus.name === '42cursus');
    if (!cursus42 || !cursus42.blackholed_at) return null;

    const blackholeDate = new Date(cursus42.blackholed_at);
    const currentDate = new Date();
    const timeDiff = blackholeDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return {
      date: blackholeDate,
      daysRemaining: daysDiff,
      isActive: daysDiff > 0,
      cursus: cursus42,
    };
  };

  const blackholeInfo = calculateBlackholeCountdown();

  const getBlackholeStatus = () => {
    if (!blackholeInfo) return { status: 'No Data', color: Colors.textSecondary };
    
    if (!blackholeInfo.isActive) {
      return { status: 'Blackholed', color: Colors.error };
    } else if (blackholeInfo.daysRemaining <= 30) {
      return { status: 'Critical', color: Colors.error };
    } else if (blackholeInfo.daysRemaining <= 90) {
      return { status: 'Warning', color: '#FF8C00' };
    } else {
      return { status: 'Safe', color: Colors.success };
    }
  };

  const statusInfo = getBlackholeStatus();

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#1987B5" />
        <LinearGradient
          colors={['#1987B5', '#0C3A61']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Blackhole Status</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading blackhole data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1987B5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1987B5', '#0C3A61']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Blackhole Status</Text>
        <Text style={styles.headerSubtitle}>
          {user?.walletName || user?.login || 'Student'}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {blackholeInfo ? (
          <>
            {/* Main Countdown Card */}
            <View style={styles.countdownCard}>
              <LinearGradient
                colors={statusInfo.status === 'Safe' ? ['#4CAF50', '#2E7D32'] : 
                       statusInfo.status === 'Warning' ? ['#FF8C00', '#E65100'] :
                       ['#F44336', '#C62828']}
                style={styles.countdownGradient}
              >
                <Ionicons 
                  name={statusInfo.status === 'Safe' ? 'shield-checkmark' : 
                        statusInfo.status === 'Warning' ? 'warning' : 'skull'} 
                  size={60} 
                  color={Colors.white} 
                  style={styles.countdownIcon}
                />
                
                <Text style={styles.countdownNumber}>
                  {blackholeInfo.isActive ? blackholeInfo.daysRemaining : '0'}
                </Text>
                
                <Text style={styles.countdownLabel}>
                  {blackholeInfo.isActive ? 'Days Remaining' : 'Days Overdue'}
                </Text>
                
                <Text style={styles.statusBadge}>
                  {statusInfo.status}
                </Text>
              </LinearGradient>
            </View>

            {/* Blackhole Date Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Blackhole Information</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Blackhole Date:</Text>
                <Text style={styles.infoValue}>
                  {blackholeInfo.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Time:</Text>
                <Text style={styles.infoValue}>
                  {blackholeInfo.date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Cursus:</Text>
                <Text style={styles.infoValue}>
                  {blackholeInfo.cursus.cursus.name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="trending-up-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Current Level:</Text>
                <Text style={styles.infoValue}>
                  {blackholeInfo.cursus.level?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>

            {/* Tips Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>
                <Ionicons name="bulb-outline" size={20} color={Colors.primary} /> 
                {' '}Tips to Avoid Blackhole
              </Text>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>1.</Text>
                <Text style={styles.tipText}>Complete projects before deadlines</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>2.</Text>
                <Text style={styles.tipText}>Participate in events and hackathons</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>3.</Text>
                <Text style={styles.tipText}>Do peer evaluations regularly</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>4.</Text>
                <Text style={styles.tipText}>Stay active in the 42 community</Text>
              </View>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity style={styles.refreshButton} onPress={() => onRefresh()}>
              <Ionicons name="refresh-outline" size={20} color={Colors.white} />
              <Text style={styles.refreshText}>Refresh Data</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.noDataCard}>
            <Ionicons name="information-circle-outline" size={60} color={Colors.textSecondary} />
            <Text style={styles.noDataTitle}>No Blackhole Data</Text>
            <Text style={styles.noDataText}>
              Unable to fetch blackhole information. This might be because:
            </Text>
            <Text style={styles.noDataReason}>• You're not enrolled in the 42cursus</Text>
            <Text style={styles.noDataReason}>• Your blackhole date hasn't been set</Text>
            <Text style={styles.noDataReason}>• There's an API connectivity issue</Text>
            
            <TouchableOpacity style={styles.retryButton} onPress={fetchBlackholeData}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: Spacing.large,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.textSecondary,
  },
  countdownCard: {
    marginTop: -40,
    marginBottom: Spacing.large,
    borderRadius: BorderRadius.large,
    overflow: 'hidden',
    ...Shadows.large,
  },
  countdownGradient: {
    padding: Spacing.xlarge,
    alignItems: 'center',
  },
  countdownIcon: {
    marginBottom: Spacing.medium,
  },
  countdownNumber: {
    fontSize: 72,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.white,
    lineHeight: 80,
  },
  countdownLabel: {
    fontSize: 18,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.white,
    marginBottom: Spacing.small,
  },
  statusBadge: {
    fontSize: 14,
    fontFamily: Fonts.getFontFamily('semibold'),
    color: Colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    borderRadius: BorderRadius.small,
    overflow: 'hidden',
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: Spacing.large,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.medium,
    ...Shadows.light,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.text,
    marginBottom: Spacing.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.textSecondary,
    marginLeft: Spacing.small,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.text,
    flex: 1.5,
    textAlign: 'right',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.small,
  },
  tipNumber: {
    fontSize: 14,
    fontFamily: Fonts.getFontFamily('semibold'),
    color: Colors.primary,
    marginRight: Spacing.small,
    width: 20,
  },
  tipText: {
    fontSize: 14,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.medium,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.xlarge,
    ...Shadows.light,
  },
  refreshText: {
    fontSize: 16,
    fontFamily: Fonts.getFontFamily('semibold'),
    color: Colors.white,
    marginLeft: Spacing.small,
  },
  noDataCard: {
    backgroundColor: Colors.white,
    padding: Spacing.xlarge,
    borderRadius: BorderRadius.medium,
    marginTop: Spacing.large,
    alignItems: 'center',
    ...Shadows.light,
  },
  noDataTitle: {
    fontSize: 20,
    fontFamily: Fonts.getFontFamily('semibold'),
    color: Colors.text,
    marginTop: Spacing.medium,
    marginBottom: Spacing.small,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.medium,
  },
  noDataReason: {
    fontSize: 12,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.medium,
    borderRadius: BorderRadius.medium,
    marginTop: Spacing.medium,
  },
  retryText: {
    fontSize: 14,
    fontFamily: Fonts.getFontFamily('semibold'),
    color: Colors.white,
  },
});
