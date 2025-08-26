import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/dashboard';
import { DashboardStats } from '../../types/dashboard';
import styles from './Dashboard.module.css';

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
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading dashboard...</div>
        <div className={styles.loadingSubtext}>Fetching your pantry statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorTitle}>
          ⚠️ Dashboard Error
        </div>
        <div className={styles.errorMessage}>
          {error}
        </div>
        
        <div className={styles.errorActions}>
          <button 
            onClick={handleRetry}
            className={styles.retryButton}
          >
            🔄 Try Again
          </button>
          
          {retryCount > 0 && (
            <div className={styles.retryCount}>
              Attempt {retryCount + 1} of 3
            </div>
          )}
        </div>
        
        {/* Fallback content when API fails */}
        <div className={styles.fallbackContent}>
          <h3 className={styles.fallbackTitle}>
            📊 Dashboard Overview
          </h3>
          <p className={styles.fallbackText}>
            While we&apos;re unable to load your current pantry statistics, here&apos;s what you can do:
          </p>
          <ul className={styles.fallbackList}>
            <li className={styles.fallbackListItem}>Check your internet connection</li>
            <li className={styles.fallbackListItem}>Try refreshing the page</li>
            <li className={styles.fallbackListItem}>Sign out and sign back in if the issue persists</li>
            <li className={styles.fallbackListItem}>Use the Pantry tab to manage your items directly</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.noData}>
        <div>No dashboard data available</div>
        <button 
          onClick={fetchDashboardStats}
          className={styles.refreshButton}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Pantry Dashboard</h1>
      
      {/* Overview Section */}
      <div className={styles.overviewGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Items</h3>
          <div className={`${styles.statValue} ${styles.primary}`}>
            {stats.overview.totalItems}
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Unique Items</h3>
          <div className={`${styles.statValue} ${styles.success}`}>
            {stats.overview.uniqueItems}
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Avg per Location</h3>
          <div className={`${styles.statValue} ${styles.warning}`}>
            {stats.overview.averageItemsPerLocation.toFixed(1)}
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Most Populated</h3>
          <div className={`${styles.statValue} ${styles.info}`}>
            {stats.overview.mostPopulatedLocation}
          </div>
        </div>
      </div>

      {/* Breakdowns Section */}
      <div className={styles.breakdownGrid}>
        {/* Location Breakdown */}
        <div className={styles.breakdownCard}>
          <h3 className={styles.breakdownTitle}>
            📍 Items by Location
          </h3>
          <div className={styles.breakdownList}>
            {Object.entries(stats.locationBreakdown).map(([location, count]) => (
              <div key={location} className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>{location}</span>
                <span className={styles.breakdownCount}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className={styles.breakdownCard}>
          <h3 className={styles.breakdownTitle}>
            🏷️ Items by Type
          </h3>
          <div className={styles.breakdownList}>
            {Object.entries(stats.typeBreakdown).map(([type, count]) => (
              <div key={type} className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>{type}</span>
                <span className={styles.breakdownCount}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Insights Section */}
      <div className={styles.insightsGrid}>
        {/* Expiry Alerts */}
        <div className={styles.alertCard}>
          <h3 className={styles.alertTitle}>
            ⏰ Expiry Alerts
          </h3>
          <div className={styles.alertList}>
            <div className={styles.alertItem}>
              <span className={`${styles.alertLabel} ${styles.urgent}`}>
                🚨 Urgent
              </span>
              <span className={`${styles.alertCount} ${styles.urgent}`}>
                {stats.expiryAlerts.urgent}
              </span>
            </div>
            <div className={styles.alertItem}>
              <span className={`${styles.alertLabel} ${styles.warning}`}>
                ⚠️ Warning
              </span>
              <span className={`${styles.alertCount} ${styles.warning}`}>
                {stats.expiryAlerts.warning}
              </span>
            </div>
            <div className={styles.alertItem}>
              <span className={`${styles.alertLabel} ${styles.notice}`}>
                ℹ️ Notice
              </span>
              <span className={`${styles.alertCount} ${styles.notice}`}>
                {stats.expiryAlerts.notice}
              </span>
            </div>
            <div className={styles.alertItem}>
              <span className={`${styles.alertLabel} ${styles.expired}`}>
                ❌ Expired
              </span>
              <span className={`${styles.alertCount} ${styles.expired}`}>
                {stats.expiryAlerts.expired}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Insights */}
        <div className={styles.alertCard}>
          <h3 className={styles.alertTitle}>
            📈 Inventory Insights
          </h3>
          <div className={styles.alertList}>
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>Low Stock Items</span>
              <span className={`${styles.insightCount} ${styles.lowStock}`}>
                {stats.inventoryInsights.lowStockItems}
              </span>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>High Stock Items</span>
              <span className={`${styles.insightCount} ${styles.highStock}`}>
                {stats.inventoryInsights.highStockItems}
              </span>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightLabel}>Most Common Type</span>
              <span className={`${styles.insightCount} ${styles.commonType}`}>
                {stats.inventoryInsights.mostCommonType}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
