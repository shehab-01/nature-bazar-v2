"use client";

import { Check, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeamMember } from "@/lib/team";

export function PendingRequests({
  requests,
  onApprove,
  onDeny,
}: {
  requests: TeamMember[];
  onApprove: (id: number) => void;
  onDeny: (id: number) => void;
}) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access requests</CardTitle>
          <CardDescription>
            No one is waiting for approval right now.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access requests</CardTitle>
        <CardDescription>
          {requests.length} {requests.length === 1 ? "person" : "people"}{" "}
          waiting for approval to sign in to the admin panel.
        </CardDescription>
      </CardHeader>
      <div className="flex flex-col divide-y">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between gap-4 px-6 py-3"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                {request.pictureUrl && (
                  <AvatarImage src={request.pictureUrl} alt={request.name} />
                )}
                <AvatarFallback>
                  {request.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{request.name}</span>
                <span className="text-xs text-muted-foreground">
                  {request.email} · requested{" "}
                  {new Date(request.joinedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDeny(request.id)}
              >
                <X className="mr-1 size-3.5" />
                Deny
              </Button>
              <Button size="sm" onClick={() => onApprove(request.id)}>
                <Check className="mr-1 size-3.5" />
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
