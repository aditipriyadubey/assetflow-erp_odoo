import { createContext, useMemo, useState } from 'react';

// Temporary demo session storage — replace with real API integration later.
const SESSION_STORAGE_KEY = 'assetflow_demo_session';

const AuthContext = createContext(null);

function loadDemoSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDemoSession(user) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function clearDemoSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function createDemoUser({ name, email, role, id }) {
  return {
    id,
    name,
    email,
    role,
    department_id: null,
    status: 'Active',
  };
}

function validateCredentials(email, password) {
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Please enter a valid email address.';
  }

  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters and include a letter and a number.';
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must be at least 8 characters and include a letter and a number.';
  }

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadDemoSession());

  const login = async ({ email, password, demoRole }) => {
    const credentialError = validateCredentials(email, password);

    if (credentialError) {
      return { success: false, error: credentialError };
    }

    if (!demoRole) {
      return { success: false, error: 'Please select a demo role for testing.' };
    }

    const nextUser = createDemoUser({
      id: Date.now(),
      name: email.split('@')[0],
      email: email.trim(),
      role: demoRole,
    });

    saveDemoSession(nextUser);
    setUser(nextUser);

    return { success: true, user: nextUser };
  };

  const signup = async ({ name, email, password }) => {
    const trimmedName = name?.trim() ?? '';

    if (trimmedName.length < 2 || trimmedName.length > 150) {
      return { success: false, error: 'Name is required (2–150 characters).' };
    }

    const credentialError = validateCredentials(email, password);

    if (credentialError) {
      return { success: false, error: credentialError };
    }

    const nextUser = createDemoUser({
      id: Date.now(),
      name: trimmedName,
      email: email.trim(),
      role: 'Employee',
    });

    saveDemoSession(nextUser);
    setUser(nextUser);

    return { success: true, user: nextUser };
  };

  const logout = () => {
    clearDemoSession();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      login,
      signup,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
