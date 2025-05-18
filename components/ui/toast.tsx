import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, duration = 3000, type = 'success', onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-md text-white shadow-lg transform transition-all duration-300 ${
        getTypeStyles()
      } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      {message}
    </div>
  );
};

interface ToastContainerProps {
  children: React.ReactNode;
}

export const ToastContainer = ({ children }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {children}
    </div>
  );
};

export default Toast; 
