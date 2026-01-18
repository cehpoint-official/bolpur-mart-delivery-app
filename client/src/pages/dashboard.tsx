import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { OrderCard } from "@/components/order-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, IndianRupee, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { deliveryPartner } = useAuth();
  const { toast } = useToast();

  const {
    availableOrders,
    activeOrders,
    loading,
    error,
    acceptOrder,
    declineOrder,
    markAsPickedUp,
    markAsDelivered,
  } = useOrders(deliveryPartner?.id);

  const [notifications, setNotifications] = useState<
    { id: string; text: string; time: string; order?: any }[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (availableOrders.length === 0) return;

    setNotifications((prev) => {


      const confirmedOrders = availableOrders.filter(
        (order) => order.status === "confirmed"
      );


      const newOrders = confirmedOrders.filter(
        (order) => !prev.some((n) => n.order?.id === order.id)
      );


      if (newOrders.length === 0) return prev;

      newOrders.forEach((order) => {
        const totalPrice =
          order.items.reduce((s, i) => s + i.price * i.quantity, 0) +
          order.deliveryFee;

        toast({
          title: "🔥 Order Confirmed!",
          description: `${order.customerAddress} - ₹${totalPrice}`,
        });
      });

      setUnreadCount((u) => u + newOrders.length);

      return [
        ...newOrders.map((order) => ({
          id: Date.now().toString() + order.id,
          text: `Order Confirmed: ${order.items.map((i) => i.name).join(", ")}`,
          time: new Date().toLocaleTimeString(),
          order,
        })),
        ...prev,
      ];
    });
  }, [availableOrders]);




  const handleAcceptOrder = async (orderId: string) => {
    if (!deliveryPartner) return;

    try {
      await acceptOrder(orderId, deliveryPartner.id);
      toast({
        title: "Order Le Liya! ✅",
        description: "Ab shop se order pickup karo",
      });
    } catch (error) {
      toast({
        title: "Order Nahi Mila ❌",
        description: "Phir se try karo",
        variant: "destructive",
      });
    }
  };

  const handleDeclineOrder = async (orderId: string) => {
    try {
      await declineOrder(orderId);
      toast({
        title: "Order Chhod Diya",
        description: "Order list se hata diya gaya",
      });
    } catch (error) {
      toast({
        title: "Kuch Gadbad Hui",
        description: "Phir se try karo",
        variant: "destructive",
      });
    }
  };

  const handleMarkPickedUp = async (orderId: string) => {
    try {
      await markAsPickedUp(orderId);
      toast({
        title: "Pickup Ho Gaya! 📦",
        description: "Ab customer ko deliver karo",
      });
    } catch (error) {
      toast({
        title: "Status Update Nahi Hua",
        description: "Phir se try karo",
        variant: "destructive",
      });
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    if (!deliveryPartner) return;

    try {
      await markAsDelivered(orderId, deliveryPartner.id);
      toast({
        title: "Deliver Ho Gaya! 🎉",
        description: "Bahut badhiya! Paisa aapke account mein add ho gaya",
      });
    } catch (error) {
      toast({
        title: "Delivered Mark Nahi Hua",
        description: "Phir se try karo",
        variant: "destructive",
      });
    }
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const navigateToAddress = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  if (!deliveryPartner) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Aapka data load nahi ho raha. Support se contact karo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!deliveryPartner.adminApproved) {
    return (
      <div className="p-4">
        <Alert>
          <AlertDescription>
            Aapka account abhi pending hai. Admin approve karne ke baad order milega.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-24 animate-fade-in">
      {/* Partner Header */}
      <Card className="bg-gradient-to-br from-primary via-orange-600 to-orange-700 text-white border-0 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12" />

        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <p className="text-sm opacity-90">Namaste,</p>
              <h2 className="text-2xl font-bold tracking-tight">
                {deliveryPartner.name.split(' ')[0]}!
              </h2>
              <Badge variant="secondary" className="mt-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                {deliveryPartner.status === 'online' ? 'ACTIVE HAI' : 'OFF HAI'}
              </Badge>
            </div>
            <div className="text-right bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span className="text-2xl font-bold">{deliveryPartner.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs opacity-90">{deliveryPartner.totalDeliveries} Delivery</p>
            </div>
          </div>



          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <p className="text-xs opacity-90 font-medium">Aaj Kamaya</p>
              </div>
              <p className="text-3xl font-bold tracking-tight">₹0</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <p className="text-xs opacity-90 font-medium">Chal Raha</p>
              </div>
              <p className="text-3xl font-bold tracking-tight">{activeOrders.length}</p>
            </div>
          </div>

          {/* NOTIFICATION WRAPPER */}
          <div className="absolute top-11 right-32 z-50 ">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((prev) => !prev);
                  setUnreadCount(0);
                }}
                className="p-2 bg-white/20 rounded-full backdrop-blur-md hover:bg-white/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* NOTIFICATION DROPDOWN */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-64 max-h-64 overflow-y-auto 
        bg-white text-black rounded-xl shadow-xl border p-2 animate-fade-in z-[9999]"
              >
                <p className="font-bold text-sm mb-2 border-b pb-1">Notifications</p>

                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.order.id} className="p-2 border-b last:border-none">
                      <p className="text-sm font-semibold">{n.order.id}</p>

                      {n.order && (
                        <div className="text-xs text-gray-600 mt-1">
                          <p>📍 {n.order.customerAddress}</p>
                          <p>💰 ₹{n.order.orderValue}</p>
                          {/* <p>
                            🛍{" "}
                            {n.order.items
                              ?.map((i: any) => `${i.name} x${i.quantity}`)
                              .join(", ")}
                          </p> */}
                        </div>
                      )}

                      <p className="text-[10px] text-gray-500 mt-1">{n.time}</p>

                    </div>
                  ))
                )}
              </div>
            )}
          </div>


        </CardContent>


      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">🚚 Abhi Deliver Karo</h3>
            <Badge className="bg-orange-500">{activeOrders.length}</Badge>
          </div>
          {activeOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onMarkPickedUp={() => handleMarkPickedUp(order.id)}
              onMarkDelivered={() => handleMarkDelivered(order.id)}
              onCall={() => callCustomer(order.customerPhone)}
              onNavigate={() => navigateToAddress(order.customerAddress)}
            />
          ))}
        </div>
      )}

      {/* Available Orders */}
      <div className="space-y-3 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">📦 Naye Orders</h3>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
            )}
            <Badge variant="outline">{availableOrders.length}</Badge>
          </div>
        </div>

        {availableOrders.length === 0 && !loading ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Koi Order Nahi Hai</p>
              <p className="text-sm text-muted-foreground mt-1">Naya order aane par yahan dikhega</p>
            </CardContent>
          </Card>
        ) : (
          availableOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={() => handleAcceptOrder(order.id)}
              onDecline={() => handleDeclineOrder(order.id)}
              onCall={() => callCustomer(order.customerPhone)}
              onNavigate={() => navigateToAddress(order.customerAddress)}
            />
          ))
        )}
      </div>
    </div>
  );
}
