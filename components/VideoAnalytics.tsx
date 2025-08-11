import React from 'react';
import ComingSoon from './ComingSoon';
import LineChartIcon from './icons/LineChartIcon';

const VideoAnalytics: React.FC = () => {
    return (
        <ComingSoon
            title="Course Analytics"
            message="We're collecting data on lesson views and quiz performance. A full analytics dashboard is coming soon!"
            icon={LineChartIcon}
        />
    );
};

export default VideoAnalytics;
