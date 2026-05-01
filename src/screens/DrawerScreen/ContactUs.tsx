import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageSourcePropType,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getApiUrl } from '../../services/api';
import Typography from '../../theme/typography';
import Colors from '../../theme/colors';
import Images from '../../assets';
import AppImages from '../../assets/App';
import ScreenHeader from '../../components/common/ScreenHeader';

const MAX_MESSAGE_LENGTH = 500;

interface InfoCardData {
  id: string;
  icon: ImageSourcePropType;
  title: string;
  subtitle: string;
}

const INFO_CARDS: InfoCardData[] = [
  {
    id: 'email',
    icon: Images.email,
    title: 'Email',
    subtitle: 'admin@grodify.com',
  },
  {
    id: 'response',
    icon: AppImages.time,
    title: 'Response Time',
    subtitle: 'Within 24 hours',
  },
  {
    id: 'support',
    icon: Images.contactus,
    title: 'Support',
    subtitle:
      'Our team is here to help you with any questions about our flyers or services.',
  },
];

const ContactUsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messageCount = useMemo(() => message.length, [message]);

  const handleMessageChange = useCallback((text: string) => {
    if (text.length <= MAX_MESSAGE_LENGTH) setMessage(text);
  }, []);

  const handleSend = useCallback(async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill out all fields.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: "Message sent! We'll get back to you soon.",
        });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to send message. Please try again later.',
        });
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'An error occurred. Please check your connection.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [name, email, subject, message]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader
          title="CONTACT US"
          onBackPress={handleBack}
          showAvatar={false}
          showSearch={false}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtitle */}
          <View style={styles.titleBlock}>
            <Text style={styles.subtitle}>
              Have a question? We'd love to hear from you
            </Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            {INFO_CARDS.map(card => (
              <View key={card.id} style={styles.infoCard}>
                <View style={styles.infoIconWrap}>
                  <Image
                    source={card.icon}
                    style={styles.infoIconImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>{card.title}</Text>
                  <Text style={styles.infoSubtitle}>{card.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Send us a Message</Text>

            {/* Name */}
            <View style={styles.inputWrap}>
              <Image
                source={AppImages.profile}
                style={styles.inputIconImage}
                resizeMode="contain"
              />
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View style={styles.inputWrap}>
              <Image
                source={Images.email}
                style={styles.inputIconImage}
                resizeMode="contain"
              />
              <TextInput
                style={styles.input}
                placeholder="Your Email"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            {/* Subject */}
            <View style={styles.inputWrap}>
              <Image
                source={AppImages.subject}
                style={styles.inputIconImage}
                resizeMode="contain"
              />
              <TextInput
                style={styles.input}
                placeholder="Subject"
                placeholderTextColor={Colors.textMuted}
                value={subject}
                onChangeText={setSubject}
                returnKeyType="next"
              />
            </View>

            {/* Message */}
            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                placeholder="Your Message..."
                placeholderTextColor={Colors.textMuted}
                value={message}
                onChangeText={handleMessageChange}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {messageCount}/{MAX_MESSAGE_LENGTH}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <>
                <Image
                  source={Images.drawerChevron}
                  style={styles.sendIconImage}
                  resizeMode="contain"
                />
                <Text style={styles.sendText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    textAlign: 'center',
  },
  infoCards: {
    gap: 10,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2A1010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconImage: {
    width: 20,
    height: 20,
    tintColor: Colors.primary,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 4,
  },
  infoSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    gap: 12,
  },
  formTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputIconImage: {
    width: 18,
    height: 18,
    tintColor: Colors.textMuted,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
  },
  textAreaWrap: {
    backgroundColor: Colors.searchBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    minHeight: 120,
  },
  textArea: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    minHeight: 90,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    textAlign: 'right',
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendIconImage: {
    width: 14,
    height: 14,
    tintColor: Colors.textPrimary,
  },
  sendText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    letterSpacing: 0.3,
  },
});

export default ContactUsScreen;
