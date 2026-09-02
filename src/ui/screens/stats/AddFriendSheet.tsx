import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { useUserStore, useFriendsStore } from '../../../state';
import { friendService } from '../../../services/friends/FriendService';
import { useTranslation } from '../../../i18n';
import * as Clipboard from 'expo-clipboard';

interface AddFriendSheetProps {
  visible: boolean;
  onClose: () => void;
}

function extractFriendCode(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  // Check if string contains a UUID (8-4-4-4-12 hex chars)
  const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = trimmed.match(uuidRegex);
  if (match) {
    return match[0];
  }
  return trimmed;
}

export function AddFriendSheet({ visible, onClose }: AddFriendSheetProps) {
  const [friendIdInput, setFriendIdInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'requests'>('add');
  const { t } = useTranslation();

  const user = useUserStore((s) => s.user);
  const incomingRequests = useFriendsStore((s) => s.incomingRequests);
  const colors = useColors();

  const myCode = user?.id ?? 'kullanici-id';

  useEffect(() => {
    if (visible && user?.id) {
      friendService.fetchIncomingRequests(user.id);
    }
  }, [visible, user?.id]);

  const handleShareMyCode = async () => {
    try {
      const shareUrl = `https://pomomate.app/join?friend=${myCode}`;
      const message = `PomoMate'de birlikte odaklanalım! Beni arkadaş olarak eklemek için aşağıdaki bağlantıya tıkla:\n${shareUrl}\n\nVeya arkadaşlık kodum:\n${myCode}`;

      await Share.share({
        message,
        url: shareUrl,
        title: 'PomoMate Arkadaşlık Daveti',
      });
    } catch {
      // User cancelled
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(myCode);
    Alert.alert('Kopyalandı', `Arkadaşlık kodun (${myCode}) panoya kopyalandı.`);
  };

  const handlePasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      const extracted = extractFriendCode(text);
      setFriendIdInput(extracted);
      Alert.alert('Yapıştırıldı', 'Arkadaşlık kodu panodan başarıyla yapıştırıldı.');
    }
  };

  const handleInputChange = (text: string) => {
    const extracted = extractFriendCode(text);
    setFriendIdInput(extracted);
  };

  const handleSendRequest = async () => {
    const cleanCode = extractFriendCode(friendIdInput);
    if (!cleanCode) {
      Alert.alert(t('common.warning'), t('friends.enterCodeWarning'));
      return;
    }

    if (!user?.id) {
      Alert.alert(t('common.error'), t('friends.loginRequired'));
      return;
    }

    setIsSending(true);
    const result = await friendService.sendFriendRequest(user.id, cleanCode);
    setIsSending(false);

    if (result.success) {
      Alert.alert(t('common.success'), result.message);
      setFriendIdInput('');
      onClose();
    } else {
      Alert.alert(t('common.error'), result.message);
    }
  };

  const handleAccept = async (requestId: string, fromUserId: string) => {
    if (!user?.id) return;
    const ok = await friendService.acceptRequest(requestId, fromUserId, user.id);
    if (ok) {
      Alert.alert(t('common.success'), t('friends.requestAccepted'));
    } else {
      Alert.alert(t('common.error'), t('friends.requestAcceptError'));
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user?.id) return;
    await friendService.rejectRequest(requestId, user.id);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header Tabs */}
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab('add')}
            style={[
              styles.tab,
              activeTab === 'add' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                typography.bodyBold,
                { color: activeTab === 'add' ? colors.primary : colors.textSecondary },
              ]}
            >
              {t('friends.addFriendTab')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('requests')}
            style={[
              styles.tab,
              activeTab === 'requests' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={[
                  typography.bodyBold,
                  { color: activeTab === 'requests' ? colors.primary : colors.textSecondary },
                ]}
              >
                {t('friends.requestsTab')}
              </Text>
              {incomingRequests.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={[typography.captionBold, { color: '#FFF', fontSize: 10 }]}>
                    {incomingRequests.length}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

        </View>

        {activeTab === 'add' ? (
          <View style={styles.tabContent}>
            {/* My Share Code Card */}
            <View style={[styles.shareCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('friends.yourFriendCode')}</Text>
                <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: 2 }]} numberOfLines={1}>
                  {myCode.slice(0, 16)}...
                </Text>
              </View>
              <View style={styles.shareActions}>
                <Pressable onPress={handleCopyCode} style={[styles.actionBtn, { backgroundColor: colors.surface }]}>
                  <Ionicons name="copy-outline" size={18} color={colors.primary} />
                </Pressable>
                <Pressable onPress={handleShareMyCode} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                  <Ionicons name="share-social" size={18} color="#FFF" />
                </Pressable>
              </View>
            </View>

            {/* Input Form */}
            <View style={styles.inputSection}>
              <Text style={[typography.captionBold, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                {t('friends.enterFriendCodeHeader')}
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Ionicons name="person-add-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder={t('friends.codePlaceholder')}
                  placeholderTextColor={colors.textDisabled}
                  value={friendIdInput}
                  onChangeText={handleInputChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {friendIdInput.length > 0 ? (
                  <Pressable onPress={() => setFriendIdInput('')} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={18} color={colors.textDisabled} />
                  </Pressable>
                ) : (
                  <Pressable onPress={handlePasteFromClipboard} style={{ padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="clipboard-outline" size={18} color={colors.primary} />
                    <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 3 }]}>Yapıştır</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Button
              title={isSending ? t('friends.sending') : t('friends.sendRequestBtn')}
              onPress={handleSendRequest}
              disabled={isSending || !friendIdInput.trim()}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          /* Incoming Requests Tab */
          <View style={styles.tabContent}>
            {incomingRequests.length === 0 ? (
              <View style={styles.emptyRequests}>
                <Ionicons name="mail-outline" size={40} color={colors.textDisabled} />
                <Text style={[typography.body, { color: colors.textDisabled, marginTop: spacing.sm, textAlign: 'center' }]}>
                  {t('friends.noIncomingRequests')}
                </Text>
              </View>
            ) : (
              incomingRequests.map((req) => (
                <View
                  key={req.id}
                  style={[styles.requestItem, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
                >
                  <Avatar uri={req.fromAvatarUrl} name={req.fromDisplayName} size={40} />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                      {req.fromDisplayName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('friends.sentRequest')}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <Pressable
                      onPress={() => handleAccept(req.id, req.fromUserId)}
                      style={[styles.reqBtn, { backgroundColor: colors.success }]}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleReject(req.id)}
                      style={[styles.reqBtn, { backgroundColor: colors.error }]}
                    >
                      <Ionicons name="close" size={18} color="#FFF" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  tabContent: {
    gap: spacing.md,
  },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  shareActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginTop: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  emptyRequests: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  reqBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
