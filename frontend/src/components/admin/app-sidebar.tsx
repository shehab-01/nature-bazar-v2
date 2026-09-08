"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ChevronsUpDown,
  Activity,
  LayoutDashboard,
  Leaf,
  LogOut,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { useAuth } from "@/components/admin/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { PAGE_STATUSES, countForPage } from "@/lib/orders";
import { ROLE_LABELS } from "@/lib/team";
import { useOrderCounts } from "@/lib/use-order-counts";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  {
    title: "Web Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
    children: [
      { title: "Manual Order", url: "/admin/orders/manual" },
      { title: "Web Order List", url: "/admin/orders" },
      { title: "Incomplete", url: "/admin/orders/incomplete" },
      { title: "Good But No Response", url: "/admin/orders/good-but-no-response" },
      { title: "No Response", url: "/admin/orders/no-response" },
      { title: "Hold", url: "/admin/orders/hold" },
      { title: "Confirmed Order", url: "/admin/orders/confirm" },
      { title: "Shipping", url: "/admin/orders/ship" },
      { title: "Cancelled", url: "/admin/orders/cancelled" },
      { title: "History", url: "/admin/orders/history" },
    ],
  },
  { title: "Products", url: "/admin/products", icon: Package, superAdminOnly: true },
  { title: "Users", url: "/admin/users", icon: Users, superAdminOnly: true },
  { title: "System", url: "/admin/system", icon: Activity, superAdminOnly: true },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const counts = useOrderCounts();

  const items = navItems.filter(
    (item) => !item.superAdminOnly || user.role === "super_admin"
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Leaf className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Nature Bazar</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.url === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.url);

                if (item.children) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              // null until the first fetch lands, so the
                              // counters don't flash a wrong 0 on every load —
                              // and null for a page that holds no orders at
                              // all, like the Manual Order form, which would
                              // otherwise wear a permanent 0.
                              const count =
                                counts && PAGE_STATUSES[child.url]
                                  ? countForPage(child.url, counts)
                                  : null;
                              return (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === child.url}
                                  >
                                    <Link href={child.url}>
                                      <span className="truncate">
                                        {child.title}
                                      </span>
                                      {count !== null && (
                                        <span
                                          className={cn(
                                            "ml-auto shrink-0 text-xs tabular-nums",
                                            count > 0
                                              ? "font-medium text-sidebar-foreground"
                                              : "text-muted-foreground/60"
                                          )}
                                        >
                                          {count}
                                        </span>
                                      )}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8 rounded-lg">
                    {user.pictureUrl && (
                      <AvatarImage src={user.pictureUrl} alt={user.name} />
                    )}
                    <AvatarFallback className="rounded-lg">
                      {user.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
              >
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                  {ROLE_LABELS[user.role]}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
