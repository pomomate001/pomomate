import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { useTagStore, useUserStore } from '../../../state';
import { tagService, getTagName } from '../../../services/tags';
import { useTranslation } from '../../../i18n';
import type { TagCategory } from '../../../types';

interface TagSelectionSheetProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG: { key: TagCategory; icon: string; labelKey: string }[] = [
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

export function TagSelectionSheet({ visible, onClose }: TagSelectionSheetProps) {
  const colors = useColors();
  const { t, language } = useTranslation();
  const user = useUserStore((s) => s.user);
  const allTags = useTagStore((s) => s.allTags);
  const userTags = useTagStore((s) => s.userTags);
  const isLoading = useTagStore((s) => s.isLoading);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(userTags.map((t) => t.id)));
  const [prevUserTags, setPrevUserTags] = useState(userTags);
  const [activeCategory, setActiveCategory] = useState<TagCategory>('lifestyle');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync selectedIds when userTags change
  if (userTags !== prevUserTags) {
    setPrevUserTags(userTags);
    setSelectedIds(new Set(userTags.map((t) => t.id)));
  }

  // Load tags on mount
  useEffect(() => {
    if (visible) {
      void tagService.fetchAllTags();
      if (user?.id) {
        void tagService.fetchUserTags(user.id);
      }
    }
  }, [visible, user?.id]);

  const filteredTags = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length > 0) {
      return allTags.filter((tag) => {
        const nameTr = (tag.nameTr || '').toLowerCase();
        const nameEn = (tag.nameEn || '').toLowerCase();
        const slug = (tag.slug || '').toLowerCase();
        return nameTr.includes(q) || nameEn.includes(q) || slug.includes(q);
      });
    }
    return allTags.filter((t) => t.category === activeCategory);
  }, [allTags, activeCategory, searchQuery]);

  const toggleTag = (tagId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else if (next.size < 8) {
        next.add(tagId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    await tagService.saveUserTags(user.id, Array.from(selectedIds));
    setIsSaving(false);
    onClose();
  };

  const selectedTags = allTags.filter((t) => selectedIds.has(t.id));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h4, { color: colors.textPrimary }]}>{t('tags.selectTags')}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {selectedIds.size}/8
          </Text>
        </View>

        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll}>
            {selectedTags.map((tag) => (
              <Pressable
                key={tag.id}
                onPress={() => toggleTag(tag.id)}
                style={[styles.selectedChip, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                {tag.icon && <Text style={{ fontSize: 12, marginRight: 4 }}>{tag.icon}</Text>}
                <Text style={[typography.captionBold, { color: '#FFF' }]}>{getTagName(tag, language)}</Text>
                <Ionicons name="close" size={12} color="#FFF" style={{ marginLeft: 4 }} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={language === 'en' ? 'Search all tags...' : 'Tüm etiketlerde ara...'}
            placeholderTextColor={colors.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textDisabled} />
            </Pressable>
          )}
        </View>

        {/* Category filter — only when not searching */}
        {searchQuery.trim().length === 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORY_CONFIG.map((cat) => (
              <Pressable
                key={cat.key}
                onPress={() => setActiveCategory(cat.key)}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: activeCategory === cat.key ? colors.primary : 'rgba(255,255,255,0.08)',
                    borderColor: activeCategory === cat.key ? colors.primary : 'rgba(255,255,255,0.12)',
                  },
                ]}
              >
                <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                <Text
                  style={[
                    typography.captionBold,
                    {
                      color: activeCategory === cat.key ? '#FFF' : colors.textSecondary,
                      marginLeft: 4,
                      fontSize: 11,
                    },
                  ]}
                >
                  {t(cat.labelKey as any)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.searchInfoBar}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {language === 'en' ? `Found ${filteredTags.length} tags` : `${filteredTags.length} etiket bulundu`}
            </Text>
            <Pressable onPress={() => setSearchQuery('')}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                {language === 'en' ? 'Show categories' : 'Kategorileri göster'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Tags grid */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ paddingVertical: spacing.xl }} />
        ) : filteredTags.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={36} color={colors.textDisabled} />
            <Text style={[typography.caption, { color: colors.textDisabled, marginTop: spacing.xs }]}>
              {language === 'en' ? 'No tags found.' : 'Etiket bulunamadı.'}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.tagGrid} showsVerticalScrollIndicator={false}>
            <View style={styles.tagGridInner}>
              {filteredTags.map((tag) => {
                const isSelected = selectedIds.has(tag.id);
                const isDisabled = !isSelected && selectedIds.size >= 8;
                return (
                  <Pressable
                    key={tag.id}
                    onPress={() => !isDisabled && toggleTag(tag.id)}
                    style={[
                      styles.tagBtn,
                      {
                        backgroundColor: isSelected
                          ? `${colors.primary}25`
                          : 'rgba(255,255,255,0.05)',
                        borderColor: isSelected ? colors.primary : 'rgba(255,255,255,0.12)',
                        opacity: isDisabled ? 0.4 : 1,
                      },
                    ]}
                  >
                    {tag.icon && <Text style={{ fontSize: 14, marginRight: 4 }}>{tag.icon}</Text>}
                    <Text
                      style={[
                        typography.caption,
                        { color: isSelected ? colors.primary : colors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {getTagName(tag, language)}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Save button */}
        <Button
          title={isSaving ? t('common.saving') : t('tags.save')}
          onPress={handleSave}
          disabled={isSaving}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  selectedScroll: { marginBottom: spacing.md },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  searchInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  categoryScroll: { marginBottom: spacing.md },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagGrid: { maxHeight: 260 },
  tagGridInner: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
});
