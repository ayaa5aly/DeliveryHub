"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { I18nProvider } from "@/i18n";
import { store } from "@/store";
import { setLocale, setTheme } from "@/store/slices/uiSlice";
import "./App.css";

interface AppProps {
  children: ReactNode;
}

function AppBootstrap({ children }: AppProps) {
  useEffect(() => {
    const theme = store.getState().ui.theme;
    const locale = store.getState().ui.locale;
    store.dispatch(setTheme(theme));
    store.dispatch(setLocale(locale));
  }, []);

  return (
    <Provider store={store}>
      <I18nProvider>{children}</I18nProvider>
    </Provider>
  );
}

export default function App({ children }: AppProps) {
  return <AppBootstrap>{children}</AppBootstrap>;
}
