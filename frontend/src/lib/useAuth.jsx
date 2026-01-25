import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch logged-in user
  const fetchMe = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return null;
    }

    try {
      const res = await fetch("https://aditya.dev-nest.tech/api/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return data.user;
      } else {
        logout();
        return null;
      }
    } catch (err) {
      console.error(err);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const res = await fetch("https://aditya.dev-nest.tech/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem("token", data.token);

    // Fetch user details immediately to get role
    const fetchedUser = await fetchMe();

    if (fetchedUser) {
      if (fetchedUser.role === "user") {
        window.location.href = "/user";
      } else {
        window.location.href = "/merchant";
      }
    }
  };

  // REGISTER
  const register = async (name, email, password, role) => {
    const res = await fetch("https://aditya.dev-nest.tech/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem("token", data.token);

    // Fetch user details immediately
    const fetchedUser = await fetchMe();

    if (fetchedUser) {
      if (fetchedUser.role === "user") {
        window.location.href = "/user";
      } else {
        window.location.href = "/merchant";
      }
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);