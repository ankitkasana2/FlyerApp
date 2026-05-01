import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// ─── Premium Badge Icon ───────────────────────────────────────────────────────
const PremiumBadgeIcon: React.FC = () => (
  <View style={badgeStyles.wrapper}>
    <View style={badgeStyles.shieldBody}>
      <View style={badgeStyles.shieldTop} />
    </View>
    {[-1, 0, 1].map((offset, i) => (
      <View
        key={i}
        style={[
          badgeStyles.dot,
          { bottom: 6 + (i === 0 ? 3 : 0), left: 12 + offset * 5 },
        ]}
      />
    ))}
  </View>
);

const badgeStyles = StyleSheet.create({
  wrapper: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldBody: {
    width: 14,
    height: 16,
    backgroundColor: Colors.textPrimary,
    borderRadius: 3,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldTop: {
    width: 14,
    height: 7,
    backgroundColor: Colors.textPrimary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    position: 'absolute',
    top: 0,
  },
  dot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProfileCardProps {
  name: string;
  email: string;
  memberSince: string;
  totalAssets: number;
  assetLabel?: string;
  membershipLabel?: string;
  avatarSource?: ImageSourcePropType;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  email,
  memberSince,
  totalAssets,
  assetLabel = 'FLYERS',
  membershipLabel = 'PREMIUM MEMBER',
  avatarSource,
}) => (
  <View style={styles.card}>
    {/* ── Top row: avatar + info ── */}
    <View style={styles.topRow}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
        )}
        {/* Premium badge bottom-right */}
        <View style={styles.badgeDot}>
          <PremiumBadgeIcon />
        </View>
      </View>

      {/* Name / membership / email */}
      <View style={styles.infoBlock}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.membershipLabel}>{membershipLabel}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
    </View>

    {/* ── Divider ── */}
    <View style={styles.divider} />

    {/* ── Stats row ── */}
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>{'MEMBER\nSINCE'}</Text>
        <Text style={styles.statValue}>{memberSince.toUpperCase()}</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={[styles.statItem, styles.statItemRight]}>
        <Text style={styles.statLabel}>TOTAL ASSETS</Text>
        <Text style={styles.statValue}>
          {totalAssets} {assetLabel}
        </Text>
      </View>
    </View>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 16,
    position: 'relative',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
  },
  badgeDot: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  infoBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  membershipLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  email: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statItem: {
    gap: 4,
  },
  statItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statDivider: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    lineHeight: 16,
  },
  statValue: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
});

export default ProfileCard;
