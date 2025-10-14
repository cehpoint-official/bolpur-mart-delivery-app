import { useState, useEffect } from "react";
import {
  getAvailableOrders,
  getPartnerActiveOrders,
  updateOrderStatus,
  getDeliveryHistory,
  addEarnings,
} from "@/lib/firestore";
import type { Order } from "@shared/schema";

interface OrdersState {
  availableOrders: Order[];
  activeOrders: Order[];
  deliveryHistory: Order[];
  loading: boolean;
  error: string | null;
}

interface OrdersActions {
  acceptOrder: (orderId: string, partnerId: string) => Promise<void>;
  declineOrder: (orderId: string) => Promise<void>;
  markAsPickedUp: (orderId: string) => Promise<void>;
  markAsEnRoute: (orderId: string) => Promise<void>;
  markAsDelivered: (orderId: string, partnerId: string) => Promise<void>;
  loadDeliveryHistory: (partnerId: string) => Promise<void>;
  clearError: () => void;
}

export function useOrders(partnerId?: string): OrdersState & OrdersActions {
  const [state, setState] = useState<OrdersState>({
    availableOrders: [],
    activeOrders: [],
    deliveryHistory: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!partnerId) return;

    setState(prev => ({ ...prev, loading: true }));

    // Demo mode - create mock orders for testing
    if (partnerId === 'demo-user-123') {
      const mockAvailableOrders = [
        {
          id: 'order-001',
          customerId: 'cust-001',
          customerName: 'Rahul Sharma',
          customerPhone: '+91 9876543210',
          customerAddress: 'House 123, Sector 15, Noida, UP 201301',
          storeId: 'store-001',
          storeName: 'Fresh Mart Grocery',
          storeAddress: 'Shop 45, Central Market, Noida, UP 201301',
          items: [
            { id: 'item-1', name: 'Milk 1L', quantity: 2, price: 60 },
            { id: 'item-2', name: 'Bread', quantity: 1, price: 30 },
            { id: 'item-3', name: 'Eggs (12)', quantity: 1, price: 80 }
          ],
          orderValue: 170,
          deliveryFee: 25,
          status: 'new' as const,
          distance: 2.5,
          deliveryDistance: 3.2,
          createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          updatedAt: new Date(Date.now() - 10 * 60 * 1000),
        },
        {
          id: 'order-002',
          customerId: 'cust-002',
          customerName: 'Priya Singh',
          customerPhone: '+91 9876543211',
          customerAddress: 'Flat 402, Royal Heights, Sector 22, Noida, UP 201301',
          storeId: 'store-002',
          storeName: 'Quick Pharmacy',
          storeAddress: 'Shop 12, Health Plaza, Noida, UP 201301',
          items: [
            { id: 'item-4', name: 'Paracetamol', quantity: 1, price: 15 },
            { id: 'item-5', name: 'Hand Sanitizer', quantity: 1, price: 45 }
          ],
          orderValue: 60,
          deliveryFee: 20,
          status: 'new' as const,
          distance: 1.8,
          deliveryDistance: 2.1,
          createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          updatedAt: new Date(Date.now() - 5 * 60 * 1000),
        }
      ];

      setState(prev => ({ 
        ...prev, 
        availableOrders: mockAvailableOrders,
        activeOrders: [],
        loading: false 
      }));
      return;
    }

    // Subscribe to available orders
    const unsubscribeAvailable = getAvailableOrders((orders) => {
      setState(prev => ({ 
        ...prev, 
        availableOrders: orders,
        loading: false 
      }));
    });

    // Subscribe to active orders for this partner
    const unsubscribeActive = getPartnerActiveOrders(partnerId, (orders) => {
      setState(prev => ({ 
        ...prev, 
        activeOrders: orders 
      }));
    });

    return () => {
      unsubscribeAvailable();
      unsubscribeActive();
    };
  }, [partnerId]);

  const acceptOrder = async (orderId: string, partnerId: string): Promise<void> => {
    try {
      await updateOrderStatus(orderId, "accepted", partnerId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to accept order",
      }));
      throw error;
    }
  };

  const declineOrder = async (orderId: string): Promise<void> => {
    try {
      // In a real app, you might want to track declined orders
      // For now, we'll just remove it from available orders locally
      setState(prev => ({
        ...prev,
        availableOrders: prev.availableOrders.filter(order => order.id !== orderId),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to decline order",
      }));
      throw error;
    }
  };

  const markAsPickedUp = async (orderId: string): Promise<void> => {
    try {
      await updateOrderStatus(orderId, "picked_up");
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to mark order as picked up",
      }));
      throw error;
    }
  };

  const markAsEnRoute = async (orderId: string): Promise<void> => {
    try {
      await updateOrderStatus(orderId, "en_route");
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to mark order as en route",
      }));
      throw error;
    }
  };

  const markAsDelivered = async (orderId: string, partnerId: string): Promise<void> => {
    try {
      await updateOrderStatus(orderId, "delivered");
      
      // Find the order to get delivery fee
      const order = state.activeOrders.find(o => o.id === orderId);
      if (order) {
        // Add earnings record
        await addEarnings({
          deliveryPartnerId: partnerId,
          orderId,
          amount: order.deliveryFee,
          date: new Date(),
          type: "delivery_fee",
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to mark order as delivered",
      }));
      throw error;
    }
  };

  const loadDeliveryHistory = async (partnerId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const history = await getDeliveryHistory(partnerId);
      setState(prev => ({
        ...prev,
        deliveryHistory: history,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load delivery history",
      }));
      throw error;
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    acceptOrder,
    declineOrder,
    markAsPickedUp,
    markAsEnRoute,
    markAsDelivered,
    loadDeliveryHistory,
    clearError,
  };
}
