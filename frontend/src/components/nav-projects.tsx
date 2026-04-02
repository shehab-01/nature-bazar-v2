"use client";

import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1">
        Navigation
      </SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.name}>
              <Link
                href={item.url}
                className={`
                  flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-[#E50914] text-white shadow-sm"
                    : "text-[#444444] hover:bg-[#F0EFEB] hover:text-[#141414]"
                  }
                `}
              >
                <item.icon
                  size={16}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-white" : "text-[#757575]"}
                />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
