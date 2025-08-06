import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import './Notification.css'; // Create a CSS file for styling

const NotificationIcon = ({ type }) => {
  let iconClass = 'notification-icon ';
  
  switch(type) {
    case 'BADGE':
      iconClass += 'notification-badge';
      break;
    case 'MESSAGE':
      iconClass += 'notification-message';
      break;
    case 'ITEM':
      iconClass += 'notification-item';
      break;
    default:
      iconClass += 'notification-default';
  }
  
  return <div className={iconClass}></div>;
};

const Notification = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };
  
  const timeAgo = notification.createdAt 
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : '';
  
  const notificationClass = `notification ${notification.read ? 'notification-read' : 'notification-unread'}`;
  
  const notificationContent = (
    <>
      <NotificationIcon type={notification.type} />
      <div className="notification-content">
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">{timeAgo}</div>
      </div>
      {!notification.read && <div className="notification-unread-indicator"></div>}
    </>
  );
  
  if (notification.actionUrl) {
    return (
      <Link 
        to={notification.actionUrl} 
        className={notificationClass} 
        onClick={handleClick}
      >
        {notificationContent}
      </Link>
    );
  }
  
  return (
    <div className={notificationClass} onClick={handleClick}>
      {notificationContent}
    </div>
  );
};

export default Notification;