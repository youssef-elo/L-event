import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../styles/globalStyles';

// Simplified SVG without complex filters for better React Native compatibility
const logoSvg = `<svg width="286" height="56" viewBox="0 0 286 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29.9609 10.5V38.85L26.7269 35.7H50.3729V42H22.8209V10.5H29.9609ZM120.284 23.52V28.98H97.7301V23.52H120.284ZM102.518 26.25L100.418 39.606L97.3101 36.078H121.586V42H93.2361L95.6721 26.25L93.2361 10.5H121.376V16.422H97.3101L100.418 12.894L102.518 26.25ZM189.877 23.52V28.98H167.323V23.52H189.877ZM172.111 26.25L170.011 39.606L166.903 36.078H191.179V42H162.829L165.265 26.25L162.829 10.5H190.969V16.422H166.903L170.011 12.894L172.111 26.25ZM246.052 13.692H253.15V42H246.052V13.692ZM233.494 10.5H265.666V16.8H233.494V10.5Z" fill="white"/>
<path d="M143.5 38.85H140.35L153.202 10.5H160.762L145.81 42H137.788L122.878 10.5H130.522L143.5 38.85ZM225.465 37.296L222.987 37.674V10.5H229.917V42H220.887L200.727 14.826L203.163 14.448V42H196.275V10.5H205.515L225.465 37.296Z" fill="#081622"/>
<path d="M67 10H73V15.5712C73 15.5712 72.8485 17.8823 71.2879 19.5506C69.7273 21.2189 67 20.9893 67 20.9893V18.4639C67 18.4639 67.9887 18.3721 68.7727 17.5456C69.5568 16.7191 69.5606 15.7548 69.5606 15.7548H67V10Z" fill="#081520"/>
</svg>`;

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculate responsive dimensions based on screen width
  const logoWidth = Math.min(Math.max(screenWidth * 0.7, 200), 350);
  const logoHeight = logoWidth / 5.1; // Maintain aspect ratio (286:56 = 5.1:1)
  
  // Responsive sizing based on screen width
  const responsiveSizes = {
    // Text sizes
    taglineSize: Math.max(screenWidth * 0.03, 10),
    sectionTitleSize: Math.max(screenWidth * 0.06, 20),
    inputTextSize: Math.max(screenWidth * 0.035, 12), // Same as buttonTextSize
    buttonTextSize: Math.max(screenWidth * 0.035, 12), // Reduced from 0.04 to prevent line breaking
    signInTextSize: Math.max(screenWidth * 0.035, 12), // Same as buttonTextSize
    
    // Spacing and padding
    cardPadding: Math.max(screenWidth * 0.08, 24),
    inputPadding: Math.max(screenWidth * 0.04, 12),
    buttonPadding: Math.max(screenWidth * 0.04, 12),
    borderRadius: Math.max(screenWidth * 0.03, 10),
    cardBorderRadius: Math.max(screenWidth * 0.06, 20),
    
    // Margins
    headerMargin: Math.max(screenHeight * 0.08, 40),
    buttonMargin: Math.max(screenWidth * 0.04, 12),
    inputMargin: Math.max(screenWidth * 0.04, 12),
  };

  const handleLogin = () => {
    onLogin();
  };

  const handle42Auth = () => {
    // Placeholder for 42 authentication
    onLogin();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1987B5', '#0C3A61']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.scrollContainer, { padding: responsiveSizes.cardPadding }]}>
          {/* Header with 1337 EVENT logo */}
          <View style={[styles.header, { marginBottom: responsiveSizes.headerMargin }]}>
            <View style={styles.logoContainer}>
              <SvgXml 
                xml={logoSvg} 
                width={logoWidth}
                height={logoHeight}
              />
              <Text style={[styles.tagline, { fontSize: responsiveSizes.taglineSize }]}>Connect, Participate, Shine!</Text>
            </View>
          </View>

          {/* White card container */}
          <View style={[styles.card, { 
            borderRadius: responsiveSizes.cardBorderRadius, 
            padding: responsiveSizes.cardPadding,
            marginHorizontal: responsiveSizes.inputMargin * 0.6  // Reduced margins to make card 1.15x wider
          }]}>
            <Text style={[styles.sectionTitle, { 
              fontSize: responsiveSizes.sectionTitleSize,
              marginBottom: responsiveSizes.buttonMargin,
              marginTop: responsiveSizes.inputMargin
            }]}>Student</Text>
            
            <TouchableOpacity style={[styles.authButton, { 
              marginTop: responsiveSizes.inputMargin,
              marginBottom: responsiveSizes.buttonMargin,
              borderRadius: responsiveSizes.borderRadius
            }]} onPress={handle42Auth}>
              <LinearGradient
                colors={['#4DA2D9', '#15397E']}
                style={[styles.buttonGradient, { padding: responsiveSizes.buttonPadding }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.authButtonText, { fontSize: responsiveSizes.buttonTextSize }]}>Authenticate with 42</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { 
              fontSize: responsiveSizes.sectionTitleSize,
              marginBottom: responsiveSizes.buttonMargin,
              marginTop: responsiveSizes.buttonMargin
            }]}>Admin</Text>

            <View style={styles.form}>
              <TextInput
                style={[styles.input, { 
                  borderRadius: responsiveSizes.borderRadius,
                  padding: responsiveSizes.inputPadding,
                  marginBottom: responsiveSizes.inputMargin,
                  fontSize: responsiveSizes.inputTextSize
                }]}
                placeholder="login"
                placeholderTextColor="#828282"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { 
                  borderRadius: responsiveSizes.borderRadius,
                  padding: responsiveSizes.inputPadding,
                  marginBottom: responsiveSizes.buttonMargin,
                  fontSize: responsiveSizes.inputTextSize
                }]}
                placeholder="password"
                placeholderTextColor="#828282"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={[styles.signInButton, { 
                marginTop: responsiveSizes.inputMargin,
                borderRadius: responsiveSizes.borderRadius
              }]} onPress={handleLogin}>
                <LinearGradient
                  colors={['#4DA2D9', '#15397E']}
                  style={[styles.buttonGradient, { padding: responsiveSizes.buttonPadding }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.signInButtonText, { fontSize: responsiveSizes.signInTextSize }]}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tagline: {
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: '#FFFFFF',
    letterSpacing: -0.33,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.white,
    ...Shadows.medium,
    elevation: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.text,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    backgroundColor: '#FAFAFA',
    color: Colors.text,
  },
  authButton: {
    overflow: 'hidden',
    ...Shadows.light,
  },
  signInButton: {
    overflow: 'hidden',
    ...Shadows.light,
  },
  buttonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    color: Colors.white,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    letterSpacing: 0.5,
  },
  signInButtonText: {
    color: Colors.white,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    letterSpacing: 0.5,
  },
});
