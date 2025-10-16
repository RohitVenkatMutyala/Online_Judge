// src/components/BadgeComponent.js

import React from 'react';

const BadgeComponent = ({
    badge,             // The badge object from badgeConfig
    currentProgress,   // The user's current progress relevant to this badge's type
    isAwarded          // Boolean: whether the badge has been earned
}) => {
    const { name, threshold, icon, color, description, tooltip } = badge;

    // Calculate progress percentage
    const progressPercent = Math.min((currentProgress / threshold) * 100, 100);
    const progressText = `${currentProgress}/${threshold}`;

    // Determine badge state
    let stateColor = '#6c757d'; // Muted gray for locked/no progress
    let textColor = '#aaa';
    let progressBg = '#4a4a4a';

    if (isAwarded) {
        stateColor = color; // Use badge's main color for awarded
        textColor = '#fff';
        progressBg = '#606060'; // Darker background for progress bar
    } else if (currentProgress > 0) {
        stateColor = '#F9C80E'; // Yellow/orange for in-progress
        textColor = '#fff';
        progressBg = '#606060';
    }

    // --- Custom SVG Icons (you can expand these or use an icon library) ---
    const getSvgIcon = (iconName, iconColor) => {
        const iconSize = 24;
        switch (iconName) {
            case 'star': return (
                <path d="M12 1.5l2.4 7.3h7.7l-6.2 4.5 2.4 7.3-6.3-4.5-6.3 4.5 2.4-7.3-6.2-4.5h7.7z" fill={iconColor} stroke="none" />
            );
            case 'lightning': return (
                <path d="M10 2l-6 10h5l-1 8 6-10h-5l1-8z" fill={iconColor} stroke="none" />
            );
            case 'diamond': return (
                <path d="M12 1l-8 7 8 15 8-15z" fill={iconColor} stroke="none" />
            );
            case 'leaf': return (
                <path d="M17 2.5c-2.4-1.2-5.4-0.6-7.5 1.5-3.3 3.3-3.3 8.7 0 12l6.5 6.5c0.8 0.8 2 0.8 2.8 0l2.8-2.8c0.8-0.8 0.8-2 0-2.8l-6.5-6.5c-1.5-1.5-1.9-3.6-1.3-5.5 0.6-2 2.3-3.4 4.3-3.6 2-0.2 3.8 0.4 5 1.7L22.5 5.5z" fill={iconColor} stroke="none"/>
            );
            case 'flask': return (
                <path d="M16 0h-8l-2 16h12zM10 16v6h4v-6h-4zM8 22h8v2h-8z" fill={iconColor} stroke="none"/>
            );
            case 'sword': return (
                <path d="M12 2l-2 2h-6l-2 2v2l2 2h6l2 2v6h2v-6l2-2h6l2-2v-2l-2-2h-6l-2-2z" fill={iconColor} stroke="none"/>
            );
            default: return (
                <circle cx="12" cy="12" r="10" fill={iconColor} stroke="none" />
            );
        }
    };

    return (
        <div className="badge-wrapper" data-bs-toggle="tooltip" title={tooltip}>
            <div className="badge-card-custom" style={{ borderColor: stateColor }}>
                <div className="badge-icon-container" style={{ backgroundColor: isAwarded ? stateColor : (currentProgress > 0 ? '#5a5a5a' : '#3a3a3a') }}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        {getSvgIcon(icon, isAwarded ? '#fff' : textColor)}
                    </svg>
                </div>
                <div className="badge-info">
                    <p className="badge-name" style={{ color: textColor }}>{name}</p>
                    <div className="badge-progress-bar-bg" style={{ backgroundColor: progressBg }}>
                        <div className="badge-progress-bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: stateColor }}></div>
                        <span className="badge-progress-text" style={{ color: textColor }}>
                            {isAwarded ? 'AWARDED' : (currentProgress > 0 ? progressText : 'LOCKED')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeComponent;