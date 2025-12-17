import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { handleLogoutEvent } from '../store/slices/authSlice';

export function useAuthInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleLogout = () => {
      dispatch(handleLogoutEvent());
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [dispatch]);
}
