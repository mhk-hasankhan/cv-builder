import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,

  init: () => {
    const token = localStorage.getItem('auth_token');
    const raw = localStorage.getItem('auth_user');
    if (token && raw) {
      try {
        set({ token, user: JSON.parse(raw), isLoading: false });
        return;
      } catch {}
    }
    set({ isLoading: false });
  },

  login: (token, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
