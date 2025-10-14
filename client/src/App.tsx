import { useState, useEffect, useCallback } from "react";

// Types for better TypeScript support
interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  storeName: string;
  storeAddress: string;
  orderValue: number;
  deliveryFee: number;
  status: 'new' | 'accepted' | 'picked' | 'delivered';
  distance: number;
  deliveryDistance: number;
  items: string[];
  timestamp: Date;
  urgency: 'normal' | 'urgent';
  estimatedTime: number;
}

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  todayEarnings: number;
  todayDeliveries: number;
  status: 'online' | 'offline' | 'busy';
  location?: { lat: number; lng: number };
}

// Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered successfully');
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('New version available! Update now?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.log('SW registration failed');
    }
  }
};

// Geolocation hook
const useGeolocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setError(null);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
};

// Notification hook
const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon-192x192.png',
        badge: '/favicon-192x192.png',
        vibrate: [200, 100, 200],
        ...options
      });
    }
  }, [permission]);

  return { permission, requestPermission, showNotification };
};

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'history' | 'profile'>('dashboard');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { location } = useGeolocation();
  const { requestPermission, showNotification } = useNotifications();

  // Mock data - in real app this would come from API/Firebase
  const [partner] = useState<DeliveryPartner>({
    id: 'dp-001',
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'rajesh.kumar@bolpurmart.com',
    vehicleType: 'Bike',
    vehicleNumber: 'DL01AB1234',
    rating: 4.8,
    totalDeliveries: 247,
    todayEarnings: 1847,
    todayDeliveries: 12,
    status: 'online',
    location
  });

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      customerName: 'Rahul Sharma',
      customerPhone: '+91 9876543210',
      customerAddress: 'House 123, Sector 15, Noida, UP 201301',
      storeName: 'Fresh Mart Grocery',
      storeAddress: 'Shop 45, Central Market, Noida, UP 201301',
      orderValue: 547,
      deliveryFee: 35,
      status: 'new',
      distance: 2.5,
      deliveryDistance: 3.2,
      items: ['Milk 1L x2', 'Bread Brown x1', 'Eggs (12) x1', 'Rice 5kg x1', 'Oil 1L x1'],
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      urgency: 'urgent',
      estimatedTime: 25
    },
    {
      id: 'ORD-002',
      customerName: 'Priya Singh',
      customerPhone: '+91 9876543211',
      customerAddress: 'Flat 402, Royal Heights, Sector 22, Noida, UP 201301',
      storeName: 'Quick Pharmacy',
      storeAddress: 'Shop 12, Health Plaza, Noida, UP 201301',
      orderValue: 289,
      deliveryFee: 25,
      status: 'new',
      distance: 1.8,
      deliveryDistance: 2.1,
      items: ['Paracetamol 650mg x1', 'Hand Sanitizer 500ml x1', 'Vitamin C x1'],
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      urgency: 'normal',
      estimatedTime: 18
    },
    {
      id: 'ORD-003',
      customerName: 'Amit Patel',
      customerPhone: '+91 9876543212',
      customerAddress: 'B-204, Green Valley, Sector 18, Noida, UP 201301',
      storeName: 'Electronics Hub',
      storeAddress: 'Shop 78, Tech Market, Noida, UP 201301',
      orderValue: 2499,
      deliveryFee: 50,
      status: 'new',
      distance: 3.1,
      deliveryDistance: 4.5,
      items: ['Wireless Earbuds x1', 'Phone Case x1', 'Charger Cable x2'],
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      urgency: 'normal',
      estimatedTime: 30
    }
  ]);

  // Initialize app
  useEffect(() => {
    registerServiceWorker();
    requestPermission();

    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [requestPermission]);

  // Simulate new orders coming in
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        showNotification('New Order Available!', {
          body: 'A new delivery order is waiting for you',
          tag: 'new-order'
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [showNotification]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCode.trim() === 'DELIVERY2025') {
      setIsLoggedIn(true);
      setLoginError('');
      showNotification('Welcome Back!', {
        body: 'You are now online and ready to accept orders'
      });
    } else {
      setLoginError('Invalid employee code. Use: DELIVERY2025');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginCode('');
    setLoginError('');
  };

  const acceptOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'accepted' } : order
    ));
    showNotification('Order Accepted!', {
      body: `Order ${orderId} has been accepted. Navigate to pickup location.`,
      tag: 'order-accepted'
    });
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const navigateToLocation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    if (location) {
      window.open(`https://www.google.com/maps/dir/${location.lat},${location.lng}/${encodedAddress}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '36px',
              boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)'
            }}>
              🚚
            </div>
            <h1 style={{ margin: '0 0 10px', color: '#2d3748', fontSize: '28px', fontWeight: '700' }}>
              Bolpur Mart
            </h1>
            <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>Delivery Partner Portal</p>
          </div>

          {!isOnline && (
            <div style={{
              background: '#fed7d7',
              border: '1px solid #feb2b2',
              color: '#c53030',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              ⚠️ You're offline. Some features may be limited.
            </div>
          )}

          {loginError && (
            <div style={{
              background: '#fed7d7',
              border: '1px solid #feb2b2',
              color: '#c53030',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#2d3748'
              }}>
                Employee Secret Code
              </label>
              <input
                type="text"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                placeholder="Enter your employee code"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.8)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FF6B35';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!loginCode.trim()}
              style={{
                width: '100%',
                padding: '14px',
                background: loginCode.trim() ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : '#a0aec0',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loginCode.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: loginCode.trim() ? '0 4px 15px rgba(255, 107, 53, 0.4)' : 'none',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (loginCode.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = loginCode.trim() ? '0 4px 15px rgba(255, 107, 53, 0.4)' : 'none';
              }}
            >
              🔑 LOGIN
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #e6fffa, #f0fff4)',
            borderRadius: '10px',
            border: '1px solid #9ae6b4'
          }}>
            <p style={{ fontSize: '14px', color: '#2f855a', margin: '0 0 8px', fontWeight: '600' }}>
              💡 Demo Access
            </p>
            <p style={{ fontSize: '13px', color: '#38a169', margin: 0 }}>
              Code: <strong>DELIVERY2025</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main App - Dashboard
  if (activeTab === 'dashboard') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        paddingBottom: '80px'
      }}>
        {/* Offline Banner */}
        {!isOnline && (
          <div style={{
            background: 'linear-gradient(135deg, #f56565, #e53e3e)',
            color: 'white',
            padding: '12px 20px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ⚠️ You're offline. Orders will sync when connection returns.
          </div>
        )}

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
          padding: '20px',
          color: 'white',
          boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <h1 style={{ margin: '0 0 5px', fontSize: '24px', fontWeight: '700' }}>
                Welcome back, {partner.name.split(' ')[0]}! 👋
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                You're {partner.status} • {location ? `📍 Location tracked` : '📍 Enable location'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                backdropFilter: 'blur(10px)'
              }}
            >
              Logout
            </button>
          </div>
          
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '15px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '5px' }}>💰</div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>₹{partner.todayEarnings}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Today's Earnings</div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '15px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '5px' }}>📦</div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{partner.todayDeliveries}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Deliveries</div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '15px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '5px' }}>⭐</div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{partner.rating}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Rating</div>
            </div>
          </div>
        </div>

        {/* Available Orders */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#2d3748' }}>
              Available Orders ({orders.filter(o => o.status === 'new').length})
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, #48bb78, #38a169)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              animation: 'pulse 2s infinite'
            }}>
              🟢 LIVE
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.filter(order => order.status === 'new').map((order) => (
              <div key={order.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Urgency indicator */}
                {order.urgency === 'urgent' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #f56565, #e53e3e)',
                    animation: 'urgentPulse 1s ease-in-out infinite alternate'
                  }} />
                )}

                {/* Order Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: order.urgency === 'urgent' ? 'linear-gradient(135deg, #f56565, #e53e3e)' : 'linear-gradient(135deg, #4299e1, #3182ce)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {order.urgency === 'urgent' ? '🚨 URGENT' : '📦 NEW'}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                      #{order.id.slice(-3)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{formatTime(order.timestamp)}</div>
                    <div style={{ fontSize: '12px', color: '#e53e3e', fontWeight: '600' }}>
                      ⏱️ {order.estimatedTime} min
                    </div>
                  </div>
                </div>

                {/* Store and Customer Info */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#e53e3e', borderRadius: '50%' }}></div>
                    <span style={{ fontWeight: '600', color: '#2d3748' }}>{order.storeName}</span>
                    <span style={{ fontSize: '12px', color: '#718096' }}>({order.distance} km)</span>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#718096', paddingLeft: '16px' }}>
                    {order.storeAddress}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#48bb78', borderRadius: '50%' }}></div>
                    <span style={{ fontWeight: '600', color: '#2d3748' }}>{order.customerName}</span>
                    <span style={{ fontSize: '12px', color: '#718096' }}>({order.deliveryDistance} km)</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#718096', paddingLeft: '16px' }}>
                    {order.customerAddress}
                  </p>
                </div>

                {/* Items */}
                <div style={{
                  background: '#f7fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#718096', fontWeight: '600' }}>
                    Items ({order.items.length}):
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>
                    {order.items.join(' • ')}
                  </p>
                </div>

                {/* Order Value and Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '2px' }}>
                      Order Value: <span style={{ fontWeight: '600', color: '#2d3748' }}>₹{order.orderValue}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#48bb78', fontWeight: '700' }}>
                      Delivery Fee: ₹{order.deliveryFee}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => callCustomer(order.customerPhone)}
                      style={{
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, #ed8936, #dd6b20)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      📞 Call
                    </button>
                    
                    <button
                      onClick={() => navigateToLocation(order.storeAddress)}
                      style={{
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, #805ad5, #6b46c1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      📍 Navigate
                    </button>
                    
                    <button
                      onClick={() => acceptOrder(order.id)}
                      style={{
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #48bb78, #38a169)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '700',
                        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.4)';
                      }}
                    >
                      ✅ Accept Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '8px'
        }}>
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { id: 'analytics', icon: '📊', label: 'Analytics' },
            { id: 'history', icon: '📜', label: 'History' },
            { id: 'profile', icon: '👤', label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 8px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#718096',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes urgentPulse {
            from { opacity: 0.8; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Analytics Tab
  if (activeTab === 'analytics') {
    const weeklyEarnings = [1200, 1450, 1680, 1320, 1750, 1840, 1650];
    const weeklyDeliveries = [8, 11, 13, 9, 14, 15, 12];
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        paddingBottom: '80px'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
          padding: '20px',
          color: 'white'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
            📊 Analytics & Insights
          </h1>
          <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Track your performance and earnings</p>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #48bb78, #38a169)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>💰</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>₹12,847</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>This Week</div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>↗️ +15% from last week</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #4299e1, #3182ce)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📦</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>82</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Deliveries</div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>↗️ +8% from last week</div>
            </div>
          </div>

          {/* Weekly Performance */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700' }}>Weekly Performance</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '600', color: '#48bb78' }}>Earnings Trend</p>
              <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '100px' }}>
                {weeklyEarnings.map((earning, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%',
                      height: `${(earning / Math.max(...weeklyEarnings)) * 80}px`,
                      background: 'linear-gradient(to top, #48bb78, #68d391)',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '8px'
                    }}></div>
                    <span style={{ fontSize: '10px', color: '#718096' }}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '600', color: '#4299e1' }}>Delivery Count</p>
              <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '60px' }}>
                {weeklyDeliveries.map((count, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%',
                      height: `${(count / Math.max(...weeklyDeliveries)) * 50}px`,
                      background: 'linear-gradient(to top, #4299e1, #63b3ed)',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '8px'
                    }}></div>
                    <span style={{ fontSize: '10px', color: '#718096' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700' }}>Performance Metrics</h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#4a5568' }}>Average Delivery Time</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#48bb78' }}>22 min</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#4a5568' }}>Customer Rating</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#ed8936' }}>⭐ 4.8/5</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#4a5568' }}>Acceptance Rate</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#4299e1' }}>94%</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#4a5568' }}>On-time Delivery</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#805ad5' }}>97%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr'
        }}>
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { id: 'analytics', icon: '📊', label: 'Analytics' },
            { id: 'history', icon: '📜', label: 'History' },
            { id: 'profile', icon: '👤', label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 8px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#718096',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // History Tab
  if (activeTab === 'history') {
    const completedOrders = [
      { id: 'ORD-045', customer: 'Sneha Patel', amount: 45, time: '2 hours ago', rating: 5 },
      { id: 'ORD-044', customer: 'Vikram Singh', amount: 35, time: '3 hours ago', rating: 4 },
      { id: 'ORD-043', customer: 'Meera Sharma', amount: 55, time: '4 hours ago', rating: 5 },
      { id: 'ORD-042', customer: 'Arjun Gupta', amount: 40, time: '5 hours ago', rating: 5 },
      { id: 'ORD-041', customer: 'Divya Agarwal', amount: 30, time: '6 hours ago', rating: 4 }
    ];

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        paddingBottom: '80px'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
          padding: '20px',
          color: 'white'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
            📜 Delivery History
          </h1>
          <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Your completed deliveries</p>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedOrders.map((order) => (
              <div key={order.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #48bb78, #38a169)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      ✅ DELIVERED
                    </span>
                    <span style={{ fontWeight: '600', color: '#2d3748' }}>#{order.id.slice(-3)}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#718096' }}>{order.time}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                      {order.customer}
                    </div>
                    <div style={{ fontSize: '14px', color: '#48bb78', fontWeight: '700' }}>
                      Earned: ₹{order.amount}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ed8936', fontWeight: '600' }}>
                      {'⭐'.repeat(order.rating)} {order.rating}/5
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr'
        }}>
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { id: 'analytics', icon: '📊', label: 'Analytics' },
            { id: 'history', icon: '📜', label: 'History' },
            { id: 'profile', icon: '👤', label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 8px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#718096',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Profile Tab
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
        padding: '20px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
          👤 Profile & Settings
        </h1>
        <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Manage your account and preferences</p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {partner.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#2d3748' }}>
            {partner.name}
          </h2>
          <p style={{ margin: '0 0 16px', color: '#718096' }}>Delivery Partner</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#ed8936' }}>⭐ {partner.rating}</div>
              <div style={{ fontSize: '12px', color: '#718096' }}>Rating</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#4299e1' }}>{partner.totalDeliveries}</div>
              <div style={{ fontSize: '12px', color: '#718096' }}>Total Deliveries</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '12px',
                color: 'white',
                background: 'linear-gradient(135deg, #48bb78, #38a169)',
                padding: '4px 8px',
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                🟢 ONLINE
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>Account Details</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
              <span style={{ fontWeight: '600', color: '#4a5568' }}>📞 Phone:</span>
              <span style={{ color: '#2d3748' }}>{partner.phone}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
              <span style={{ fontWeight: '600', color: '#4a5568' }}>📧 Email:</span>
              <span style={{ color: '#2d3748' }}>{partner.email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
              <span style={{ fontWeight: '600', color: '#4a5568' }}>🏍️ Vehicle:</span>
              <span style={{ color: '#2d3748' }}>{partner.vehicleType} - {partner.vehicleNumber}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
              <span style={{ fontWeight: '600', color: '#4a5568' }}>📍 Location:</span>
              <span style={{ color: location ? '#48bb78' : '#e53e3e' }}>
                {location ? '✅ Enabled' : '❌ Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>Settings</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={{
              padding: '16px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              🔔 Notification Preferences
            </button>
            
            <button style={{
              padding: '16px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              🎯 Delivery Preferences
            </button>
            
            <button style={{
              padding: '16px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              💰 Payment & Banking
            </button>
            
            <button style={{
              padding: '16px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ❓ Help & Support
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #f56565, #e53e3e)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '8px'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 0',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr'
      }}>
        {[
          { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
          { id: 'analytics', icon: '📊', label: 'Analytics' },
          { id: 'history', icon: '📜', label: 'History' },
          { id: 'profile', icon: '👤', label: 'Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 8px',
              border: 'none',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#718096',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}