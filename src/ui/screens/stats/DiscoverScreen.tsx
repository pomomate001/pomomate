import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useUserStore, useFriendsStore, useTagStore } from '../../../state';
import { friendService } from '../../../services/friends/FriendService';
import { getTagName } from '../../../services/tags';
import { countryService, getCountryFlag, getCountryName } from '../../../services/location';
import { useTranslation } from '../../../i18n';
import type { StatsStackParamList } from '../../../navigation/types';
import type { SuggestedUser } from '../../../state/friendsStore';

type Props = NativeStackScreenProps<StatsStackParamList, 'Discover'>;

const PAGE_SIZE = 10;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

export function DiscoverScreen({ navigation }: Props) {
  const colors = useColors();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();

  const user = useUserStore((s) => s.user);
  const userTags = useTagStore((s) => s.userTags);
  const suggestedUsers = useFriendsStore((s) => s.suggestedUsers);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sendingRequest, setSendingRequest] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sameCountryOnly, setSameCountryOnly] = useState(true);

  const userCountryCode = user?.countryCode || countryService.detectCountryCode() || 'TR';
  const userCountryFlag = getCountryFlag(userCountryCode);
  const userCountryName = getCountryName(userCountryCode, language);

  // Animations
  const [cardOpacity] = useState(() => new Animated.Value(1));
  const [cardTranslateX] = useState(() => new Animated.Value(0));
  const [cardScale] = useState(() => new Animated.Value(1));

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Initial load & when filters change
  useEffect(() => {
    if (!user?.id || userTags.length === 0) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setIsLoading(true);
    }, 0);

    const search = debouncedSearch.trim() || null;

    friendService
      .discoverUsers(user.id, PAGE_SIZE, 0, null, search, sameCountryOnly, userCountryCode)
      .then(() => {
        if (isMounted) {
          setIsLoading(false);
          setCurrentIndex(0);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user?.id, userTags.length, debouncedSearch, sameCountryOnly, userCountryCode]);

  const handleRefresh = async () => {
    if (!user?.id || userTags.length === 0) return;
    setIsRefreshing(true);
    const search = debouncedSearch.trim() || null;
    try {
      await friendService.discoverUsers(user.id, PAGE_SIZE, 0, null, search, sameCountryOnly, userCountryCode);
      setCurrentIndex(0);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Animate card out and move to next
  const animateCardOut = useCallback((direction: 'left' | 'right', onComplete: () => void) => {
    const toX = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.parallel([
      Animated.timing(cardTranslateX, {
        toValue: toX,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
      // Reset and animate in the new card
      cardTranslateX.setValue(0);
      cardScale.setValue(0.95);
      cardOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [cardTranslateX, cardOpacity, cardScale]);

  const handleSkip = useCallback(() => {
    animateCardOut('left', () => {
      setCurrentIndex((prev) => prev + 1);
    });
  }, [animateCardOut]);

  const handleSendRequest = useCallback(async (targetUserId: string) => {
    if (!user?.id || sendingRequest) return;

    setSendingRequest(true);
    const result = await friendService.sendFriendRequest(user.id, targetUserId);
    setSendingRequest(false);

    if (result.success) {
      animateCardOut('right', () => {
        // Remove the user from suggestions
        useFriendsStore.getState().setSuggestedUsers(
          suggestedUsers.filter((u) => u.userId !== targetUserId)
        );
        // Don't increment currentIndex since we're removing the item
      });
    }
  }, [user, sendingRequest, suggestedUsers, animateCardOut]);

  const currentUser: SuggestedUser | undefined = suggestedUsers[currentIndex];
  const allSeen = !isLoading && (suggestedUsers.length === 0 || currentIndex >= suggestedUsers.length);

  // ─── HEADER ───
  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.headerContent, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>{t('discover.title')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          {t('discover.subtitle')}
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={t('discover.searchPlaceholder')}
            placeholderTextColor={colors.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textDisabled} />
            </Pressable>
          )}
        </View>

        {/* Country Filter Toggle Bar */}
        <View style={styles.filterBar}>
          <Pressable
            onPress={() => setSameCountryOnly(!sameCountryOnly)}
            style={[
              styles.countryFilterChip,
              sameCountryOnly
                ? { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }
                : { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
            ]}
          >
            <Text style={{ fontSize: 13, marginRight: 6 }}>
              {sameCountryOnly ? userCountryFlag : '🌍'}
            </Text>
            <Text
              style={[
                typography.captionBold,
                { color: sameCountryOnly ? colors.primary : colors.textSecondary, fontSize: 12 },
              ]}
            >
              {sameCountryOnly
                ? (language === 'en' ? `Only in ${userCountryName}` : `Sadece ${userCountryName}'dekiler`)
                : (language === 'en' ? 'All Countries (Global)' : 'Tüm Dünya (Filtresiz)')}
            </Text>
            <Ionicons
              name={sameCountryOnly ? 'checkmark-circle' : 'globe-outline'}
              size={14}
              color={sameCountryOnly ? colors.primary : colors.textSecondary}
              style={{ marginLeft: 6 }}
            />
          </Pressable>

          {/* Card counter */}
          {!allSeen && suggestedUsers.length > 0 && (
            <View style={[styles.counterBadge, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[typography.captionBold, { color: colors.primary, fontSize: 11 }]}>
                {currentIndex + 1}/{suggestedUsers.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // ─── PROFILE CARD ───
  const renderProfileCard = (suggestedUser: SuggestedUser) => (
    <Animated.View
      style={[
        styles.profileCard,
        shadows.lg,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          transform: [
            { translateX: cardTranslateX },
            { scale: cardScale },
          ],
          opacity: cardOpacity,
        },
      ]}
    >
      {/* Avatar & Identity */}
      <View style={styles.cardIdentity}>
        <Avatar uri={suggestedUser.avatarUrl} name={suggestedUser.displayName} size={100} showGradientBorder />

        <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' }]}>
          {suggestedUser.displayName}
        </Text>

        {/* Country Tag */}
        {!!suggestedUser.countryCode && (
          <View style={[styles.countryTag, { backgroundColor: `${colors.info}12`, borderColor: `${colors.info}25` }]}>
            <Text style={{ fontSize: 12, marginRight: 4 }}>{getCountryFlag(suggestedUser.countryCode)}</Text>
            <Text style={[typography.caption, { color: colors.info }]}>
              {getCountryName(suggestedUser.countryCode, language)}
            </Text>
          </View>
        )}
      </View>

      {/* Bio (Benim Köşem) */}
      <View style={[styles.bioBox, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}15` }]}>
        {suggestedUser.bio ? (
          <Text style={[typography.body, { color: colors.textPrimary, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 }]}>
            {`"${suggestedUser.bio}"`}
          </Text>
        ) : (
          <Text style={[typography.body, { color: colors.textDisabled, fontStyle: 'italic', textAlign: 'center' }]}>
            {t('discover.noBio')}
          </Text>
        )}
      </View>

      {/* Match Score */}
      <View style={styles.matchRow}>
        <View style={[styles.matchBadge, { backgroundColor: 'rgba(255, 193, 7, 0.12)' }]}>
          <Ionicons name="flash" size={14} color={colors.warning} />
          <Text style={[typography.captionBold, { color: colors.warning, marginLeft: 4 }]}>
            {suggestedUser.matchScore > 0
              ? t('discover.matchScore').replace('%{score}', String(suggestedUser.matchScore))
              : t('discover.matchingTagsCount', { count: suggestedUser.matchingTagCount })}
          </Text>
        </View>
      </View>

      {/* Tags */}
      {suggestedUser.tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagScroll}
          contentContainerStyle={styles.tagContainer}
        >
          {suggestedUser.tags.map((tag) => {
            const isMatch = userTags.some((myTag) => myTag.id === tag.id);
            return (
              <View
                key={tag.id}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: isMatch ? `${colors.primary}18` : colors.surfaceVariant,
                    borderColor: isMatch ? `${colors.primary}40` : colors.border,
                  },
                ]}
              >
                {tag.icon && <Text style={{ fontSize: 13, marginRight: 4 }}>{tag.icon}</Text>}
                <Text style={[typography.caption, { color: isMatch ? colors.primary : colors.textSecondary }]}>
                  {getTagName(tag, language)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </Animated.View>
  );

  // ─── ACTION BUTTONS ───
  const renderActionButtons = (suggestedUser: SuggestedUser) => (
    <View style={styles.actionRow}>
      {/* Skip Button (Red) */}
      <Pressable
        onPress={handleSkip}
        style={({ pressed }) => [
          styles.actionBtn,
          styles.skipBtn,
          {
            backgroundColor: pressed ? '#FF3B3020' : `${colors.error}12`,
            borderColor: colors.error,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
        ]}
      >
        <Ionicons name="close" size={32} color={colors.error} />
      </Pressable>

      {/* Send Request Button (Green) */}
      <Pressable
        onPress={() => handleSendRequest(suggestedUser.userId)}
        disabled={sendingRequest}
        style={({ pressed }) => [
          styles.actionBtn,
          styles.requestBtn,
          {
            backgroundColor: pressed ? '#4CAF5020' : `${colors.success}12`,
            borderColor: colors.success,
            transform: [{ scale: pressed ? 0.92 : 1 }],
            opacity: sendingRequest ? 0.6 : 1,
          },
        ]}
      >
        {sendingRequest ? (
          <ActivityIndicator size="small" color={colors.success} />
        ) : (
          <Ionicons name="checkmark" size={32} color={colors.success} />
        )}
      </Pressable>
    </View>
  );

  // ─── ALL SEEN / EMPTY STATE ───
  const renderAllSeen = () => {
    if (userTags.length === 0) {
      return (
        <View style={styles.allSeenContainer}>
          <EmptyState
            icon={<Ionicons name="pricetags-outline" size={64} color={colors.primary} />}
            title={t('discover.addTagsFirst')}
            message={t('discover.addTagsHint')}
            action={
              <Button
                title={t('discover.goToTags')}
                onPress={() => navigation.navigate('ProfileTab' as any, { screen: 'TagSelection' } as any)}
              />
            }
          />
        </View>
      );
    }

    return (
      <View style={styles.allSeenContainer}>
        <View style={[styles.allSeenIcon, { backgroundColor: `${colors.primary}12` }]}>
          <Ionicons name="checkmark-done-circle-outline" size={72} color={colors.primary} />
        </View>
        <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.lg, textAlign: 'center' }]}>
          {t('discover.allSeen')}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
          {t('discover.allSeenHint')}
        </Text>
        <Button
          title={t('discover.refresh')}
          variant="outline"
          icon={<Ionicons name="refresh" size={16} color={colors.primary} />}
          onPress={handleRefresh}
          loading={isRefreshing}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    );
  };

  // ─── MAIN RENDER ───
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : allSeen ? (
        renderAllSeen()
      ) : currentUser ? (
        <View style={styles.cardArea}>
          {renderProfileCard(currentUser)}
          {renderActionButtons(currentUser)}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
  },
  filterBar: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Card Area ───
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    width: CARD_WIDTH,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  cardIdentity: {
    alignItems: 'center',
  },
  countryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  bioBox: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  matchRow: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagScroll: {
    marginTop: spacing.md,
    maxHeight: 40,
  },
  tagContainer: {
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },

  // ─── Action Buttons ───
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.xxxl,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  skipBtn: {},
  requestBtn: {},

  // ─── All Seen ───
  allSeenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  allSeenIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
