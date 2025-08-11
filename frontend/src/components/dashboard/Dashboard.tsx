import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/dashboard';
import { DashboardStats } from '../../types/dashboard';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
      setError(errorMessage);
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchDashboardStats();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Loading dashboard...</div>
        <div style={{ color: '#6c757d' }}>Fetching your pantry statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          color: '#dc3545', 
          marginBottom: '15px', 
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          ⚠️ Dashboard Error
        </div>
        <div style={{ 
          color: '#6c757d', 
          marginBottom: '20px',
          maxWidth: '500px',
          margin: '0 auto 20px auto',
          lineHeight: '1.5'
        }}>
          {error}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={handleRetry}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginRight: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            🔄 Try Again
          </button>
          
          {retryCount > 0 && (
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#6c757d', 
              marginTop: '10px' 
            }}>
              Attempt {retryCount + 1} of 3
            </div>
          )}
        </div>
        
        {/* Fallback content when API fails */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>
            📊 Dashboard Overview
          </h3>
          <p style={{ 
            color: '#6c757d', 
            margin: '0 0 15px 0',
            lineHeight: '1.6'
          }}>
            While we&apos;re unable to load your current pantry statistics, here&apos;s what you can do:
          </p>
          <ul style={{ 
            color: '#6c757d', 
            lineHeight: '1.6',
            paddingLeft: '20px',
            margin: '0'
          }}>
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Sign out and sign back in if the issue persists</li>
            <li>Use the Pantry tab to manage your items directly</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#6c757d', marginBottom: '15px' }}>
          No dashboard data available
        </div>
        <button 
          onClick={fetchDashboardStats}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Pantry Dashboard</h1>
      
      {/* Overview Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Total Items</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
            {stats.overview.totalItems}
          </div>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Unique Items</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.overview.uniqueItems}
          </div>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Avg per Location</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
            {stats.overview.averageItemsPerLocation.toFixed(1)}
          </div>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Most Populated</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6f42c1' }}>
            {stats.overview.mostPopulatedLocation}
          </div>
        </div>
      </div>

      {/* Breakdowns Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {/* Location Breakdown */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#495057' }}>Items by Location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(stats.locationBreakdown).map(([location, count]) => (
              <div key={location} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f1f3f4'
              }}>
                <span style={{ fontWeight: '500' }}>{location}</span>
                <span style={{ 
                  backgroundColor: '#e9ecef', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Type Breakdown */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#495057' }}>Items by Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(stats.typeBreakdown).map(([type, count]) => (
              <div key={type} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f1f3f4'
              }}>
                <span style={{ fontWeight: '500' }}>{type}</span>
                <span style={{ 
                  backgroundColor: '#e9ecef', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Insights Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Expiry Alerts */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#495057' }}>Expiry Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ color: '#dc3545', fontWeight: '500' }}>Urgent</span>
              <span style={{ 
                backgroundColor: '#dc3545', 
                color: 'white',
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {stats.expiryAlerts.urgent}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ color: '#fd7e14', fontWeight: '500' }}>Warning</span>
              <span style={{ 
                backgroundColor: '#fd7e14', 
                color: 'white',
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {stats.expiryAlerts.warning}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ color: '#ffc107', fontWeight: '500' }}>Notice</span>
              <span style={{ 
                backgroundColor: '#ffc107', 
                color: 'white',
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {stats.expiryAlerts.notice}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ color: '#6c757d', fontWeight: '500' }}>Expired</span>
              <span style={{ 
                backgroundColor: '#6c757d', 
                color: 'white',
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {stats.expiryAlerts.expired}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Insights */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#495057' }}>Inventory Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ fontWeight: '500' }}>Low Stock Items</span>
              <span style={{ 
                backgroundColor: '#dc3545', 
                color: 'white',
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {stats.inventoryInsights.lowStockItems}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ fontWeight: '500' }}>High Stock Items</span>
              <span style={{ 
                backgroundColor: '#28a745', 
                color: 'white',
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {stats.inventoryInsights.highStockItems}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ fontWeight: '500' }}>Most Common Type</span>
              <span style={{ 
                backgroundColor: '#6f42c1', 
                color: 'white',
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {stats.inventoryInsights.mostCommonType}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
