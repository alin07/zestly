import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, LOGIN, REGISTER } from '../lib/queries';
import { User, LoginInput, RegisterInput, AuthPayload } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthPayload>;
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

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { data, loading: queryLoading, error } = useQuery(GET_ME, {
    skip: !localStorage.getItem('token'),
    errorPolicy: 'all',
  });

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);

  const loading = queryLoading || loginLoading || registerLoading;

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    } else if (error && !localStorage.getItem('token')) {
      setUser(null);
    }
  }, [data, error]);

  const login = async (input: LoginInput): Promise<AuthPayload> => {
    try {
      const { data } = await loginMutation({
        variables: { input },
      });

      if (data?.login) {
        localStorage.setItem('token', data.login.token);
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