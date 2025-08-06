// src/components/Badge.jsx
import React from 'react';
import './Badge.css'; // Create a CSS file for styling

const Badge = ({ badge }) => {
    return (
        <div className="badge">
            <div className="badge-icon">
                {badge.imageUrl ? (
                    <img src={badge.imageUrl} alt={`${badge.name} badge`} />
                ) : (
                    <div className="badge-placeholder-icon">{badge.name.charAt(0)}</div>
                )}
            </div>
            <div className="badge-content">
                <h3 className="badge-title">{badge.name}</h3>
                <p className="badge-description">{badge.description}</p>
                {badge.category && <span className="badge-category">{badge.category}</span>}
            </div>
        </div>
    );
};

export default Badge;