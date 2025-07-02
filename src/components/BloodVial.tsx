import React from 'react';

interface BloodVialProps {
    bloodGroup: string;
    componentType: string;
    quantity: number;
    maxCapacity?: number;
    size?: 'small' | 'medium' | 'large';
    isExpiring?: boolean;
    isExpired?: boolean;
}

const BloodVial: React.FC<BloodVialProps> = ({
    bloodGroup,
    componentType,
    quantity,
    maxCapacity = 100,
    size = 'medium',
    isExpiring = false,
    isExpired = false,
}) => {
    // Calculate fill percentage
    const fillPercentage = Math.min(Math.max((quantity / maxCapacity) * 100, 0), 100);

    // Determine blood color based on blood group and component type
    const getBloodColor = () => {
        if (componentType.toLowerCase().includes('plasma')) {
            return 'bg-yellow-400';
        } else if (componentType.toLowerCase().includes('platelet')) {
            return 'bg-yellow-200';
        } else {
            return 'bg-red-600'; // Whole blood or red cells
        }
    };

    // Determine vial size
    const getVialSize = () => {
        switch (size) {
            case 'small':
                return {
                    height: 'h-20',
                    width: 'w-10',
                    fontSize: 'text-xs',
                };
            case 'large':
                return {
                    height: 'h-40',
                    width: 'w-20',
                    fontSize: 'text-base',
                };
            default: // medium
                return {
                    height: 'h-32',
                    width: 'w-16',
                    fontSize: 'text-sm',
                };
        }
    };

    const vialSize = getVialSize();
    const bloodColor = getBloodColor();

    return (
        <div className="flex flex-col items-center">
            <div className="relative flex flex-col items-center">
                {/* Vial top */}
                <div className={`${vialSize.width} h-2 bg-gray-200 rounded-t-lg border border-gray-300`}></div>

                {/* Vial body */}
                <div className={`${vialSize.width} ${vialSize.height} relative bg-gray-50 border-l border-r border-gray-300 overflow-hidden`}>
                    {/* Blood animation */}
                    <div
                        className={`absolute bottom-0 w-full transition-all duration-1000 ease-in-out ${bloodColor} ${isExpired ? 'opacity-50' : ''}`}
                        style={{
                            height: `${fillPercentage}%`,
                            animation: 'bloodWave 3s ease-in-out infinite',
                        }}
                    >
                        {/* Animated wave effect */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-white opacity-30"
                            style={{ animation: 'waveEffect 2s ease-in-out infinite' }}></div>
                    </div>

                    {/* Warning indicator for expiring blood */}
                    {isExpiring && !isExpired && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}

                    {/* Expired indicator */}
                    {isExpired && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-20">
                                <span className="text-white font-bold transform -rotate-45 text-xs">EXPIRED</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vial bottom */}
                <div className={`${vialSize.width} h-2 bg-gray-200 rounded-b-lg border border-gray-300`}></div>
            </div>

            {/* Label */}
            <div className="mt-2 text-center">
                <div className={`font-bold ${vialSize.fontSize}`}>{bloodGroup}</div>
                <div className={`${vialSize.fontSize} text-gray-600`}>{componentType}</div>
                <div className={`${vialSize.fontSize} ${isExpiring ? 'text-yellow-600' : isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                    {quantity} units
                </div>
            </div>
        </div>
    );
};

export default BloodVial;

// Add these styles to your global CSS or use styled-components
// @keyframes bloodWave {
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-5px); }
// }
//
// @keyframes waveEffect {
//   0%, 100% { transform: translateX(0); }
//   50% { transform: translateX(100%); }
// } 