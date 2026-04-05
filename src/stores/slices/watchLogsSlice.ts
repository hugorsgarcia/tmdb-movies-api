import { StateCreator } from 'zustand';
import { supabase } from '@/lib/supabase';
import { InteractionsState, WatchLogsSlice } from '../types';
import { WatchLog } from '@/types/interactions';

export const createWatchLogsSlice: StateCreator<InteractionsState, [], [], WatchLogsSlice> = (set, get) => ({
  watchLogs: [],

  isWatched: (mediaId, mediaType) => {
    return get().watchLogs.some((log) => log.mediaId === mediaId && log.mediaType === mediaType);
  },

  getWatchLog: (mediaId, mediaType) => {
    return get().watchLogs.find((log) => log.mediaId === mediaId && log.mediaType === mediaType);
  },

  addWatchLog: async (userId, log) => {
    const tempId = crypto.randomUUID();
    const newLog: WatchLog = { ...log, id: tempId, userId, createdAt: new Date().toISOString() };
    const prevLogs = get().watchLogs;
    set((state) => ({ watchLogs: [...state.watchLogs, newLog] }));

    try {
      const { data, error } = await supabase.from('watch_logs').insert({
        user_id: userId, media_id: log.mediaId, media_type: log.mediaType,
        media_title: log.mediaTitle, poster_path: log.posterPath,
        watched_date: log.watchedDate, rating: log.rating, review: log.review,
      }).select().single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          watchLogs: state.watchLogs.map((w) => w.id === tempId ? { ...w, id: data.id } : w),
        }));
      }
    } catch (e) {
      console.error('Error adding watch log, rolling back...', e);
      set({ watchLogs: prevLogs });
    }
  },

  removeWatchLog: async (userId, mediaId, mediaType) => {
    const prevLogs = get().watchLogs;
    set((state) => ({
      watchLogs: state.watchLogs.filter((log) => !(log.mediaId === mediaId && log.mediaType === mediaType)),
    }));

    try {
      const { error } = await supabase.from('watch_logs')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
      
      if (error) throw error;
    } catch (e) {
      console.error('Error removing watch log, rolling back...', e);
      set({ watchLogs: prevLogs });
    }
  },

  getAllWatchLogs: () => get().watchLogs,
});
