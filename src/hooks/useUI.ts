import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  setLocale,
  setSidebarOpen,
  setTheme,
  toggleSidebar,
  type Locale,
  type Theme,
} from "@/store/slices/uiSlice";

export function useUI() {
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen, theme, locale } = useSelector((state: RootState) => state.ui);

  const openSidebar = useCallback(
    (open: boolean) => dispatch(setSidebarOpen(open)),
    [dispatch],
  );

  const onToggleSidebar = useCallback(() => dispatch(toggleSidebar()), [dispatch]);

  const onSetTheme = useCallback(
    (next: Theme) => dispatch(setTheme(next)),
    [dispatch],
  );

  const onSetLocale = useCallback(
    (next: Locale) => dispatch(setLocale(next)),
    [dispatch],
  );

  return {
    sidebarOpen,
    theme,
    locale,
    openSidebar,
    toggleSidebar: onToggleSidebar,
    setTheme: onSetTheme,
    setLocale: onSetLocale,
  };
}
