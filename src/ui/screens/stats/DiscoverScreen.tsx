import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  PanResponder,
  Image,
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
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 750;
const CARD_WIDTH = isSmallScreen ? Math.min(SCREEN_WIDTH - 32, 320) : Math.min(SCREEN_WIDTH - 24, 356);
const INFO_HEIGHT = isSmallScreen ? 190 : 210;
const CARD_HEIGHT = CARD_WIDTH + INFO_HEIGHT;
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 250;

const DISCOVER_CATEGORIES: { key: string | null; icon: string; labelKey: string }[] = [
  { key: null, icon: '✨', labelKey: 'discover.allCategories' },
  { key: 'lifestyle', icon: '🌿', labelKey: 'tags.lifestyle' },
  { key: 'subject', icon: '📚', labelKey: 'tags.subject' },
  { key: 'tech', icon: '💻', labelKey: 'tags.tech' },
  { key: 'language', icon: '🌍', labelKey: 'tags.language' },
  { key: 'creative', icon: '🎨', labelKey: 'tags.creative' },
  { key: 'sport', icon: '⚽', labelKey: 'tags.sport' },
  { key: 'music', icon: '🎵', labelKey: 'tags.music' },
  { key: 'entertainment', icon: '🎬', labelKey: 'tags.entertainment' },
  { key: 'hobby', icon: '🎲', labelKey: 'tags.hobby' },
  { key: 'game', icon: '🎮', labelKey: 'tags.game' },
];

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

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

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sameCountryOnly, setSameCountryOnly] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterAnim] = useState(() => new Animated.Value(0));

  const toggleFilter = useCallback(
    (open?: boolean) => {
      setIsFilterOpen((prev) => {
        const nextState = open !== undefined ? open : !prev;
        Animated.spring(filterAnim, {
          toValue: nextState ? 1 : 0,
          friction: 8,
          tension: 50,
          useNativeDriver: false,
        }).start();
        return nextState;
      });
    },
    [filterAnim]
  );

  const notchPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 12) {
            toggleFilter(true);
          } else if (gestureState.dy < -12) {
            toggleFilter(false);
          } else {
            toggleFilter();
          }
        },
      }),
    [toggleFilter]
  );

  const hasActiveFilters = Boolean(
    selectedCategory !== null ||
    debouncedSearch.trim().length > 0 ||
    !sameCountryOnly
  );

  const userCountryCode = user?.countryCode || countryService.detectCountryCode() || 'TR';
  const userCountryFlag = getCountryFlag(userCountryCode);
  const userCountryName = getCountryName(userCountryCode, language);

  // Animations
  const [pan] = useState(() => new Animated.ValueXY());

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
      .discoverUsers(user.id, PAGE_SIZE, 0, selectedCategory, search, sameCountryOnly, userCountryCode)
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
  }, [user?.id, userTags.length, debouncedSearch, sameCountryOnly, userCountryCode, selectedCategory]);

  const handleRefresh = async () => {
    if (!user?.id || userTags.length === 0) return;
    setIsRefreshing(true);
    const search = debouncedSearch.trim() || null;
    try {
      await friendService.discoverUsers(user.id, PAGE_SIZE, 0, selectedCategory, search, sameCountryOnly, userCountryCode);
      setCurrentIndex(0);
    } finally {
      setIsRefreshing(false);
    }
  };

  const onSwipeComplete = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'right') {
        const targetUserId = suggestedUsers[currentIndex]?.userId;
        if (targetUserId && user?.id) {
          friendService.sendFriendRequest(user.id, targetUserId).catch(console.error);
        }
      }
      
      setCurrentIndex((prev) => prev + 1);
      pan.setValue({ x: 0, y: 0 });
    },
    [currentIndex, suggestedUsers, user, pan]
  );

  const forceSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const toX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
      
      const currentY = (pan.y as any)._value || 0;

      Animated.timing(pan, {
        toValue: { x: toX, y: currentY },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }).start(() => onSwipeComplete(direction));
    },
    [pan, onSwipeComplete]
  );

  const resetPosition = useCallback(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  }, [pan]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        },
        onPanResponderGrant: () => {
          pan.extractOffset();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (evt, gestureState) => {
          pan.flattenOffset();
          if (gestureState.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
          } else {
            resetPosition();
          }
        },
      }),
    [pan, forceSwipe, resetPosition]
  );

  const allSeen = !isLoading && (suggestedUsers.length === 0 || currentIndex >= suggestedUsers.length);

  // ─── HEADER ───
  const renderHeader = () => {
    const filterMaxHeight = filterAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200],
    });

    const filterOpacity = filterAnim.interpolate({
      inputRange: [0, 0.35, 1],
      outputRange: [0, 0, 1],
    });

    const activeCategoryItem = DISCOVER_CATEGORIES.find((c) => c.key === selectedCategory);

    return (
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.headerContent, { paddingTop: insets.top + spacing.xs }]}>
          {/* Top Bar: Back Button, Title, and Card Counter */}
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>{t('discover.title')}</Text>

            {!allSeen && suggestedUsers.length > 0 ? (
              <View style={[styles.topCounterBadge, { backgroundColor: `${colors.primary}18` }]}>
                <Text style={[typography.captionBold, { color: colors.primary, fontSize: 12 }]}>
                  {currentIndex + 1}/{suggestedUsers.length}
                </Text>
              </View>
            ) : (
              <View style={{ width: 36 }} />
            )}
          </View>

          {/* Collapsible Filter Section */}
          <Animated.View style={[styles.collapsibleFilters, { maxHeight: filterMaxHeight, opacity: filterOpacity }]}>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xs }]}>
              {t('discover.subtitle')}
            </Text>

            {/* Search Bar */}
            <View style={[styles.searchBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
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
            </View>

            {/* Category Filter Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryFilterScroll}
              contentContainerStyle={{ paddingRight: spacing.sm, alignItems: 'center' }}
            >
              {DISCOVER_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <Pressable
                    key={cat.key ?? 'all'}
                    onPress={() => setSelectedCategory(cat.key)}
                    style={[
                      styles.categoryFilterChip,
                      isSelected
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                    ]}
                  >
                    <Text style={{ fontSize: 12 }}>{cat.icon}</Text>
                    <Text
                      style={[
                        typography.captionBold,
                        {
                          color: isSelected ? '#FFF' : colors.textSecondary,
                          marginLeft: 4,
                          fontSize: 11,
                        },
                      ]}
                    >
                      {t(cat.labelKey as any)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Notch Handle (Interactive swipeable/tappable drawer notch) */}
          <View style={styles.notchWrapper} {...notchPanResponder.panHandlers}>
            <Pressable
              onPress={() => toggleFilter()}
              style={({ pressed }) => [
                styles.notchButton,
                pressed && { opacity: 0.75 },
              ]}
              hitSlop={{ top: 8, bottom: 12, left: 24, right: 24 }}
            >
              <View style={[styles.notchHandleBar, { backgroundColor: colors.border }]} />
              <View style={styles.notchRow}>
                <Ionicons
                  name={isFilterOpen ? 'chevron-up' : 'options-outline'}
                  size={13}
                  color={hasActiveFilters ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    typography.captionBold,
                    {
                      color: hasActiveFilters ? colors.primary : colors.textSecondary,
                      fontSize: 11,
                      marginLeft: 5,
                    },
                  ]}
                >
                  {isFilterOpen
                    ? (language === 'en' ? 'Hide Filters' : 'Filtreleri Gizle')
                    : (language === 'en' ? 'Filters & Search' : 'Filtreler & Arama')}
                </Text>

                {!isFilterOpen && hasActiveFilters && (
                  <View style={[styles.notchActiveBadge, { backgroundColor: colors.primary }]}>
                    {activeCategoryItem?.icon ? (
                      <Text style={{ fontSize: 9 }}>{activeCategoryItem.icon}</Text>
                    ) : (
                      <View style={styles.notchDot} />
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // ─── PROFILE CARD ───
  const renderProfileCard = (suggestedUser: SuggestedUser, isTopCard: boolean) => {
    // Top card animations
    const rotate = pan.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });

    const likeOpacity = pan.x.interpolate({
      inputRange: [0, SCREEN_WIDTH / 4],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const nopeOpacity = pan.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 4, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    // Next card animations
    const nextCardScale = pan.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.95, 1],
      extrapolate: 'clamp',
    });

    const animatedCardStyle = isTopCard
      ? {
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
        }
      : {
          transform: [{ scale: nextCardScale }],
        };

    const panHandlers = isTopCard ? panResponder.panHandlers : {};

    return (
      <Animated.View
        key={suggestedUser.userId}
        style={[
          styles.profileCard,
          shadows.md,
          animatedCardStyle,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        {...panHandlers}
      >
        {/* Top Half: Square Profile Picture */}
        <View style={styles.imageContainer}>
          {suggestedUser.avatarUrl ? (
            <Image source={{ uri: suggestedUser.avatarUrl }} style={styles.profileImage} />
          ) : (
            <LinearGradient colors={[colors.primaryLight, colors.primary]} style={styles.fallbackImage}>
              <Text style={styles.fallbackInitial}>{getInitials(suggestedUser.displayName)}</Text>
            </LinearGradient>
          )}

          {/* Gradient Overlay for subtle premium effect */}
          <LinearGradient
             colors={['transparent', 'rgba(0,0,0,0.4)']}
             style={styles.imageOverlay}
          />

          {/* Stamps */}
          {isTopCard && (
            <>
              <Animated.View style={[styles.stampLike, { opacity: likeOpacity }]}>
                <Text style={styles.stampLikeText}>{t('discover.sendRequestAction')}</Text>
              </Animated.View>
              <Animated.View style={[styles.stampNope, { opacity: nopeOpacity }]}>
                <Text style={styles.stampNopeText}>{t('discover.skip')}</Text>
              </Animated.View>
            </>
          )}
        </View>

        {/* Bottom Half: Info & Buttons */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[typography.h2, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
              {suggestedUser.displayName}
            </Text>
            {!!suggestedUser.countryCode && (
              <View style={[styles.countryTag, { backgroundColor: `${colors.info}15` }]}>
                <Text style={{ fontSize: 14, marginRight: 4 }}>{getCountryFlag(suggestedUser.countryCode)}</Text>
                <Text style={[typography.captionBold, { color: colors.info }]}>
                  {getCountryName(suggestedUser.countryCode, language)}
                </Text>
              </View>
            )}
          </View>

          {suggestedUser.bio ? (
            <View style={[styles.bioBox, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}15` }]}>
               <Text style={[typography.body, { color: colors.textPrimary, fontStyle: 'italic', lineHeight: 22 }]} numberOfLines={2}>
                 {`"${suggestedUser.bio}"`}
               </Text>
            </View>
          ) : (
            <View style={[styles.bioBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
               <Text style={[typography.body, { color: colors.textDisabled, fontStyle: 'italic' }]}>
                 {t('discover.noBio')}
               </Text>
            </View>
          )}

          <View style={styles.matchRow}>
            <View style={[styles.matchBadge, { backgroundColor: 'rgba(255, 193, 7, 0.15)' }]}>
              <Ionicons name="flash" size={14} color={colors.warning} />
              <Text style={[typography.captionBold, { color: colors.warning, marginLeft: 4 }]}>
                {suggestedUser.matchScore > 0
                  ? t('discover.matchScore').replace('%{score}', String(suggestedUser.matchScore))
                  : t('discover.matchingTagsCount', { count: suggestedUser.matchingTagCount })}
              </Text>
            </View>
          </View>

          {suggestedUser.tags.length > 0 && (
            <View style={styles.tagScrollWrapper}>
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
                          backgroundColor: isMatch ? `${colors.primary}15` : colors.surfaceVariant,
                          borderColor: isMatch ? `${colors.primary}30` : colors.border,
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
            </View>
          )}

          {/* Integrated Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => isTopCard && forceSwipe('left')}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.skipBtn,
                {
                  backgroundColor: pressed ? '#FF3B3015' : colors.surface,
                  borderColor: `${colors.error}40`,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              <Ionicons name="close" size={26} color={colors.error} />
            </Pressable>

            <Pressable
              onPress={() => isTopCard && forceSwipe('right')}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.requestBtn,
                {
                  backgroundColor: pressed ? '#4CAF5015' : colors.surface,
                  borderColor: `${colors.success}40`,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              <Ionicons name="checkmark" size={26} color={colors.success} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

  // ─── ALL SEEN / EMPTY STATE ───
  const renderAllSeen = () => {
    if (userTags.length === 0) {
      return (
        <View style={[styles.allSeenContainer, { paddingBottom: 70 + insets.bottom }]}>
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
      <View style={[styles.allSeenContainer, { paddingBottom: 70 + insets.bottom }]}>
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

  const renderCards = () => {
    if (currentIndex >= suggestedUsers.length) {
      return renderAllSeen();
    }

    return (
      <View style={styles.cardDeck}>
        {suggestedUsers
          .slice(currentIndex, currentIndex + 2)
          .reverse()
          .map((suggestedUser) => {
            const isTopCard = suggestedUser.userId === suggestedUsers[currentIndex].userId;
            return renderProfileCard(suggestedUser, isTopCard);
          })}
      </View>
    );
  };

  // ─── MAIN RENDER ───
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}

      {isLoading && !isRefreshing ? (
        <View style={[styles.loadingCenter, { paddingBottom: 50 + insets.bottom }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : allSeen ? (
        renderAllSeen()
      ) : (
        <View style={[styles.cardArea, { paddingBottom: 36 + insets.bottom }]}>
           {renderCards()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  topCounterBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  collapsibleFilters: {
    overflow: 'hidden',
  },
  notchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 4,
  },
  notchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  notchHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  notchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notchActiveBadge: {
    marginLeft: 6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  backBtn: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
  },
  filterBar: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  counterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  categoryFilterScroll: {
    marginTop: spacing.xs,
  },
  categoryFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: 6,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Card Area ───
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDeck: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    marginTop: 0,
  },
  profileCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  
  // ─── Top Half: 1:1 Square Image ───
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackInitial: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFF',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  stampLike: {
    position: 'absolute',
    top: 16,
    left: 16,
    transform: [{ rotate: '-20deg' }],
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  stampLikeText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  stampNope: {
    position: 'absolute',
    top: 16,
    right: 16,
    transform: [{ rotate: '20deg' }],
    borderWidth: 3,
    borderColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  stampNopeText: {
    color: '#FF3B30',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // ─── Bottom Half: Info ───
  infoContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  countryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginLeft: spacing.xs,
  },
  bioBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    marginVertical: 2,
  },
  matchRow: {
    marginVertical: 2,
    alignItems: 'flex-start',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagScrollWrapper: {
    height: 32,
    marginVertical: 2,
  },
  tagScroll: {
    flex: 1,
  },
  tagContainer: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },

  // ─── Action Buttons ───
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    gap: spacing.xl,
    paddingTop: 4,
    paddingBottom: 2,
  },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
