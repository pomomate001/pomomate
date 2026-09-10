import { supabase } from '../auth/supabaseClient';
import { useTagStore } from '../../state/tagStore';
import { storage } from '../../platform/storage';
import { logger } from '../../utils/logger';
import type { Tag } from '../../types';

const ALL_TAGS_CACHE_KEY = 'pomomate-cached-tags';
const USER_TAGS_CACHE_PREFIX = 'pomomate-user-tags-';

export class TagService {
  /** Fetch all predefined tags from the database with offline fallback. */
  async fetchAllTags(): Promise<Tag[]> {
    // Check if we can pre-populate from local cache for instant UI rendering
    if (useTagStore.getState().allTags.length === 0) {
      try {
        const cachedRaw = await storage.getItem(ALL_TAGS_CACHE_KEY);
        if (cachedRaw) {
          const cachedTags: Tag[] = JSON.parse(cachedRaw);
          if (Array.isArray(cachedTags) && cachedTags.length > 0) {
            useTagStore.getState().setAllTags(cachedTags);
          }
        }
      } catch {
        // Cache read error ignored
      }
    }

    useTagStore.getState().setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('category')
        .order('sort_order');

      if (error) {
        logger.warn('[TagService] fetchAllTags error:', error.message);
        useTagStore.getState().setError(error.message);
        return useTagStore.getState().allTags;
      }

      const tags: Tag[] = (data ?? []).map((t: any) => ({
        id: t.id,
        slug: t.slug,
        nameTr: t.name_tr,
        nameEn: t.name_en,
        category: t.category,
        icon: t.icon,
        sortOrder: t.sort_order,
      }));

      useTagStore.getState().setAllTags(tags);

      // Save to local cache asynchronously
      void storage.setItem(ALL_TAGS_CACHE_KEY, JSON.stringify(tags)).catch(() => {});

      return tags;
    } catch (err: any) {
      logger.warn('[TagService] fetchAllTags network error, using cached tags:', err);
      return useTagStore.getState().allTags;
    } finally {
      useTagStore.getState().setLoading(false);
    }
  }

  /** Fetch the tags selected by a specific user with offline fallback. */
  async fetchUserTags(userId: string): Promise<Tag[]> {
    if (!userId) return [];

    // Pre-populate from local cache if local state is empty
    if (useTagStore.getState().userTags.length === 0) {
      try {
        const cachedRaw = await storage.getItem(`${USER_TAGS_CACHE_PREFIX}${userId}`);
        if (cachedRaw) {
          const cachedUserTags: Tag[] = JSON.parse(cachedRaw);
          if (Array.isArray(cachedUserTags) && cachedUserTags.length > 0) {
            useTagStore.getState().setUserTags(cachedUserTags);
          }
        }
      } catch {
        // Cache read error ignored
      }
    }

    try {
      const { data, error } = await supabase
        .from('user_tags')
        .select('tag_id, tags(id, slug, name_tr, name_en, category, icon, sort_order)')
        .eq('user_id', userId);

      if (error) {
        logger.warn('[TagService] fetchUserTags error:', error.message);
        return useTagStore.getState().userTags;
      }

      const tags: Tag[] = (data ?? []).map((row: any) => ({
        id: row.tags.id,
        slug: row.tags.slug,
        nameTr: row.tags.name_tr,
        nameEn: row.tags.name_en,
        category: row.tags.category,
        icon: row.tags.icon,
        sortOrder: row.tags.sort_order,
      }));

      useTagStore.getState().setUserTags(tags);

      // Save to cache
      void storage.setItem(`${USER_TAGS_CACHE_PREFIX}${userId}`, JSON.stringify(tags)).catch(() => {});

      return tags;
    } catch (err: any) {
      logger.warn('[TagService] fetchUserTags error:', err);
      return useTagStore.getState().userTags;
    }
  }

  /** Save user tags (replace all). Max 8 enforced by DB trigger. */
  async saveUserTags(userId: string, tagIds: string[]): Promise<boolean> {
    if (tagIds.length > 8) {
      logger.warn('[TagService] Cannot save more than 8 tags');
      return false;
    }

    try {
      // Delete existing
      await supabase.from('user_tags').delete().eq('user_id', userId);

      // Insert new
      if (tagIds.length > 0) {
        const rows = tagIds.map((tagId) => ({ user_id: userId, tag_id: tagId }));
        const { error } = await supabase.from('user_tags').insert(rows);
        if (error) {
          logger.warn('[TagService] saveUserTags insert error:', error.message);
          return false;
        }
      }

      // Refresh
      await this.fetchUserTags(userId);
      return true;
    } catch (err: any) {
      logger.warn('[TagService] saveUserTags error:', err);
      return false;
    }
  }
}

export const tagService = new TagService();

/**
 * Returns the localized name of a tag based on the active language.
 * Defaults to Turkish (nameTr) if language is 'tr' or if English is missing.
 */
export function getTagName(
  tag: { nameTr: string; nameEn?: string | null } | null | undefined,
  language: string = 'tr'
): string {
  if (!tag) return '';
  if (language === 'en' && tag.nameEn && tag.nameEn.trim().length > 0) {
    return tag.nameEn;
  }
  return tag.nameTr || tag.nameEn || '';
}
