export type UserRole = "super_admin" | "staff";
export type UserStatus = "pending" | "active" | "suspended";

export type TeamMember = {
  id: number;
  email: string;
  name: string;
  pictureUrl: string | null;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastActiveAt: string | null;
  ordersConfirmed: number;
  ordersShipped: number;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  staff: "Order Staff",
};
