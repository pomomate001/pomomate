import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { BottomSheet } from '../../components/BottomSheet';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { useTranslation } from '../../../i18n';
import { tagService, getTagName } from '../../../services/tags';
import { friendService } from '../../../services/friends/FriendService';
import { getCountryFlag, getCountryName } from '../../../services/location';
import { useUserStore } from '../../../state';
import type { Tag } from '../../../types';

interface UserProfileSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  countryCode?: string | null;
}

export function UserProfileSheet({
  visible,
  onClose,
  userId,
  displayName,
  avatarUrl,
  countryCode,
}: UserProfileSheetProps) {
  const colors = useColors();
  const { t, language } = useTranslation();
  const currentUser = useUserStore((s) => s.user);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!visible || !userId) return;
    let isMounted = true;
    tagService
      .fetchUserTags(userId)
      .then((userTags) => {
        if (isMounted) {
          setTags(userTags);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visible, userId]);

  const handleAddFriend = async () => {
    if (!currentUser?.id) return;
    setActionLoading(true);
    await friendService.sendFriendRequest(currentUser.id, userId);
    setActionLoading(false);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Avatar uri={avatarUrl} name={displayName} size={80} />
          <Text style={[typography.h4, { color: colors.textPrimary, marginTop: spacing.md }]}>
            {displayName}
          </Text>
          {!!countryCode && (
            <View style={[styles.countryBadge, { backgroundColor: `${colors.info}15`, borderColor: `${colors.info}30` }]}>
              <Text style={{ fontSize: 12, marginRight: 4 }}>{getCountryFlag(countryCode)}</Text>
              <Text style={[typography.overline, { color: colors.info, fontSize: 10 }]}>
                {getCountryName(countryCode, language)}
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
        ) : (
          <>
            <View style={styles.tagsSection}>
              {tags.length > 0 ? (
                <View style={styles.tagGrid}>
                  {tags.map((tag) => (
                    <View
                      key={tag.id}
                      style={[
                        styles.tagChip,
                        { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' },
                      ]}
                    >
                      {tag.icon && <Text style={{ fontSize: 12, marginRight: 4 }}>{tag.icon}</Text>}
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {getTagName(tag, language)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[typography.body, { color: colors.textDisabled, textAlign: 'center' }]}>
                  {language === 'en' ? 'No tags added yet' : 'Etiket bulunmuyor'}
                </Text>
              )}
            </View>

            {currentUser?.id !== userId && (
              <View style={styles.actions}>
                <Button
                  title={t('friends.sendRequestShort')}
                  onPress={handleAddFriend}
                  disabled={actionLoading}
                />
              </View>
            )}
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  tagsSection: {
    marginBottom: spacing.xl,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  actions: {
    paddingHorizontal: spacing.xl,
  },
});
