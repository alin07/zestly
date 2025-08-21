import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, LOGIN, REGISTER } from '../lib/queries';
import { User, LoginInput, RegisterInput, AuthPayload } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput, rememberMe?: boolean) => Promise<AuthPayload>;
  register: (input: RegisterInput) => Promise<AuthPayload>;
  logout: () => void;
  isAuthenticated: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to get token from either storage
const getStoredToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { data, loading: queryLoading, error } = useQuery(GET_ME, {
    skip: !getStoredToken(),
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);

  const loading = queryLoading || loginLoading || registerLoading;

  useEffect(() => {
    const token = getStoredToken();
    
    if (data?.me) {
      setUser(data.me);
    } else if (error && token) {
      // Only clear user if there's a real authentication error
      if (error.networkError && 'statusCode' in error.networkError && error.networkError.statusCode === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
      } else if (error.graphQLErrors?.some(err => err.message.includes('Not authenticated'))) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
      }
      // Don't clear user for other types of GraphQL errors (field validation, etc.)
      // This keeps the user logged in during temporary issues
    } else if (!token) {
      setUser(null);
    }
  }, [data, error]);

  const login = async (input: LoginInput, rememberMe: boolean = false): Promise<AuthPayload> => {
    try {
      const { data } = await loginMutation({
        variables: { input },
      });

      if (data?.login) {
        // Store token in localStorage (or sessionStorage if not remembering)
        if (rememberMe) {
          localStorage.setItem('token', data.login.token);
          localStorage.setItem('rememberMe', 'true');
        } else {
          sessionStorage.setItem('token', data.login.token);
          localStorage.removeItem('rememberMe');
        }
        
        setUser(data.login.user);
        return data.login;
      }

      throw new Error('Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (input: RegisterInput): Promise<AuthPayload> => {
    try {
      const { data } = await registerMutation({
        variables: { input },
      });

      if (data?.register) {
        localStorage.setItem('token', data.register.token);
        setUser(data.register.user);
        return data.register;
      }

      throw new Error('Registration failed');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const isAuthenticated = !!user;
  const isAgent = user?.role?.name === 'agent';

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAgent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;