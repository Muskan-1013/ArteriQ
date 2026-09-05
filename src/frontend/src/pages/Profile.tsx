import { LogOut, Mail, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface ProfileProps {
  onBack: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

export function Profile({ onBack }: ProfileProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="glass-strong rounded-3xl p-8 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/15 text-2xl font-display text-primary">
          {user ? getInitials(user.name) : <UserRound className="size-8" />}
        </div>

        <h1 className="mt-4 font-display text-2xl tracking-wide text-foreground">
          {user?.name ?? "Your profile"}
        </h1>

        {user?.email && (
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" />
            {user.email}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            data-ocid="profile_back_button"
            variant="outline"
            className="rounded-full"
            onClick={onBack}
          >
            Back to Home
          </Button>
          <Button
            type="button"
            data-ocid="profile_logout_button"
            variant="destructive"
            className="rounded-full"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
