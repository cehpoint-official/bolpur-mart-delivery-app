import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Navigation, MessageCircle, Package, CheckCircle } from "lucide-react";
import type { Order } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface OrderCardProps {
  order: Order;
  onAccept?: () => void;
  onDecline?: () => void;
  onMarkPickedUp?: () => void;
  onMarkEnRoute?: () => void;
  onMarkDelivered?: () => void;
  onCall?: () => void;
  onMessage?: () => void;
  onNavigate?: () => void;
}

const statusConfig = {
  new: {
    label: "NAYA",
    className: "bg-blue-500 hover:bg-blue-600",
  },
  accepted: {
    label: "PICKUP KARO",
    className: "bg-warning hover:bg-warning/90",
  },
  picked_up: {
    label: "RAASTE MEIN",
    className: "bg-purple-500 hover:bg-purple-600",
  },
  en_route: {
    label: "RAASTE MEIN",
    className: "bg-purple-500 hover:bg-purple-600",
  },
  delivered: {
    label: "HO GAYA",
    className: "bg-success hover:bg-success/90",
  },
  cancelled: {
    label: "CANCEL",
    className: "bg-destructive hover:bg-destructive/90",
  },
};



export function OrderCard({
  order,
  onAccept,
  onDecline,
  onMarkPickedUp,
  onMarkEnRoute,
  onMarkDelivered,
  onCall,
  onMessage,
  onNavigate,
}: OrderCardProps) {

  const status = statusConfig[order.status] ?? { label: "UNKNOWN", className: "bg-gray-500" };
  const timeAgo = getTimeAgo(order.createdAt);




  const totalValue =
    order.items?.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    ) ?? 0;

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/50 shadow-sm hover:shadow-md transition-all" data-testid={`card-order-${order.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-white text-xs font-semibold px-3 py-1 shadow-sm", status.className)}>
              {status.label}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground" data-testid={`text-order-id-${order.id}`}>
              #{order.id.slice(-8)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium" data-testid={`text-time-${order.id}`}>
            {timeAgo}
          </span>
        </div>

        <div className="space-y-4">
          {/* Store Information */}
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border-l-4 border-red-500">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 bg-red-500 dark:bg-red-400 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge className="bg-red-500 dark:bg-red-600 hover:bg-red-600 text-white text-[10px] px-2 py-0">LENE JAYO</Badge>
                <p className="font-bold text-sm text-foreground" data-testid={`text-store-name-${order.id}`}>
                  {order.storeName}
                </p>
              </div>
              <p className="text-xs text-foreground/80 dark:text-foreground/70 line-clamp-1" data-testid={`text-store-address-${order.id}`}>
                {order.storeAddress}
              </p>
            </div>
            <Badge
              variant="outline"
              className="flex-shrink-0 font-semibold border-foreground/20 text-foreground"
            >
              {order.distance != null ? order.distance.toFixed(1) : "0.0"} km
            </Badge>


          </div>

          {/* Customer Information */}
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border-l-4 border-green-600">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 bg-green-600 dark:bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge className="bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white text-[10px] px-2 py-0">DENE JAYO</Badge>
                <p className="font-bold text-sm text-foreground" data-testid={`text-customer-name-${order.id}`}>
                  {order.customerName}
                </p>
              </div>
              <p className="text-xs text-foreground/80 dark:text-foreground/70 line-clamp-1" data-testid={`text-customer-address-${order.id}`}>
                {order.customerAddress}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="outline"
                className="font-semibold border-foreground/20 text-foreground"
              >
                {order.deliveryDistance != null ? order.deliveryDistance.toFixed(1) : "0.0"} km
              </Badge>
              {onNavigate && (
                <Button
                  size="sm"
                  className="h-9 w-9 p-0 bg-primary hover:bg-primary/90 rounded-full shadow-sm"
                  onClick={onNavigate}
                  data-testid={`button-navigate-${order.id}`}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Value and Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex gap-6">
            {order?.paymentMethod == "cash_on_delivery" && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Order Ki Value</p>
                <p className="text-lg font-bold text-foreground" data-testid={`text-order-value-${order.id}`}>
                  ₹{totalValue}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1">Aapko Milega</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-500" data-testid={`text-delivery-fee-${order.id}`}>
                ₹{order.deliveryFee}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {/* Actions based on order status */}
            {order.status === "confirmed" && (
              <>
                {onDecline && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDecline}
                    data-testid={`button-decline-${order.id}`}
                  >
                    Nahi
                  </Button>
                )}
                {onAccept && (
                  <Button
                    size="sm"
                    onClick={
                      onAccept
                    }
                    data-testid={`button-accept-${order.id}`}
                  >
                    Haan, Lelo
                  </Button>
                )}
              </>
            )}

            {order.status === "accepted" && (
              <>
                {onMarkPickedUp && (
                  <Button
                    className="bg-warning text-white hover:bg-warning/90"
                    size="sm"
                    onClick={onMarkPickedUp}
                    data-testid={`button-pickup-${order.id}`}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Pickup Kiya
                  </Button>
                )}
                {onCall && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCall}
                    data-testid={`button-call-store-${order.id}`}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}

            {(order.status === "picked_up" || order.status === "en_route") && (
              <>
                {onMarkDelivered && (
                  <Button
                    className="bg-success text-white hover:bg-success/90"
                    size="sm"
                    onClick={onMarkDelivered}
                    data-testid={`button-delivered-${order.id}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Deliver Kiya
                  </Button>
                )}
                {onCall && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCall}
                    data-testid={`button-call-customer-${order.id}`}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
                {onMessage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onMessage}
                    data-testid={`button-message-${order.id}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const diffMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffInMinutes < 1) return "Abhi-Abhi";
  if (diffInMinutes < 60) return `${diffInMinutes} min pehle`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ghante pehle`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} din pehle`;
}