// src/components/BadgeDisplay.jsx
import React, { useState, useEffect } from 'react';
import Badge from './Badge';
import './BadgeDisplay.css';
import axios from 'axios';

const BadgeDisplay = ({ userId }) => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchBadges = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/badges/user/${userId}`);
                setBadges(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching badges:", err);
                setError("Failed to load badges. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        
        if (userId) {
            fetchBadges();
        }
    }, [userId]);
    
    // Group badges by category
    const badgesByCategory = badges.reduce((acc, badge) => {
        const category = badge.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(badge);
        return acc;
    }, {});
    
    if (loading) {
        return <div className="badge-display-loading">Loading badges...</div>;
    }
    
    if (error) {
        return <div className="badge-display-error">{error}</div>;
    }
    
    if (badges.length === 0) {
        return (
            <div className="badge-display badge-display-empty">
                <h2>Your Badges</h2>
                <p>You haven't earned any badges yet. Keep participating to earn badges!</p>
            </div>
        );
    }

    return (
        <div className="badge-display">
            <h2>Your Badges</h2>
            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
                <div key={category} className="badge-category-section">
                    <h3 className="badge-category-title">{category}</h3>
                    <div className="badge-list">
                        {categoryBadges.map(badge => (
                            <Badge key={badge.id} badge={badge} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BadgeDisplay;