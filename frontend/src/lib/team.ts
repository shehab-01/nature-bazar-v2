export type UserRole = "super_admin" | "staff";
export type UserStatus = "pending" | "active" | "suspended";

export type TeamMember = {
  id: number;
  email: string;
  name: string;
  /** Short working name set by a super admin; overrides `name` in the UI. */
  nickname: string | null;
  pictureUrl: string | null;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastActiveAt: string | null;
  ordersConfirmed: number;
  ordersShipped: number;
  /** Super admin by server configuration; the role cannot be changed here. */
  pinned: boolean;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  staff: "Order Staff",
};
