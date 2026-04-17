import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Images from '../../assets';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useStores } from '../../stores/StoreContext';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LoginScreen = observer(() => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const { authStore } = useStores();
  const navigation = useNavigation<LoginNavProp>();

  const handleLogin = () => {
    authStore.login(username.trim(), password.trim());
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Image Mosaic Section */}
      <View style={styles.bgGrid}>
        <View style={[styles.flyerCol, { paddingTop: 20 }]}>
          <Image source={Images.pic1} style={styles.flyerGridImage} resizeMode="cover" />
          <Image source={Images.pic2} style={styles.flyerGridImage} resizeMode="cover" />
          <Image source={Images.pic3} style={styles.flyerGridImage} resizeMode="cover" />
        </View>
        <View style={[styles.flyerCol, { paddingTop: 0 }]}>
          <Image source={Images.pic4} style={styles.flyerGridImage} resizeMode="cover" />
          <Image source={Images.pic5} style={styles.flyerGridImage} resizeMode="cover" />
          <Image source={Images.pic6} style={styles.flyerGridImage} resizeMode="cover" />
        </View>
        <View style={[styles.flyerCol, { paddingTop: 40 }]}>
          <Image source={Images.pic7} style={styles.flyerGridImage} resizeMode="cover" />
          <Image source={Images.pic8} style={styles.flyerGridImage} resizeMode="cover" />
          <Image source={Images.pic9} style={styles.flyerGridImage} resizeMode="cover" />
        </View>
        <View style={[styles.flyerCol, { paddingTop: 10 }]}>
          <Image source={Images.pic10} style={styles.flyerGridImage} resizeMode="cover" />
          <Image source={Images.pic11} style={styles.flyerGridImage} resizeMode="cover" />
          <Image source={Images.pic12} style={styles.flyerGridImage} resizeMode="cover" />
        </View>

        {/* Dark Gradient / Overlay */}
        <View style={styles.overlay}>
          <Image 
            source={Images.logo} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={styles.tagline}>NEW FLYERS EVERY DAY</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Spacer to push the card down and show the background */}
          <View style={styles.spacer} />

          {/* Bottom Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to access your premium flyers</Text>

            {/* Email Input */}
            <View style={[
              styles.inputWrap, 
              focusedInput === 'email' && styles.inputWrapFocused
            ]}>
              <Image 
                source={Images.email} 
                style={styles.inputIcon} 
                resizeMode="contain" 
              />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Password Input */}
            <View style={[
              styles.inputWrap, 
              focusedInput === 'password' && styles.inputWrapFocused
            ]}>
              <Image 
                source={Images.password} 
                style={styles.inputIcon} 
                resizeMode="contain" 
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Image 
                  source={showPass ? Images.eyeOpen : Images.eyeClose} 
                  style={styles.eyeIcon} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialWrap}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Image 
                  source={Images.apple} 
                  style={[styles.socialIcon, { tintColor: Colors.white }]} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Image 
                  source={Images.google} 
                  style={styles.socialIcon} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
});

export default LoginScreen;

const styles = StyleSheet.create({
  flex: { 
    flex: 1, 
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
    flexDirection: 'row',
    backgroundColor: '#000',
    overflow: 'hidden',
    gap: 12,
    paddingHorizontal: 8,
  },
  flyerCol: {
    flex: 1,
    gap: 12,
  },
  flyerGridImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly lighter overlay for more pop
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 20,
  },
  logo: {
    width: 220,
    height: 48,
    marginBottom: 8,
  },
  tagline: {
    color: '#D1D1D1',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  spacer: {
    height: SCREEN_HEIGHT * 0.35, // Clear space for background image to be visible
  },
  card: {
    backgroundColor: '#121212', // Very dark color consistent with image
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.xl,
    paddingTop: 36,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: SCREEN_HEIGHT * 0.65, // Ensure it fills bottom
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSub: { 
    fontSize: FontSize.sm, 
    color: '#9CA3AF', // Gray text
    marginBottom: 32,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#2A2A2A', // Subtle border when not focused
    height: 56,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputWrapFocused: {
    borderColor: '#00A3FF', // Bright blue border matching design when active
  },
  inputIcon: { 
    width: 20, 
    height: 20, 
    tintColor: '#9CA3AF', // Gray tint for icons
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  eyeIcon: { 
    width: 20, 
    height: 20, 
    tintColor: '#9CA3AF',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: Colors.primary, // Red text
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: Colors.primary, // Red button
    borderRadius: BorderRadius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  socialWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  socialBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { 
    fontSize: FontSize.sm, 
    color: '#9CA3AF',
  },
  footerLink: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary, // Red sign up
  },
});
