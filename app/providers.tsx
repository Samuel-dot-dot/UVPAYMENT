'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import RoleSwitcher from '@/components/RoleSwitcher';
import type { UserRole } from '@/types';

interface RoleContextType {
  role: UserRole;
  realRole: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const HybridRoleProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const realRole = (session?.user?.role as UserRole) ?? 'guest';
  const [role, setRoleState] = useState<UserRole>(realRole);

  useEffect(() => {
    setRoleState(realRole);
  }, [realRole]);

  const setRole = (updatedRole: UserRole) => {
    if (realRole === 'owner') {
      setRoleState(updatedRole);
    }
  };

  const value = useMemo(
    () => ({
      role,
      realRole,
      setRole,
    }),
    [role, realRole]
  );

  return (
    <RoleContext.Provider value={value}>
      {children}
      <RoleSwitcher />
    </RoleContext.Provider>
  );
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <HybridRoleProvider>{children}</HybridRoleProvider>
    </SessionProvider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within the Providers wrapper');
  }
  return context;
}
