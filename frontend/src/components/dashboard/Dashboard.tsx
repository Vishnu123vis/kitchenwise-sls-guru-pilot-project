import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/dashboard';
import { DashboardStats } from '../../types/dashboard';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
      setError(errorMessage);
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
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
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>No dashboard data available</div>
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
