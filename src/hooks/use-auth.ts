
'use client';
// This file has been intentionally cleared to remove authentication functionality.
// A full login system can be re-implemented here in the future.

import React, { ReactNode } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return children;
};

export const useAuth = () => {
    return {
        user: null,
        loading: false,
        signup: async () => {},
        login: async () => {},
        logout: async () => {},
        isAuthenticated: false,
    };
};
