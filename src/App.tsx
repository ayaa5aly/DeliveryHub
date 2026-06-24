import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { I18nProvider } from "@/i18n";
import { store } from "@/store";
import { router } from "@/router";
import { setLocale, setTheme } from "@/store/slices/uiSlice";
import "./App.css";

function AppBootstrap() {
  useEffect(() => {
    const theme = store.getState().ui.theme;
    const locale = store.getState().ui.locale;
    store.dispatch(setTheme(theme));
    store.dispatch(setLocale(locale));
  }, []);

  return (
    <Provider store={store}>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </Provider>
  );
}

export default function App() {
  return <AppBootstrap />;
}
