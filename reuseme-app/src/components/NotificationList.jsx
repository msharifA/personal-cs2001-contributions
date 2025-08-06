import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Notification from './Notification';
import './NotificationList.css';
import { Link } from 'react-router-dom';

const NotificationList = ({ userId, limit }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/notifications/user/${userId}`);
        setNotifications(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/mark-read`);
      // Update the local state to reflect the change
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`/api/notifications/user/${userId}/mark-all-read`);
      // Update all notifications to be read
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  if (loading) {
    return <div className="notification-list-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notification-list-error">{error}</div>;
  }

  const displayNotifications = limit ? notifications.slice(0, limit) : notifications;

  if (displayNotifications.length === 0) {
    return <div className="notification-list-empty">You don't have any notifications.</div>;
  }

  return (
    <div className="notification-list">
      <div className="notification-list-header">
        <h3>Notifications</h3>
        {notifications.some(notification => !notification.read) && (
          <button 
            className="mark-all-read-button"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="notification-items">
        {displayNotifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
      {limit && notifications.length > limit && (
        <div className="notification-list-footer">
          <Link to="/notifications" className="view-all-link">
            View all notifications ({notifications.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationList; 