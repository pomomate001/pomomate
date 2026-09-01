import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useFriendsStore, useUserStore } from '../../../state';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { FriendRow } from './FriendRow';
import { FriendDetailSheet } from './FriendDetailSheet';
import { AddFriendSheet } from './AddFriendSheet';
import { friendService } from '../../../services/friends/FriendService';
import type { FriendSummary } from '../../../state/friendsStore';
import { useTranslation } from '../../../i18n';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatsStackParamList } from '../../../navigation/types';

export function FriendsSection() {
  const [expanded, setExpanded] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendSummary | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<StatsStackParamList>>();

  const friends = useFriendsStore((s) => s.friends);
  const user = useUserStore((s) => s.user);
  const colors = useColors();

  // Load friends from backend on mount
  useEffect(() => {
    if (user?.id) {
      friendService.fetchFriends(user.id);
    }
  }, [user?.id]);

  return (
    <View style={styles.container}>
      {/* Toggle header */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={[styles.header, { borderColor: colors.divider, backgroundColor: colors.surface }]}
      >
        <View style={styles.headerLeft}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>{t('friends.myFriends')}</Text>
          {!expanded && friends.length > 0 && (
            <View style={styles.avatarStack}>
              {friends.slice(0, 3).map((f, i) => (
                <View key={f.userId} style={[styles.stackItem, { zIndex: 3 - i, borderColor: colors.surface }]}>
                  <Avatar uri={f.avatarUrl} name={f.displayName} size={28} />
                </View>
              ))}
              {friends.length > 3 && (
                <View style={[styles.moreBadge, { backgroundColor: colors.surfaceVariant, borderColor: colors.surface }]}>
                  <Text style={[typography.overline, { color: colors.textSecondary }]}>+{friends.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('Discover');
            }}
            hitSlop={10}
            style={[styles.addIconBtn, { backgroundColor: colors.surfaceVariant, marginRight: 8 }]}
          >
            <Ionicons name="search" size={16} color={colors.primary} />
          </Pressable>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setShowAddFriend(true);
            }}
            hitSlop={10}
            style={[styles.addIconBtn, { backgroundColor: colors.surfaceVariant }]}
          >
            <Ionicons name="person-add" size={16} color={colors.primary} />
          </Pressable>

          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>

      {expanded && (
        <View style={{ backgroundColor: colors.surface, paddingBottom: spacing.md }}>
          {friends.length === 0 ? (
            <EmptyState
              icon={<Ionicons name="people-outline" size={48} color={colors.textDisabled} />}
              title={t('friends.noFriends')}
              message={t('friends.noFriendsSubtitle')}
              action={
                <Button
                  title={t('friends.addFriend')}
                  variant="outline"
                  size="sm"
                  onPress={() => setShowAddFriend(true)}
                />
              }
            />
          ) : (
            friends.map((f) => (
              <FriendRow
                key={f.userId}
                friend={f}
                onPress={(uid) => {
                  const found = friends.find((fr) => fr.userId === uid) ?? null;
                  setSelectedFriend(found);
                }}
              />
            ))
          )}
        </View>
      )}

      {/* Friend detail sheet */}
      <FriendDetailSheet
        friend={selectedFriend}
        visible={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
      />

      {/* Add friend sheet */}
      <AddFriendSheet
        visible={showAddFriend}
        onClose={() => setShowAddFriend(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.xl, marginHorizontal: spacing.lg, borderRadius: 24, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addIconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  stackItem: {
    marginLeft: -8,
    borderWidth: 2,
    borderRadius: 16,
  },
  moreBadge: {
    marginLeft: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
});
