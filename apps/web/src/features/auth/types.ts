export const roles = [
  "super_admin",
  "event_admin",
  "oversight",
  "kafilah_admin",
  "branch_admin",
  "verifier",
  "editor",
  "contributor",
] as const;
export type Role = (typeof roles)[number];

export type Assignment = {
  role: Role;
  eventId: string;
  status: "active" | "suspended";
  districtIds?: string[];
  branchIds?: string[];
  divisionIds?: string[];
};

export type RoleAssignmentDocument = {
  assignments: Assignment[];
  disabled?: boolean;
  revision: number;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  organization?: string;
  position?: string;
  status: "active" | "pending" | "disabled";
  mustChangePassword: boolean;
  preferences?: { compactNavigation?: boolean };
};

export type Permission =
  | "dashboard:view"
  | "participants:view"
  | "participants:write"
  | "results:view"
  | "results:submit"
  | "results:approve"
  | "news:write"
  | "news:publish"
  | "reports:view"
  | "roles:manage"
  | "settings:manage";

const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    "dashboard:view",
    "participants:view",
    "participants:write",
    "results:view",
    "results:submit",
    "results:approve",
    "news:write",
    "news:publish",
    "reports:view",
    "roles:manage",
    "settings:manage",
  ],
  event_admin: [
    "dashboard:view",
    "participants:view",
    "participants:write",
    "results:view",
    "results:approve",
    "news:write",
    "news:publish",
    "reports:view",
    "settings:manage",
  ],
  oversight: ["dashboard:view", "results:view", "reports:view"],
  kafilah_admin: [
    "dashboard:view",
    "participants:view",
    "participants:write",
    "results:view",
    "news:write",
  ],
  branch_admin: [
    "dashboard:view",
    "participants:view",
    "results:view",
    "results:submit",
    "news:write",
  ],
  verifier: [
    "dashboard:view",
    "participants:view",
    "participants:write",
    "results:view",
  ],
  editor: ["dashboard:view", "results:view", "news:write", "news:publish"],
  contributor: ["dashboard:view", "results:view", "news:write"],
};

export function permissionsFor(assignments: Assignment[]): Set<Permission> {
  return new Set(
    assignments
      .filter((item) => item.status === "active")
      .flatMap((item) => rolePermissions[item.role]),
  );
}
