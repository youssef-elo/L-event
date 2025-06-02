import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Dimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { useUser } from '../context/UserContext';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../styles/globalStyles';

export default function ProfileScreen() {
  const { 
    user, 
    logout, 
    refreshUserData, 
    walletName, 
    fullName, 
    email, 
    profileImage, 
    campus, 
    level, 
    wallet, 
    correctionPoints,
    attendedCount,
    volunteeredCount,
    userRating,
    unlockedBadges,
    getUserTitle,
    getRingColor
  } = useUser();
  
  const [refreshing, setRefreshing] = React.useState(false);

  // Get screen dimensions for responsive sizing
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Responsive sizing based on screen width (same as LoginScreen)
  const responsiveSizes = {
    signInTextSize: Math.max(screenWidth * 0.045, 16),
    buttonPadding: Math.max(screenWidth * 0.04, 12),
    borderRadius: Math.max(screenWidth * 0.03, 10),
    inputMargin: Math.max(screenWidth * 0.04, 12),
  };

  // Wallet icon SVG
  const walletIconSvg = `<svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.49637 15C11.6071 15 15 11.6054 15 7.5C15 3.39458 11.5998 0 7.48912 0C3.38569 0 0 3.39458 0 7.5C0 11.6054 3.39294 15 7.49637 15ZM7.49637 13.5058C4.16868 13.5058 1.50797 10.8293 1.50797 7.5C1.50797 4.1707 4.16868 1.50145 7.48912 1.50145C10.8168 1.50145 13.492 4.1707 13.4993 7.5C13.5065 10.8293 10.8241 13.5058 7.49637 13.5058ZM4.52392 8.9942C4.52392 9.19004 4.66167 9.33511 4.86467 9.33511H5.21991L4.91542 10.2345C4.88642 10.3433 4.87192 10.4231 4.87192 10.4956C4.87192 10.793 5.09666 10.9961 5.42291 10.9961C5.70565 10.9961 5.8724 10.8583 5.95215 10.5827L6.34364 9.33511H8.62736L9.01885 10.5899C9.0986 10.8656 9.2581 10.9961 9.55534 10.9961C9.87434 10.9961 10.0991 10.793 10.0991 10.4956C10.0991 10.4231 10.0846 10.3433 10.0483 10.2345L9.74384 9.33511H10.1136C10.3166 9.33511 10.4543 9.19004 10.4543 8.9942C10.4543 8.79836 10.3166 8.65329 10.1136 8.65329H9.52634L9.33784 8.06576H10.1136C10.3166 8.06576 10.4543 7.91344 10.4543 7.7176C10.4543 7.52901 10.3166 7.37669 10.1136 7.37669H9.1131L8.21411 4.62041C8.10536 4.2795 7.85887 4.06915 7.48912 4.06915C7.10488 4.06915 6.85839 4.27224 6.74964 4.62041L5.85065 7.37669H4.86467C4.66167 7.37669 4.52392 7.52901 4.52392 7.7176C4.52392 7.91344 4.66167 8.06576 4.86467 8.06576H5.62591L5.43741 8.65329H4.86467C4.66167 8.65329 4.52392 8.79836 4.52392 8.9942ZM6.92363 7.37669L7.48912 5.54884L8.04737 7.37669H6.92363ZM6.53939 8.65329L6.72064 8.06576H8.25036L8.43161 8.65329H6.53939Z" fill="#15397E"/>
</svg>`;

  // Badge images - we need to import them directly as require doesn't work with dynamic values
  const badgeImages = [
    require('../../assets/badge1.png'),
    require('../../assets/badge2.png'),
    require('../../assets/badge3.png'),
    require('../../assets/badge4.png'),
    require('../../assets/badge5.png'),
  ];

  // Grey badge images for locked badges
  const greyBadgeImages = [
    require('../../assets/grey1.png'),
    require('../../assets/grey2.png'),
    require('../../assets/grey3.png'),
    require('../../assets/grey4.png'),
    require('../../assets/grey5.png'),
  ];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with profile image and basic info */}
        <LinearGradient
          colors={['#1987B5', '#0C3A61']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.statusText}>{getUserTitle(unlockedBadges)}</Text>
            
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <View style={[styles.profileImageRing, { borderColor: getRingColor(unlockedBadges) }]}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Ionicons name="person" size={50} color={Colors.white} />
                    </View>
                  )}
                  {/* Latest badge icon at bottom of ring - only show if user has unlocked badges */}
                  {unlockedBadges > 0 && (
                    <View style={styles.latestBadgeContainer}>
                      <Image
                        source={badgeImages[Math.max(0, unlockedBadges - 1)]} // Show the latest unlocked badge
                        style={styles.latestBadgeIcon}
                      />
                    </View>
                  )}
                </View>
              </View>
              
              <Text style={styles.walletName}>{walletName}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content area - ready for new implementation */}
        <View style={styles.contentContainer}>
          {/* User full name */}
          <Text style={styles.fullNameText}>{fullName}</Text>
          
          {/* Wallet amount with icon */}
          <View style={styles.walletContainer}>
            <Text style={styles.walletAmount}>{wallet}</Text>
            <View style={styles.walletIcon}>
              <SvgXml xml={walletIconSvg} width={24} height={24} />
            </View>
          </View>

          {/* Statistics Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Attended</Text>
              <Text style={styles.statValue}>{attendedCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Volunteered</Text>
              <Text style={styles.statValue}>{volunteeredCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rating</Text>
              <Text style={styles.statValue}>{userRating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Badges Section */}
          <View style={styles.badgesSection}>
            <Text style={styles.badgesTitle}>Your Badges</Text>
            <View style={styles.badgesContainer}>
              {/* First row: badges 1-3 */}
              <View style={styles.badgeRow}>
                {[0, 1, 2].map((index) => {
                  const badgeNumber = index + 1;
                  const isUnlocked = badgeNumber <= unlockedBadges;
                  return (
                    <View key={badgeNumber} style={styles.badgeWrapper}>
                      <Image
                        source={isUnlocked ? badgeImages[index] : greyBadgeImages[index]}
                        style={styles.badgeImage}
                      />
                    </View>
                  );
                })}
              </View>
              
              {/* Second row: badges 4-5 */}
              <View style={styles.badgeRow}>
                {[3, 4].map((index) => {
                  const badgeNumber = index + 1;
                  const isUnlocked = badgeNumber <= unlockedBadges;
                  return (
                    <View key={badgeNumber} style={styles.badgeWrapper}>
                      <Image
                        source={isUnlocked ? badgeImages[index] : greyBadgeImages[index]}
                        style={
                          badgeNumber === 5 ? styles.badgeImageXLarge :
                          badgeNumber === 4 ? styles.badgeImageLarge :
                          styles.badgeImage
                        }
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={[styles.logoutButton, { 
            marginTop: 5,
            borderRadius: responsiveSizes.borderRadius
          }]} onPress={handleLogout}>
            <LinearGradient
              colors={['#4DA2D9', '#15397E']}
              style={[styles.buttonGradient, { padding: responsiveSizes.buttonPadding }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.logoutButtonText, { fontSize: responsiveSizes.signInTextSize }]}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 46,
    paddingBottom: 40,
    paddingHorizontal: Spacing.large + 5,
  },
  headerContent: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontFamily: 'Unbounded-Medium',
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: -0.33,
    marginBottom: 20,
    marginTop: 10,
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 25,
  },
  profileImageRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#4DA2D9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.lightGray,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestBadgeContainer: {
    position: 'absolute',
    bottom: -5,
    right: 5,
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 3,
  },
  latestBadgeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  walletName: {
    fontSize: 15,
    fontFamily: 'Unbounded-Medium',
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: -0.33,
    marginBottom: -0,
  },
  contentContainer: {
    flex: 1,
    padding: Spacing.large,
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -15,
    paddingTop: 10,
    alignItems: 'center',
  },
  fullNameText: {
    fontSize: 24,
    fontFamily: 'Unbounded-Medium',
    fontWeight: '500',
    color: '#15397E',
    marginBottom: 5,
    textAlign: 'center',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.medium,
  },
  walletAmount: {
    fontSize: 18,
    fontFamily: 'Unbounded-Medium',
    fontWeight: '500',
    color: '#15397E',
  },
  walletIcon: {
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: '700',
    color: '#15397E',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: '700',
    color: '#15397E',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#15397E',
    marginHorizontal: 15,
  },
  badgesSection: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 0,
  },
  badgesTitle: {
    fontSize: 18,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: '700',
    color: '#15397E',
    textAlign: 'center',
    marginBottom: 20,
    paddingLeft: 0,
  },
  badgesContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 15,
  },
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  badgeImage: {
    width: 57,
    height: 57,
    resizeMode: 'contain',
  },
  badgeImageLarge: {
    width: 71,
    height: 71,
    resizeMode: 'contain',
  },
  badgeImageXLarge: {
    width: 81,
    height: 81,
    resizeMode: 'contain',
  },
  logoutButton: {
    overflow: 'hidden',
    ...Shadows.light,
    width: '85%',
    marginBottom: 20,
  },
  buttonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: Colors.white,
    fontFamily: 'Unbounded-Bold',
    fontWeight: Fonts.getFontWeight('bold'),
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.error,
    textAlign: 'center',
  },
});
