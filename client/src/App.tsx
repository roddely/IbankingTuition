import axios from "axios";

import { useState, useEffect, useRef, useCallback } from "react";
import { LoginForm } from "./components/LoginForm";
import { PaymentForm } from "./components/PaymentForm";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const timeoutRef = useRef<number | null>(null); 

  const handleLogin = useCallback((userData: any) => {
    setUser(userData);
  }, []);

const handleLogout = useCallback(async () => {
    try {
        // GỌI API LOGOUT: Xóa cookie JWT trên Server
        // Đảm bảo URL này đúng với User Service của bạn
        await axios.post('http://localhost:5001/api/users/logout', {}, { withCredentials: true }); 
        console.log("Logged out successfully via User Service.");
    } catch (error) {
        // Nếu API thất bại (ví dụ: mất kết nối), vẫn clear session local
        console.error("Logout API failed, clearing local session.", error); 
    } finally {
        setUser(null);
    }
  }, []);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (user) {
      const newTimer = setTimeout(() => {
        console.log("Session timed out due to 15m inactivity. Forcing logout.");
        handleLogout();
      }, IDLE_TIMEOUT_MS);
      timeoutRef.current = newTimer as any;
    }
  }, [user, handleLogout]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/users/me',
          { 
            withCredentials: true 
          });
          if (response.status === 200) {
            setUser(response.data);
          }
      } catch (error : any) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);
  
  useEffect(() => {
    if (!user) return;
    
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetTimeout();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetTimeout]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Loading session...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen">
      {user ? (
        <PaymentForm user={user} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}