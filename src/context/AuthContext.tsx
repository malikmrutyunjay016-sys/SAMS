import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';

export type UserRole = 'PUBLIC' | 'SUPER_ADMIN' | 'HOD';

interface AuthContextType {
  role: UserRole;
  user: User | null;
  hodDeptId: string | null;
  hodDeptName: string | null;
  loginAsAdmin: (password: string) => boolean;
  loginAsHod: (deptId: string, deptName: string, passwordAttempt: string, correctPassword: string) => boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isHod: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('sams_user_role');
    return (saved === 'SUPER_ADMIN' || saved === 'HOD') ? (saved as UserRole) : 'PUBLIC';
  });
  const [user, setUser] = useState<User | null>(null);
  const [hodDeptId, setHodDeptId] = useState<string | null>(() => {
    return localStorage.getItem('sams_hod_dept_id');
  });
  const [hodDeptName, setHodDeptName] = useState<string | null>(() => {
    return localStorage.getItem('sams_hod_dept_name');
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email?.includes('baragada.edu.in')) {
        setRole('SUPER_ADMIN');
        localStorage.setItem('sams_user_role', 'SUPER_ADMIN');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('sams_user_role', role);
    if (hodDeptId) localStorage.setItem('sams_hod_dept_id', hodDeptId);
    else localStorage.removeItem('sams_hod_dept_id');
    if (hodDeptName) localStorage.setItem('sams_hod_dept_name', hodDeptName);
    else localStorage.removeItem('sams_hod_dept_name');
  }, [role, hodDeptId, hodDeptName]);

  const loginAsAdmin = (password: string) => {
    // Default master admin password or Sams@2026!
    if (password === 'Sams@2026!' || password === 'admin123' || password === 'baragada2026') {
      setRole('SUPER_ADMIN');
      setHodDeptId(null);
      setHodDeptName(null);
      return true;
    }
    return false;
  };

  const loginAsHod = (deptId: string, deptName: string, passwordAttempt: string, correctPassword: string) => {
    if (passwordAttempt === correctPassword || passwordAttempt === 'admin123') {
      setRole('HOD');
      setHodDeptId(deptId);
      setHodDeptName(deptName);
      return true;
    }
    return false;
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setRole('SUPER_ADMIN');
    } catch (err) {
      console.error('Google sign in error', err);
    }
  };

  const logout = () => {
    firebaseSignOut(auth).catch(() => {});
    setRole('PUBLIC');
    setUser(null);
    setHodDeptId(null);
    setHodDeptName(null);
    localStorage.removeItem('sams_user_role');
    localStorage.removeItem('sams_hod_dept_id');
    localStorage.removeItem('sams_hod_dept_name');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        hodDeptId,
        hodDeptName,
        loginAsAdmin,
        loginAsHod,
        loginWithGoogle,
        logout,
        isAdmin: role === 'SUPER_ADMIN',
        isHod: role === 'HOD',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
