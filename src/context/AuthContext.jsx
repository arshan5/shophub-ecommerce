import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

const STORAGE_KEY = "shophub_auth_user";
const TOKEN_KEY = "shophub_token";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  /*
  =========================
  SAVE USER
  =========================
  */

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  /*
  =========================
  REGISTER
  =========================
  */

  const register = async ({
    firstName,
    lastName,
    email,
    password,
  }) => {
    const response = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Registration failed"
      );
    }

    return data;
  };

  /*
  =========================
  VERIFY EMAIL
  =========================
  */

  const verifyEmail = async ({
    email,
    code,
  }) => {
    const response = await fetch(
      `${API_URL}/api/auth/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Email verification failed"
      );
    }

    return data;
  };

  /*
  =========================
  RESEND VERIFICATION CODE
  =========================
  */

  const resendVerificationCode = async (
    email
  ) => {
    const response = await fetch(
      `${API_URL}/api/auth/resend-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to resend code"
      );
    }

    return data;
  };

  /*
  =========================
  LOGIN
  =========================
  */

  const login = async ({
    email,
    password,
  }) => {
    const response = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data.message || "Login failed"
      );

      error.status = response.status;
      error.emailVerified =
        data.emailVerified;

      throw error;
    }

    /*
    Save JWT token
    */
    if (data.token) {
      localStorage.setItem(
        TOKEN_KEY,
        data.token
      );
    }

    /*
    Save logged-in user
    */
    if (data.user) {
      setUser(data.user);
    }

    return data;
  };

  /*
  =========================
  UPDATE PROFILE
  =========================
  */

  const updateProfile = async ({
    firstName,
    lastName,
    phone,
    avatar,
  }) => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (!token) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (!user) {
      throw new Error(
        "User is not logged in."
      );
    }

    const userId =
      user.id || user._id;

    if (!userId) {
      throw new Error(
        "User ID not found."
      );
    }

    const formData = new FormData();

    /*
    User ID
    */
    formData.append(
      "userId",
      userId
    );

    /*
    User information
    */
    formData.append(
      "firstName",
      firstName || ""
    );

    formData.append(
      "lastName",
      lastName || ""
    );

    formData.append(
      "phone",
      phone || ""
    );

    /*
    Profile image
    */
    if (avatar) {
      formData.append(
        "avatar",
        avatar
      );
    }

    const response = await fetch(
      `${API_URL}/api/auth/profile`,
      {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to update profile."
      );
    }

    /*
    Update React user state
    */
    if (data.user) {
      setUser(data.user);
    }

    /*
    Also update localStorage immediately
    */
    if (data.user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data.user)
      );
    }

    return data;
  };

  /*
  =========================
  LOGOUT
  =========================
  */

  const logout = () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      STORAGE_KEY
    );

    setUser(null);
  };

  /*
  =========================
  CONTEXT VALUE
  =========================
  */

  const value = {
    user,

    isAuthenticated: !!user,

    login,
    register,

    verifyEmail,
    resendVerificationCode,

    updateProfile,

    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
=========================
USE AUTH
=========================
*/

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}