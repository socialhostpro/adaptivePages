import React from 'react';
import EdgeFunctionTester from './EdgeFunctionTester';

const DeveloperTools: React.FC = () => {
    // This can be expanded with tabs if more tools are added
    return (
        <div className="h-full">
            <EdgeFunctionTester />
        </div>
    );
};

export default DeveloperTools;
