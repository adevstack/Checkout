import { useState } from "react";
import { UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function UserDropdown() {
  const { user, login, logout } = useAuth();
  const [_, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const handleLoginAsUser = () => {
    login({ email: "user@example.com", password: "user123" });
    setOpen(false);
  };

  const handleLoginAsAdmin = () => {
    login({ email: "admin@example.com", password: "admin123" });
    setOpen(false);
    setLocation("/admin/dashboard");
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    setLocation("/");
  };

  const handleNavigate = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <span className="sr-only">Open user menu</span>
          {user ? (
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {!user ? (
          <>
            <DropdownMenuItem onSelect={() => handleLoginAsUser()}>
              Login as User
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleLoginAsAdmin()}>
              Login as Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleNavigate("/login")}>
              Custom Login
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleNavigate("/register")}>
              Register
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <div className="px-2 py-1.5 text-sm font-medium">
              {user.username}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleNavigate("/profile")}>
              Profile
            </DropdownMenuItem>
            {user.isAdmin && (
              <DropdownMenuItem onSelect={() => handleNavigate("/admin/dashboard")}>
                Dashboard
              </DropdownMenuItem>
            )}
            {!user.isAdmin && (
              <DropdownMenuItem onSelect={() => handleNavigate("/orders")}>
                My Orders
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              Logout
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
