"use client";

import React from "react";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// Define user type
export type User = {
  id: string;
  username: string;
  email: string;
};

// Define user with password for internal use
interface UserWithPassword extends User {
  password: string;
}

// Define auth context type
type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // Get users from local storage
    const usersJson = localStorage.getItem("users") || "[]";
    const users = JSON.parse(usersJson) as UserWithPassword[];

    // Find user with matching email and password
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      // Create user object without password
      const { password: passwordToRemove, ...userWithoutPassword } = foundUser;

      // Save to state and local storage
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  // Signup function
  const signup = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    // Get existing users
    const usersJson = localStorage.getItem("users") || "[]";
    const users = JSON.parse(usersJson) as UserWithPassword[];

    // Check if email already exists
    if (users.some((u) => u.email === email)) {
      return false;
    }

    // Create new user
    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      username,
      email,
      password,
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Login the user (without password in state)
    const { password: passwordToRemove, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));

    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
