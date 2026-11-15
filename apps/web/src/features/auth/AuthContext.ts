import { createContext, useContext } from "react";
import type { User } from "firebase/auth";
import type { Assignment, Permission, UserProfile } from "./types";

export type AuthContextValue = {
  user: User | null;
  assignments: Assignment[];
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  disabled: boolean;
  error: string | null;
  hasPermission: (permission: Permission) => boolean;
  signOutUser: () => Promise<void>;
  refreshAssignments: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  return value;
}
