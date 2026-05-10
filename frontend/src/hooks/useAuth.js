import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const useAuth = () => {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }, []);

  const token = useMemo(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  const isAuthenticated = useMemo(() => {
    return Boolean(token && user);
  }, [token, user]);

  const isDonor = useMemo(() => {
    return user?.userType?.toLowerCase() === "donor";
  }, [user]);

  const isNgo = useMemo(() => {
    return user?.userType?.toLowerCase() === "ngo";
  }, [user]);

  const setAuth = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const getDashboardPath = useCallback(() => {
    return isNgo ? "/Dashboard/Ngo" : "/Dashboard/Home";
  }, [isNgo]);

  const requireAuth = useCallback((requiredUserType = null) => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return false;
    }

    if (requiredUserType) {
      const normalizedType = requiredUserType.toLowerCase();
      const userType = user?.userType?.toLowerCase();

      if (userType !== normalizedType) {
        navigate("/login", { replace: true });
        return false;
      }
    }

    return true;
  }, [isAuthenticated, user, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    isDonor,
    isNgo,
    setAuth,
    clearAuth,
    getDashboardPath,
    requireAuth,
  };
};

export default useAuth;
