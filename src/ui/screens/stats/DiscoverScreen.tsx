import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
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

export function DiscoverScreen({ navigation }: Props) {
  const colors = useColors();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();

  const user = useUserStore((s) => s.user);
  const userTags = useTagStore((s) => s.userTags);
  const suggestedUsers = useFriendsStore((s) => s.suggestedUsers);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // Default filter: Match only users in the same country (can be toggled off)
  const [sameCountryOnly, setSameCountryOnly] = useState(true);

  const userCountryCode = user?.countryCode || countryService.detectCountryCode() || 'TR';
  const userCountryFlag = getCountryFlag(userCountryCode);
  const userCountryName = getCountryName(userCountryCode, language);

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
    } finally {
      setIsRefreshing(false);
    }
  };



  const handleSendRequest = async (targetUserId: string) => {
    if (!user?.id) return;
    
    setSendingRequests((prev) => ({ ...prev, [targetUserId]: true }));
    
    const result = await friendService.sendFriendRequest(user.id, targetUserId);
    
    if (result.success) {
      // Temporarily update local state to show "Request Sent" without refetching all
      useFriendsStore.getState().setSuggestedUsers(
        suggestedUsers.filter((u) => u.userId !== targetUserId)
      );
    } else {
      setSendingRequests((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

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

        {/* Country Filter Toggle Bar (Single option: Match only my country OR all countries) */}
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
      </View>
    </View>
  );

  const renderUserCard = ({ item }: { item: SuggestedUser }) => (
    <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Avatar uri={item.avatarUrl} name={item.displayName} size={50} />
        <View style={styles.cardInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.displayName}
            </Text>
            {!!item.countryCode && (
              <View style={[styles.userCountryTag, { backgroundColor: `${colors.info}15`, borderColor: `${colors.info}30` }]}>
                <Text style={{ fontSize: 10, marginRight: 3 }}>{getCountryFlag(item.countryCode)}</Text>
                <Text style={[typography.overline, { color: colors.info, fontSize: 9 }]}>
                  {getCountryName(item.countryCode, language)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.matchScoreBadge}>
            <Ionicons name="flash" size={12} color={colors.warning} />
            <Text style={[typography.captionBold, { color: colors.warning, marginLeft: 4 }]}>
              {item.matchScore > 0 
                ? t('discover.matchScore').replace('%{score}', String(item.matchScore))
                : t('discover.matchingTagsCount', { count: item.matchingTagCount })}
            </Text>
          </View>
        </View>
        <Button
          title={sendingRequests[item.userId] ? t('discover.requestSent') : t('discover.sendRequest')}
          size="sm"
          variant={sendingRequests[item.userId] ? 'outline' : 'primary'}
          onPress={() => handleSendRequest(item.userId)}
          disabled={sendingRequests[item.userId]}
          icon={
            sendingRequests[item.userId] 
              ? <Ionicons name="checkmark" size={14} color={colors.primary} />
              : <Ionicons name="person-add" size={14} color="#FFF" />
          }
        />
      </View>

      {/* Tags */}
      {item.tags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
          {item.tags.map((tag) => {
            // Determine if this tag is one of my tags
            const isMatch = userTags.some((myTag) => myTag.id === tag.id);
            return (
              <View
                key={tag.id}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: isMatch ? colors.primary + '20' : colors.surfaceVariant,
                    borderColor: isMatch ? colors.primary + '40' : colors.border,
                  },
                ]}
              >
                {tag.icon && <Text style={{ fontSize: 12, marginRight: 4 }}>{tag.icon}</Text>}
                <Text style={[typography.caption, { color: isMatch ? colors.primary : colors.textSecondary }]}>
                  {getTagName(tag, language)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;

    if (userTags.length === 0) {
      return (
        <View style={styles.emptyContainer}>
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
      <View style={styles.emptyContainer}>
        <EmptyState
          icon={<Ionicons name="search-outline" size={64} color={colors.textDisabled} />}
          title={t('discover.noResults')}
          message={t('discover.noResultsHint')}
          action={
            <Button
              title={t('common.search')}
              variant="outline"
              onPress={() => setSearchQuery('')}
            />
          }
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoading || suggestedUsers.length === 0) return <View style={{ height: spacing.xxxl }} />;
    return (
      <View style={{ paddingVertical: spacing.xl, paddingBottom: spacing.xxxl, alignItems: 'center' }}>
        <Button
          title={t('discover.refresh')}
          variant="outline"
          icon={<Ionicons name="refresh" size={16} color={colors.primary} />}
          onPress={handleRefresh}
          loading={isRefreshing}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={suggestedUsers}
          keyExtractor={(item) => item.userId}
          renderItem={renderUserCard}
          contentContainerStyle={[styles.listContent, suggestedUsers.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
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
  },
  countryFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  userCountryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  userCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagScroll: {
    marginTop: spacing.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
  },
});
