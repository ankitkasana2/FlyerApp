import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import type { ToastConfigParams } from 'react-native-toast-message';
import Colors from '../../theme/colors';
import { FontFamily } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Per-type config ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { accent: string; label: string; icon: string }
> = {
  success: { accent: Colors.success,  label: 'Success', icon: '✓' },
  error:   { accent: Colors.error,    label: 'Error',   icon: '✕' },
  info:    { accent: Colors.primary,  label: 'Info',    icon: 'i' },
};

// ─── Toast component ──────────────────────────────────────────────────────────

type Props = ToastConfigParams<unknown>;

const AppToastItem: React.FC<Props> = ({ text1, text2, type = 'success', isVisible }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
  const accent = cfg.accent;

  const translateX = useRef(new Animated.Value(SCREEN_WIDTH + 60)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -(SCREEN_WIDTH + 60),
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, opacity, translateX]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX }], opacity },
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      {/* Icon badge */}
      <View
        style={[
          styles.iconBadge,
          { borderColor: accent, backgroundColor: `${accent}18` },
        ]}
      >
        <Text style={[styles.iconText, { color: accent }]}>
          {cfg.icon}
        </Text>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        {text1 ? (
          <Text style={styles.title} numberOfLines={1}>
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {text2}
          </Text>
        ) : null}
      </View>

      {/* Right decorative dots */}
      <View style={styles.dots}>
        {([1, 0.45, 0.2] as const).map((op, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: accent, opacity: op }]}
          />
        ))}
      </View>

      {/* Bottom glow line */}
      <View style={[styles.glowLine, { backgroundColor: accent }]} />
    </Animated.View>
  );
};

// ─── Config export ────────────────────────────────────────────────────────────

export const toastConfig = {
  success: (props: Props) => <AppToastItem {...props} />,
  error:   (props: Props) => <AppToastItem {...props} />,
  info:    (props: Props) => <AppToastItem {...props} />,
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#1C1C22',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2E2E38',
    overflow: 'hidden',
    // Premium shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 14,
  },

  // Left bar
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },

  // Main row
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 18,
    marginVertical: 14,
    flexShrink: 0,
  },
  iconText: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    lineHeight: 18,
    includeFontPadding: false,
  },

  textBlock: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: FontFamily.bold,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    lineHeight: 17,
  },

  // Right decorative dots (vertical stack)
  dots: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingRight: 16,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Bottom glow line
  glowLine: {
    height: 1.5,
    opacity: 0.3,
  },
});
