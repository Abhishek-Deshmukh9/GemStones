import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onDismiss }) {
  if (!toast || !toast.visible) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald" />;
      case 'warning':
      case 'error':
        return <AlertTriangle size={16} className="text-red" />;
      default:
        return <Info size={16} className="text-accent" />;
    }
  };

  return (
    <div className={`institutional-toast toast-${toast.type || 'info'}`}>
      <div className="toast-icon-box">
        {getIcon()}
      </div>
      <div className="toast-content">
        <div className="toast-message">{toast.message}</div>
        {toast.subtext && <div className="toast-subtext">{toast.subtext}</div>}
      </div>
      <button 
        type="button" 
        className="toast-close-btn" 
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
