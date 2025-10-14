import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signIn, signOutUser, getAuthErrorMessage, type AuthError } from "@/lib/auth";
import { getDeliveryPartner } from "@/lib/firestore";
import type { DeliveryPartner } from "@shared/schema";

interface AuthState {
  user: User | null;
  deliveryPartner: DeliveryPartner | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    deliveryPartner: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const deliveryPartner = await getDeliveryPartner(user.uid);
          setState({
            user,
            deliveryPartner,
            loading: false,
            error: null,
          });
        } catch (error) {
          setState({
            user,
            deliveryPartner: null,
            loading: false,
            error: "Failed to load delivery partner data",
          });
        }
      } else {
        setState({
          user: null,
          deliveryPartner: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Demo mode - create mock user for testing
      if (email.includes('@bolpurmart.delivery') && password === 'demo123') {
        const mockUser = {
          uid: 'demo-user-123',
          email: email,
          emailVerified: true,
        } as any;
        
        const mockDeliveryPartner = {
          id: 'demo-user-123',
          name: 'Demo Partner',
          phone: email.split('@')[0],
          email: email,
          status: 'online' as const,
          vehicleType: 'Bike',
          vehicleNumber: 'DL01AB1234',
          rating: 4.5,
          totalDeliveries: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setState({
          user: mockUser,
          deliveryPartner: mockDeliveryPartner,
          loading: false,
          error: null,
        });
        return;
      }
      
      await signIn(email, password);
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: getAuthErrorMessage(error as AuthError),
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await signOutUser();
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to sign out",
      }));
      throw error;
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    login,
    logout,
    clearError,
  };
}
