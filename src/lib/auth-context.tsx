
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const mockUsers = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'User',
    email: 'user@example.com',
    password: 'password',
    role: 'user' as const,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Impossibile recuperare l'utente salvato:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const userObj = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      toast.success('Accesso effettuato con successo!');
      return userObj;
    }
    
    toast.error('Email o password non validi');
    return null;
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      toast.error('Email già registrata');
      return null;
    }

    // Create new user
    const newUser = {
      id: `${mockUsers.length + 1}`,
      name,
      email,
      password,
      role: 'user' as const,
    };
    
    mockUsers.push(newUser);
    
    const userObj = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    toast.success('Registrazione completata con successo!');
    return userObj;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Disconnessione effettuata');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
