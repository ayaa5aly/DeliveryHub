import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { clearError, fetchCurrentUser, login, logout } from "@/store/slices/authSlice";
import type { LoginCredentials } from "@/types/auth";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const signIn = useCallback(
    (credentials: LoginCredentials) => dispatch(login(credentials)),
    [dispatch],
  );

  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  const loadUser = useCallback(() => dispatch(fetchCurrentUser()), [dispatch]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    loadUser,
    dismissError,
  };
}
