import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";
export type Locale = "en" | "ar";

export interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  locale: Locale;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem("dh_theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getInitialLocale = (): Locale => {
  const stored = localStorage.getItem("dh_locale");
  if (stored === "en" || stored === "ar") return stored;
  return "en";
};

const initialState: UIState = {
  sidebarOpen: false,
  theme: typeof window !== "undefined" ? getInitialTheme() : "light",
  locale: typeof window !== "undefined" ? getInitialLocale() : "en",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem("dh_theme", action.payload);
      document.documentElement.classList.toggle("dark", action.payload === "dark");
    },
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
      localStorage.setItem("dh_locale", action.payload);
      document.documentElement.dir = action.payload === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, setLocale } = uiSlice.actions;
export default uiSlice.reducer;
