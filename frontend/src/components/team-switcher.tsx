"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const [activeTeam] = React.useState(teams[0]);

  if (!activeTeam) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent cursor-default"
        >
          <div className="flex items-center gap-2 py-1">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#E50914] shrink-0">
              <span className="text-white font-black text-sm leading-none">H</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-foreground">
                {activeTeam.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                {activeTeam.plan}
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
