import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<InsertUser, "role"> & { role: "admin" | "user" }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<InsertUser>) => Promise<void>;
}

// Default value for context when not wrapped in provider
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => { throw new Error("AuthProvider not initialized"); },
  register: async () => { throw new Error("AuthProvider not initialized"); },
  logout: () => { /* No-op */ },
  updateUserProfile: async () => { throw new Error("AuthProvider not initialized"); }
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // If token is invalid, clear it
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      
      localStorage.setItem("authToken", data.token);
      setUser(data.user);
      
      // Invalidate any cached data that might depend on auth state
      queryClient.invalidateQueries();
      
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Invalid email or password");
    }
  };

  const register = async (userData: Omit<InsertUser, "role"> & { role: "admin" | "user" }) => {
    try {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();
      
      localStorage.setItem("authToken", data.token);
      setUser(data.user);
      
      // Invalidate any cached data that might depend on auth state
      queryClient.invalidateQueries();
      
      return data;
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message.includes("Email already registered")) {
        throw new Error("Email already registered");
      } else if (error.message.includes("Username already taken")) {
        throw new Error("Username already taken");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    
    // Clear all queries from cache on logout
    queryClient.clear();
  };

  const updateUserProfile = async (data: Partial<InsertUser>) => {
    if (!user) throw new Error("Not authenticated");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      
      // Invalidate user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      return updatedUser;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
