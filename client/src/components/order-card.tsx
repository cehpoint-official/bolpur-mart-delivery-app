import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Navigation, MessageCircle, Package, CheckCircle } from "lucide-react";
import type { Order } from "@shared/schema";
import { cn } from "@/lib/utils";

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
    label: "NEW",
    className: "bg-blue-500 hover:bg-blue-600",
  },
  accepted: {
    label: "PICKUP",
    className: "bg-warning hover:bg-warning/90",
  },
  picked_up: {
    label: "EN ROUTE",
    className: "bg-purple-500 hover:bg-purple-600",
  },
  en_route: {
    label: "EN ROUTE",
    className: "bg-purple-500 hover:bg-purple-600",
  },
  delivered: {
    label: "DELIVERED",
    className: "bg-success hover:bg-success/90",
  },
  cancelled: {
    label: "CANCELLED",
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
  const status = statusConfig[order.status];
  const timeAgo = getTimeAgo(order.createdAt);

  return (
    <Card className="overflow-hidden" data-testid={`card-order-${order.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-white text-xs font-medium", status.className)}>
              {status.label}
            </Badge>
            <span className="text-sm font-medium text-card-foreground" data-testid={`text-order-id-${order.id}`}>
              #{order.id.slice(-8)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground" data-testid={`text-time-${order.id}`}>
            {timeAgo}
          </span>
        </div>

        <div className="space-y-3">
          {/* Store Information */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-destructive bg-opacity-10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-card-foreground" data-testid={`text-store-name-${order.id}`}>
                {order.storeName}
              </p>
              <p className="text-sm text-muted-foreground" data-testid={`text-store-address-${order.id}`}>
                {order.storeAddress}
              </p>
            </div>
            <span className="text-sm font-medium text-card-foreground">
              {order.distance.toFixed(1)} km
            </span>
          </div>

          {/* Customer Information */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-success bg-opacity-10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-success rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-card-foreground" data-testid={`text-customer-name-${order.id}`}>
                {order.customerName}
              </p>
              <p className="text-sm text-muted-foreground" data-testid={`text-customer-address-${order.id}`}>
                {order.customerAddress}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-card-foreground">
                {order.deliveryDistance.toFixed(1)} km
              </span>
              {onNavigate && (
                <Button
                  size="sm"
                  className="p-2 bg-primary text-primary-foreground rounded-full ml-2"
                  onClick={onNavigate}
                  data-testid={`button-navigate-${order.id}`}
                >
                  <Navigation className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Value and Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex space-x-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Value</p>
              <p className="font-semibold text-card-foreground" data-testid={`text-order-value-${order.id}`}>
                ₹{order.orderValue}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Fee</p>
              <p className="font-semibold text-success" data-testid={`text-delivery-fee-${order.id}`}>
                ₹{order.deliveryFee}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {/* Actions based on order status */}
            {order.status === "new" && (
              <>
                {onDecline && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDecline}
                    data-testid={`button-decline-${order.id}`}
                  >
                    Decline
                  </Button>
                )}
                {onAccept && (
                  <Button
                    size="sm"
                    onClick={onAccept}
                    data-testid={`button-accept-${order.id}`}
                  >
                    Accept
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
                    Mark as Picked Up
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
                    Mark as Delivered
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

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}
