import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Order, DeliveryPartner, Delivery, Earnings } from "@shared/schema";

// Collections
export const COLLECTIONS = {
  DELIVERY_PARTNERS: "deliveryPartners",
  ORDERS: "orders",
  DELIVERIES: "deliveries",
  EARNINGS: "earnings",
} as const;

// Delivery Partner operations
export const getDeliveryPartner = async (id: string): Promise<DeliveryPartner | null> => {
  const docRef = doc(db, COLLECTIONS.DELIVERY_PARTNERS, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as DeliveryPartner;
  }
  
  return null;
};

export const updateDeliveryPartnerStatus = async (
  partnerId: string,
  status: DeliveryPartner['status']
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.DELIVERY_PARTNERS, partnerId);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// Order operations
export const getAvailableOrders = (
  callback: (orders: Order[]) => void
): (() => void) => {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("status", "==", "new"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        pickupTime: data.pickupTime?.toDate(),
        deliveryTime: data.deliveryTime?.toDate(),
        estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate(),
      } as Order;
    });
    callback(orders);
  });
};

export const getPartnerActiveOrders = (
  partnerId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("deliveryPartnerId", "==", partnerId),
    where("status", "in", ["accepted", "picked_up", "en_route"]),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        pickupTime: data.pickupTime?.toDate(),
        deliveryTime: data.deliveryTime?.toDate(),
        estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate(),
      } as Order;
    });
    callback(orders);
  });
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  partnerId?: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (partnerId && status === "accepted") {
    updateData.deliveryPartnerId = partnerId;
  }

  if (status === "picked_up") {
    updateData.pickupTime = serverTimestamp();
  }

  if (status === "delivered") {
    updateData.deliveryTime = serverTimestamp();
  }

  await updateDoc(docRef, updateData);
};

// Delivery history
export const getDeliveryHistory = async (
  partnerId: string,
  limitCount: number = 50
): Promise<Order[]> => {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("deliveryPartnerId", "==", partnerId),
    where("status", "==", "delivered"),
    orderBy("deliveryTime", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      pickupTime: data.pickupTime?.toDate(),
      deliveryTime: data.deliveryTime?.toDate(),
      estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate(),
    } as Order;
  });
};

// Earnings operations
export const getEarnings = async (
  partnerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Earnings[]> => {
  let q = query(
    collection(db, COLLECTIONS.EARNINGS),
    where("deliveryPartnerId", "==", partnerId),
    orderBy("date", "desc")
  );

  if (startDate) {
    q = query(q, where("date", ">=", Timestamp.fromDate(startDate)));
  }

  if (endDate) {
    q = query(q, where("date", "<=", Timestamp.fromDate(endDate)));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date: data.date?.toDate(),
    } as Earnings;
  });
};

export const addEarnings = async (earnings: Omit<Earnings, 'id'>): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.EARNINGS), {
    ...earnings,
    date: Timestamp.fromDate(earnings.date),
  });
};
