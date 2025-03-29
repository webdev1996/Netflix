import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  isProfileMenuOpen: boolean;
  isVideoModalOpen: boolean;
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    read: boolean;
  }[];
}

const initialState: UIState = {
  isSidebarOpen: true,
  isSearchOpen: false,
  isProfileMenuOpen: false,
  isVideoModalOpen: false,
  theme: 'dark',
  language: 'en',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    toggleProfileMenu: (state) => {
      state.isProfileMenuOpen = !state.isProfileMenuOpen;
    },
    toggleVideoModal: (state) => {
      state.isVideoModalOpen = !state.isVideoModalOpen;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) => {
      state.notifications.push({
        ...action.payload,
        id: Date.now().toString(),
      });
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleSidebar,
  toggleSearch,
  toggleProfileMenu,
  toggleVideoModal,
  setTheme,
  setLanguage,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer; 