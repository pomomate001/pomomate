import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { useFriendsStore, useUserStore } from '../../../state';
import { friendService } from '../../../services/friends/FriendService';
import { useTranslation } from '../../../i18n';
import type { SuggestedUser } from '../../../state/friendsStore';

export function DiscoverUsersTab() {
  const colors = useColors();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const suggestedUsers = useFriendsStore((s) => s.suggestedUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      await friendService.discoverUsers(user.id);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    friendService
      .discoverUsers(user.id)
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSendRequest = async (targetUser: SuggestedUser) => {
    if (!user?.id) return;
    setSendingTo(targetUser.userId);
    const result = await friendService.sendFriendRequest(user.id, targetUser.userId);
    setSendingTo(null);
    if (result.success) {
      Alert.alert(t('common.success'), result.message);
      // Refresh to remove sent user
      await loadSuggestions();
    } else {
      Alert.alert(t('common.error'), result.message);
    }
  };

  const handleBlock = async (userId: string) => {
    if (!user?.id) return;
    Alert.alert(
      t('friends.blockConfirmTitle'),
      t('friends.blockConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('friends.block'),
          style: 'destructive',
          onPress: async () => {
            await friendService.blockUser(user.id, userId);
            await loadSuggestions();
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.md }]}>
          {t('friends.findingPeople')}
        </Text>
      </View>
    );
  }

  if (suggestedUsers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={colors.textDisabled} />
        <Text style={[typography.body, { color: colors.textDisabled, marginTop: spacing.md, textAlign: 'center' }]}>
          {t('friends.noSuggestions')}
        </Text>
        <Button
          title={t('friends.refreshSuggestions')}
          variant="outline"
          size="sm"
          onPress={loadSuggestions}
          style={{ marginTop: spacing.md }}
          icon={<Ionicons name="refresh" size={14} color={colors.primary} />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Refresh button */}
      <View style={styles.topRow}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {t('friends.suggestedCount', { count: suggestedUsers.length })}
        </Text>
        <Pressable onPress={loadSuggestions} style={styles.refreshBtn}>
          <Ionicons name="shuffle" size={16} color={colors.primary} />
          <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4 }]}>
            {t('friends.shuffle')}
          </Text>
        </Pressable>
      </View>

      {/* User cards */}
      <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
        {suggestedUsers.map((su) => (
          <View
            key={su.userId}
            style={[styles.userCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
          >
            <View style={styles.userHeader}>
              <Avatar uri={su.avatarUrl} name={su.displayName} size={44} />
              <View style={styles.userInfo}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                  {su.displayName}
                </Text>
                {su.matchingTagCount > 0 && (
                  <View style={styles.matchBadge}>
                    <Ionicons name="flash" size={10} color={colors.primary} />
                    <Text style={[typography.overline, { color: colors.primary, marginLeft: 2 }]}>
                      {t('friends.matchingTags', { count: su.matchingTagCount })}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.cardActions}>
                <Button
                  title={sendingTo === su.userId ? '' : t('friends.sendRequestShort')}
                  size="sm"
                  onPress={() => handleSendRequest(su)}
                  disabled={sendingTo === su.userId}
                  icon={
                    sendingTo === su.userId
                      ? <ActivityIndicator size="small" color="#FFF" />
                      : <Ionicons name="person-add" size={12} color="#FFF" />
                  }
                  style={{ minHeight: 30, paddingHorizontal: 10 }}
                />
                <Pressable
                  onPress={() => handleBlock(su.userId)}
                  style={[styles.blockBtn, { backgroundColor: 'rgba(255,59,48,0.1)' }]}
                >
                  <Ionicons name="ban" size={14} color={colors.error} />
                </Pressable>
              </View>
            </View>

            {/* Tags */}
            {su.tags.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                {su.tags.map((tag) => (
                  <View
                    key={tag.id}
                    style={[styles.tagChip, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }]}
                  >
                    {tag.icon && <Text style={{ fontSize: 10, marginRight: 3 }}>{tag.icon}</Text>}
                    <Text style={[typography.overline, { color: colors.textSecondary, fontSize: 10 }]}>
                      {tag.nameTr}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refreshBtn: { flexDirection: 'row', alignItems: 'center' },
  userCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.sm },
  userHeader: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1, marginLeft: spacing.md },
  matchBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  blockBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tagScroll: { marginTop: spacing.sm },
  tagChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, marginRight: 6 },
});
