import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// A simple hook to prevent accidental navigation or refresh
export const useConfirmNavigation = (isDirty) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Standard for most browsers to show a dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const attemptNavigation = (path) => {
    if (isDirty) {
      setPendingPath(path);
      setShowConfirm(true);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    setShowConfirm(false);
    if (pendingPath) {
      navigate(pendingPath);
    }
  };

  const cancelNavigation = () => {
    setShowConfirm(false);
    setPendingPath(null);
  };

  return { attemptNavigation, showConfirm, confirmNavigation, cancelNavigation };
};
