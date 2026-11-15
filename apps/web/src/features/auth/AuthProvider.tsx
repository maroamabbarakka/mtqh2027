import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getFirebaseServices } from "@/config/firebase-services";
import { AuthContext } from "./AuthContext";
import {
  permissionsFor,
  type Assignment,
  type RoleAssignmentDocument,
  type UserProfile,
} from "./types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => getFirebaseServices(), []);
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(services !== null);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(
    async (currentUser: User | null) => {
      setAssignments([]);
      setDisabled(false);
      setError(null);
      if (!currentUser || !services) return;
      try {
        const snapshot = await getDoc(
          doc(services.firestore, "roleAssignments", currentUser.uid),
        );
        if (!snapshot.exists()) return;
        const data = snapshot.data() as RoleAssignmentDocument;
        setDisabled(data.disabled === true);
        setAssignments(
          data.assignments?.filter((item) => item.status === "active") ?? [],
        );
      } catch {
        setError(
          "Hak akses belum dapat diverifikasi. Coba masuk kembali atau hubungi administrator.",
        );
      }
    },
    [services],
  );

  const loadProfile = useCallback(
    async (currentUser: User | null) => {
      setProfile(null);
      if (!currentUser || !services) return;
      try {
        const snapshot = await getDoc(
          doc(services.firestore, "users", currentUser.uid),
        );
        if (snapshot.exists()) setProfile(snapshot.data() as UserProfile);
      } catch {
        setError("Profil akun belum dapat dimuat. Coba masuk kembali.");
      }
    },
    [services],
  );

  useEffect(() => {
    if (!services) return;
    return onAuthStateChanged(services.auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      await Promise.all([
        loadAssignments(currentUser),
        loadProfile(currentUser),
      ]);
      setLoading(false);
    });
  }, [loadAssignments, loadProfile, services]);

  const permissionSet = useMemo(
    () => permissionsFor(assignments),
    [assignments],
  );
  const value = useMemo(
    () => ({
      user,
      profile,
      assignments,
      loading,
      configured: services !== null,
      disabled,
      error,
      hasPermission: (permission: Parameters<typeof permissionSet.has>[0]) =>
        permissionSet.has(permission),
      signOutUser: async () => {
        if (services) await signOut(services.auth);
      },
      refreshAssignments: async () => loadAssignments(user),
      refreshProfile: async () => loadProfile(user),
    }),
    [
      assignments,
      disabled,
      error,
      loadAssignments,
      loadProfile,
      loading,
      permissionSet,
      profile,
      services,
      user,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
