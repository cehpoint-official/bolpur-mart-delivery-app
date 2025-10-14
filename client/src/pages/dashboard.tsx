export default function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('employeeCode');
    window.location.reload();
  };

  const demoUser = {
    id: 'emp-001',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh.kumar@bolpurmart.delivery',
    status: 'online',
    vehicleType: 'Bike',
    vehicleNumber: 'DL01AB1234',
    rating: 4.5,
    totalDeliveries: 142
  };

  const mockOrders = [
    {
      id: 'order-001',
      customerName: 'Rahul Sharma',
      customerPhone: '+91 9876543210',
      customerAddress: 'House 123, Sector 15, Noida, UP 201301',
      storeName: 'Fresh Mart Grocery',
      storeAddress: 'Shop 45, Central Market, Noida, UP 201301',
      orderValue: 170,
      deliveryFee: 25,
      status: 'new',
      distance: 2.5,
      deliveryDistance: 3.2,
      items: ['Milk 1L x2', 'Bread x1', 'Eggs (12) x1']
    },
    {
      id: 'order-002',
      customerName: 'Priya Singh',
      customerPhone: '+91 9876543211',
      customerAddress: 'Flat 402, Royal Heights, Sector 22, Noida, UP 201301',
      storeName: 'Quick Pharmacy',
      storeAddress: 'Shop 12, Health Plaza, Noida, UP 201301',
      orderValue: 60,
      deliveryFee: 20,
      status: 'new',
      distance: 1.8,
      deliveryDistance: 2.1,
      items: ['Paracetamol x1', 'Hand Sanitizer x1']
    }
  ];

  const acceptOrder = (orderId: string) => {
    alert(`Order ${orderId} accepted! In a real app, this would update the order status.`);
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const navigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '80px', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#FF6B35',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            {demoUser.name?.split(' ').map((n: string) => n[0]).join('') || 'DP'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {demoUser.name || 'Demo Partner'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px', color: '#666' }}>Online</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#666' }}>Today's Earnings</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>₹0</p>
            </div>
            <div style={{ fontSize: '24px' }}>💰</div>
          </div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#666' }}>Deliveries</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>0</p>
            </div>
            <div style={{ fontSize: '24px' }}>🚚</div>
          </div>
        </div>
      </div>

      {/* Available Orders */}
      <div>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>
          Available Orders ({mockOrders.length})
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mockOrders.map((order) => (
            <div key={order.id} style={{
              background: 'white',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: '#3B82F6',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    NEW
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    #{order.id.slice(-3)}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#666' }}>10 min ago</span>
              </div>

              {/* Store Info */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }}></div>
                  <span style={{ fontWeight: '500' }}>{order.storeName}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>{order.distance} km</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#666', paddingLeft: '16px' }}>
                  {order.storeAddress}
                </p>
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
                  <span style={{ fontWeight: '500' }}>{order.customerName}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>{order.deliveryDistance} km</span>
                  <button
                    onClick={() => navigate(order.customerAddress)}
                    style={{
                      background: '#FF6B35',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: 'auto'
                    }}
                  >
                    📍 Navigate
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#666', paddingLeft: '16px' }}>
                  {order.customerAddress}
                </p>
              </div>

              {/* Order Details */}
              <div style={{ 
                background: '#F9FAFB', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '16px' 
              }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>Items:</p>
                <p style={{ margin: 0, fontSize: '14px' }}>{order.items.join(', ')}</p>
              </div>

              {/* Order Value and Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>Order Value</p>
                    <p style={{ margin: 0, fontWeight: '600' }}>₹{order.orderValue}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>Delivery Fee</p>
                    <p style={{ margin: 0, fontWeight: '600', color: '#10B981' }}>₹{order.deliveryFee}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => callCustomer(order.customerPhone)}
                    style={{
                      padding: '8px 12px',
                      background: '#6B7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📞 Call
                  </button>
                  <button
                    onClick={() => acceptOrder(order.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Accept Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}