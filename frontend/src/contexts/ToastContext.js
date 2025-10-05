import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Méthodes de raccourci
  const success = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const xpGained = useCallback((xp, duration) => {
    showToast(`+${xp} XP gained!`, 'xp', duration);
  }, [showToast]);

  const goldGained = useCallback((gold, duration) => {
    showToast(`+${gold} Gold earned!`, 'gold', duration);
  }, [showToast]);

  const levelUp = useCallback((level, duration) => {
    showToast(`Level Up! You are now level ${level}!`, 'level', duration || 4000);
  }, [showToast]);

  const taskCompleted = useCallback((xp, gold, duration) => {
    showToast(`Task completed! +${xp} XP, +${gold} Gold`, 'success', duration);
  }, [showToast]);

  const value = {
    showToast,
    success,
    error,
    warning,
    info,
    xpGained,
    goldGained,
    levelUp,
    taskCompleted,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};
