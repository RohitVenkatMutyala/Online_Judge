// src/components/CircularProgressChart.js

import React from 'react';

const CircularProgressChart = ({
    solved,
    total,
    easySolved,
    mediumSolved,
    hardSolved,
    totalEasy,
    totalMedium,
    totalHard,
    size = 180,       // Diameter of the chart
    strokeWidth = 16  // Thickness of the progress ring
}) => {
    // Basic calculations for the circle
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate the percentage of *solved* problems for each category
    // This determines the length of each colored arc
    const easyPercent = total > 0 ? (easySolved / total) * 100 : 0;
    const mediumPercent = total > 0 ? (mediumSolved / total) * 100 : 0;
    const hardPercent = total > 0 ? (hardSolved / total) * 100 : 0;

    // Calculate the length of the SVG stroke for each arc
    const easyStroke = (easyPercent / 100) * circumference;
    const mediumStroke = (mediumPercent / 100) * circumference;
    const hardStroke = (hardPercent / 100) * circumference;

    // Calculate the rotation needed to place each arc after the previous one
    const mediumRotation = (easyPercent / 100) * 360;
    const hardRotation = ((easyPercent + mediumPercent) / 100) * 360;
    
    // Colors matching the image provided
    const easyColor = "#00B8A9";
    const mediumColor = "#F9C80E";
    const hardColor = "#F86624";

    const StatItem = ({ label, color, value, totalValue }) => (
        <div className="stat-item mb-3">
            <span className="stat-label" style={{ color }}>{label}</span>
            <span className="stat-value">{value} / {totalValue}</span>
        </div>
    );

    return (
        <div className="progress-container card bg-dark text-white p-4">
            <div className="row align-items-center">
                {/* Left side: Circular Chart */}
                <div className="col-md-6 d-flex justify-content-center mb-4 mb-md-0">
                    <div style={{ position: 'relative', width: size, height: size }}>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                            {/* Background track */}
                            <circle cx={size / 2} cy={size / 2} r={radius} stroke="#343a40" strokeWidth={strokeWidth} fill="transparent" />
                            
                            {/* Easy Progress Arc */}
                            <circle cx={size / 2} cy={size / 2} r={radius} stroke={easyColor} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${easyStroke} ${circumference}`} strokeLinecap="round" />
                            
                            {/* Medium Progress Arc */}
                            <circle cx={size / 2} cy={size / 2} r={radius} stroke={mediumColor} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${mediumStroke} ${circumference}`} style={{ transform: `rotate(${mediumRotation}deg)`, transformOrigin: '50% 50%' }} strokeLinecap="round" />

                            {/* Hard Progress Arc */}
                            <circle cx={size / 2} cy={size / 2} r={radius} stroke={hardColor} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${hardStroke} ${circumference}`} style={{ transform: `rotate(${hardRotation}deg)`, transformOrigin: '50% 50%' }} strokeLinecap="round" />
                        </svg>
                        
                        {/* Central Text Display */}
                        <div className="center-text">
                            <span className="solved-count">{solved}</span>
                            <span className="total-count">/ {total}</span>
                            <span className="solved-label">✓ Solved</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Stats Breakdown */}
                <div className="col-md-6 d-flex justify-content-center">
                    <div className="d-flex flex-column align-items-center align-items-md-start">
                        <StatItem label="Easy" color={easyColor} value={easySolved} totalValue={totalEasy} />
                        <StatItem label="Medium" color={mediumColor} value={mediumSolved} totalValue={totalMedium} />
                        <StatItem label="Hard" color={hardColor} value={hardSolved} totalValue={totalHard} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircularProgressChart;