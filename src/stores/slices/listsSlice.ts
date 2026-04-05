import { StateCreator } from 'zustand';
import { supabase } from '@/lib/supabase';
import { InteractionsState, ListsSlice } from '../types';
import { MediaList } from '@/types/interactions';

export const createListsSlice: StateCreator<InteractionsState, [], [], ListsSlice> = (set, get) => ({
  lists: [],

  createList: (userId, name, description, isPublic = true) => {
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newList: MediaList = {
      id: tempId, name, description, userId, movies: [], isPublic, createdAt: now, updatedAt: now,
    };
    
    // We update the state locally immediately
    set((state) => ({ lists: [...state.lists, newList] }));

    // Async operation in background
    (async () => {
      try {
        const { data, error } = await supabase.from('lists').insert({
          user_id: userId, name, description, is_public: isPublic,
        }).select().single();

        if (error) throw error;

        if (data) {
          set((state) => ({
            lists: state.lists.map((l) => l.id === tempId ? { ...l, id: data.id } : l),
          }));
        }
      } catch (err) {
        console.error('Error creating list, rolling back...', err);
        set((state) => ({ lists: state.lists.filter(l => l.id !== tempId) }));
      }
    })();

    return newList;
  },

  deleteList: async (listId) => {
    const prevLists = get().lists;
    set((state) => ({ lists: state.lists.filter((list) => list.id !== listId) }));

    try {
      const { error } = await supabase.from('lists').delete().eq('id', listId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting list, rolling back...', e);
      set({ lists: prevLists });
    }
  },

  addToList: async (listId, mediaId, mediaType, title, posterPath) => {
    const prevLists = get().lists;

    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === listId) {
          const exists = list.movies.some((m) => m.mediaId === mediaId && m.mediaType === mediaType);
          if (exists) return list;
          return {
            ...list,
            movies: [...list.movies, { mediaId, mediaType, title, posterPath, addedDate: new Date().toISOString() }],
            updatedAt: new Date().toISOString(),
          };
        }
        return list;
      }),
    }));

    try {
      const { error: itemsError } = await supabase.from('list_items').insert({
        list_id: listId, media_id: mediaId, media_type: mediaType, title, poster_path: posterPath,
      });
      if (itemsError) throw itemsError;

      const { error: listError } = await supabase.from('lists').update({ updated_at: new Date().toISOString() }).eq('id', listId);
      if (listError) throw listError;
    } catch (e) {
      console.error('Error adding to list, rolling back...', e);
      set({ lists: prevLists });
    }
  },

  removeFromList: async (listId, mediaId, mediaType) => {
    const prevLists = get().lists;

    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            movies: list.movies.filter((m) => !(m.mediaId === mediaId && m.mediaType === mediaType)),
            updatedAt: new Date().toISOString(),
          };
        }
        return list;
      }),
    }));

    try {
      const { error } = await supabase.from('list_items')
        .delete()
        .eq('list_id', listId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
      
      if (error) throw error;
    } catch (e) {
      console.error('Error removing from list, rolling back...', e);
      set({ lists: prevLists });
    }
  },

  isInList: (listId, mediaId, mediaType) => {
    const list = get().lists.find((l) => l.id === listId);
    if (!list) return false;
    return list.movies.some((m) => m.mediaId === mediaId && m.mediaType === mediaType);
  },

  getAllLists: () => get().lists,
});
