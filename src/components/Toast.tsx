import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
  description?: string;
}

/**
 * Toast notification component for displaying feedback messages
 */
const Toast: React.FC<ToastProps> = ({
  message,
  description,
  type = 'info',
  duration = 5000,
  onClose,
  isVisible
}) => {
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Define toast styling based on type
  const toastStyles = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      iconColor: 'text-green-500',
      progressColor: 'bg-green-500'
    },
    error: {
      icon: <AlertCircle className="h-5 w-5" />,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      iconColor: 'text-red-500',
      progressColor: 'bg-red-500'
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      iconColor: 'text-yellow-500',
      progressColor: 'bg-yellow-500'
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      iconColor: 'text-blue-500',
      progressColor: 'bg-blue-500'
    }
  };

  const style = toastStyles[type];

  // Handle automatic dismissal
  useEffect(() => {
    if (isVisible && duration !== Infinity) {
      // Set up progress bar
      const totalSteps = 100;
      const stepDuration = duration / totalSteps;
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, stepDuration);
      
      setIntervalId(interval);
      
      // Clean up on unmount or when toast is hidden
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isVisible, duration, onClose]);

  // Reset progress when toast is hidden
  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [isVisible, intervalId]);

  if (!isVisible) return null;

  return (
    <div 
      className={clsx(
        'fixed bottom-5 right-5 max-w-xs w-full shadow-md rounded-md border overflow-hidden transition-all transform',
        style.bgColor,
        style.borderColor,
        'animate-slide-in'
      )}
      style={{ zIndex: 9999 }}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={clsx('flex-shrink-0', style.iconColor)}>
            {style.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={clsx('text-sm font-medium', style.textColor)}>{message}</p>
            {description && (
              <p className={clsx('mt-1 text-sm opacity-90', style.textColor)}>{description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={clsx('inline-flex rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-offset-2', style.textColor, 'hover:bg-white hover:bg-opacity-30')}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-200 bg-opacity-50">
        <div 
          className={style.progressColor}
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        />
      </div>
    </div>
  );
};

/**
 * Context and hook for managing toast notifications
 */
export const ToastContext = React.createContext<{
  showToast: (props: Omit<ToastProps, 'isVisible' | 'onClose'>) => void;
  hideToast: () => void;
}>({
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => React.useContext(ToastContext);

/**
 * Toast provider component
 */
export const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [toast, setToast] = useState<Omit<ToastProps, 'isVisible' | 'onClose'> | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = (props: Omit<ToastProps, 'isVisible' | 'onClose'>) => {
    if (isVisible) {
      // If a toast is already visible, hide it first
      setIsVisible(false);
      setTimeout(() => {
        setToast(props);
        setIsVisible(true);
      }, 300); // Small delay for animation
    } else {
      setToast(props);
      setIsVisible(true);
    }
  };

  const hideToast = () => {
    setIsVisible(false);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast
          {...toast}
          isVisible={isVisible}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export default Toast; 