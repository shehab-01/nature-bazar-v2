"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { staffLabel } from "@/lib/orders";
import type { TeamMember } from "@/lib/team";

/**
 * Give a staff member the short name they are known by across the admin —
 * the Staff column, order tags, and anywhere else a person is credited.
 */
export function NicknameDialog({
  member,
  onOpenChange,
  onSave,
}: {
  /** The member being renamed, or null when the dialog is closed. */
  member: TeamMember | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, nickname: string) => Promise<void>;
}) {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (member) setValue(member.nickname ?? "");
  }, [member]);

  if (!member) return null;

  const nickname = value.trim();
  const submit = async () => {
    setBusy(true);
    try {
      await onSave(member.id, nickname);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nickname for {member.name}</DialogTitle>
          <DialogDescription>
            Shown wherever this person is credited — the Staff column and order
            tags. Leave it empty to go back to their full name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            autoFocus
            maxLength={40}
            placeholder={staffLabel(member.name, null)}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submit();
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Will show as{" "}
            <span className="font-medium text-foreground">
              {staffLabel(member.name, nickname || null)}
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={busy} onClick={submit}>
            {nickname ? "Save nickname" : "Clear nickname"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
