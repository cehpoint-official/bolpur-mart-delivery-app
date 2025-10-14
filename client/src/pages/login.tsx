import { useState } from "react";

export default function Login() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check secret code
    if (code === "DELIVERY2025") {
      // Store login status and redirect
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('employeeCode', code);
      window.location.reload();
    } else {
      setError("Invalid employee code. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #FF6B35, #FF8C42)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        padding: '32px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
          <div style={{
            background: '#FF6B35',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px'
          }}>
            🚚
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px', color: '#1F2937' }}>
            Bolpur Mart
          </h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '16px' }}>Delivery Partner Portal</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#374151'
            }}>
              Employee Secret Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter your employee code"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box' as const,
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF6B35'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code}
            style={{
              width: '100%',
              padding: '14px',
              background: loading || !code ? '#9CA3AF' : '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !code ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing In...
              </>
            ) : (
              '🔑 Login'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div style={{
          textAlign: 'center' as const,
          marginTop: '24px',
          padding: '16px',
          background: '#F3F4F6',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 8px' }}>
            Need your employee code?
          </p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
            Contact your supervisor or HR department
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}