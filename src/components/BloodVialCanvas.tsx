import React, { useRef, useEffect, useState } from 'react';
import { Badge, Tooltip } from 'antd';

// Declare Konva components that will be dynamically imported
let Stage: any;
let Layer: any;
let Rect: any;
let Line: any;
let Group: any;
let Text: any;

interface BloodVialCanvasProps {
    bloodType: string;
    componentType: string;
    quantity: number;
    actualQuantity: number;
    expiring?: boolean;
    expired?: boolean;
    status?: string;
}

const BloodVialCanvas: React.FC<BloodVialCanvasProps> = ({
    bloodType,
    componentType,
    quantity,
    actualQuantity,
    expiring = false,
    expired = false,
    status,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 40, height: 80 }); // Smaller dimensions
    const [time, setTime] = useState(0);
    const animationRef = useRef<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [konvaLoaded, setKonvaLoaded] = useState(false);

    // Calculate fill percentage based on quantity
    const calculateFillPercentage = () => {
        // Xác định thể tích thực tế dựa trên actualQuantity hoặc ước tính từ số đơn vị
        const realVolume = actualQuantity > 0 ? actualQuantity : quantity * 450;

        // Ưu tiên sử dụng số lượng đơn vị để phân biệt rõ ràng hơn
        if (quantity === 1) {
            // Nếu là 1 đơn vị, mức độ đầy phụ thuộc vào thể tích
            if (realVolume <= 100) {
                return 15; // Plasma hoặc thành phần máu nhỏ (100ml)
            } else if (realVolume <= 200) {
                return 25; // Thành phần máu trung bình (200ml)
            } else if (realVolume <= 300) {
                return 40; // Thành phần máu lớn (300ml)
            } else {
                return 60; // 1 đơn vị máu tiêu chuẩn (450ml)
            }
        } else if (quantity === 2) {
            // Nếu là 2 đơn vị, luôn hiển thị cao hơn 1 đơn vị
            return 75; // 2 đơn vị máu (khoảng 900ml)
        } else if (quantity >= 3) {
            // Từ 3 đơn vị trở lên
            return 90; // Nhiều đơn vị máu
        } else {
            // Trường hợp khác, dựa vào thể tích
            if (realVolume <= 100) {
                return 15;
            } else if (realVolume <= 200) {
                return 25;
            } else if (realVolume <= 450) {
                return 60;
            } else if (realVolume <= 900) {
                return 75;
            } else {
                return 90;
            }
        }
    };

    // Tính toán phần trăm lấp đầy
    const fillPercentage = calculateFillPercentage();
    const fillHeight = (dimensions.height * fillPercentage) / 100;

    // Determine color based on blood type and component
    let fillColor = '#dc2626'; // red-600
    if (componentType === 'Plasma') {
        fillColor = '#fef08a'; // yellow-200
    } else if (componentType === 'Platelets') {
        fillColor = '#facc15'; // yellow-400
    }

    // Add status modifier to color and opacity
    let opacity = 1;
    let statusBadge = null;
    let isDispatched = status?.toLowerCase() === 'dispatched';
    let isAvailable = status?.toLowerCase() === 'available';
    let isUsed = status?.toLowerCase() === 'used';

    // Get color and badge based on status
    let statusColor = 'green';
    let badgeStatus: "success" | "processing" | "error" | "default" | "warning" | undefined = "success";

    if (expired) {
        opacity = 0.5;
        statusColor = 'red';
        badgeStatus = "error";
        statusBadge = <Badge status={badgeStatus} text="Expired" />;
    } else if (isUsed) {
        opacity = 0.7;
        statusColor = 'blue';
        badgeStatus = "processing";
        statusBadge = <Badge status={badgeStatus} text="Used" />;
    } else if (isDispatched) {
        opacity = 0.9;
        statusColor = 'purple';
        badgeStatus = "warning";
        statusBadge = <Badge status={badgeStatus} text="Dispatched" style={{ fontWeight: 'bold' }} />;
    } else if (expiring) {
        statusColor = 'orange';
        badgeStatus = "warning";
        statusBadge = <Badge status={badgeStatus} text="Expiring" />;
    } else if (isAvailable) {
        statusColor = 'green';
        badgeStatus = "success";
        statusBadge = <Badge status={badgeStatus} text="Available" />;
    }

    // Set isMounted to true when component mounts (client-side only)
    useEffect(() => {
        setIsMounted(true);

        if (containerRef.current) {
            setDimensions({
                width: 40, // Smaller width for the vial
                height: 80, // Smaller height for the vial
            });
        }

        // Import Konva on client side only
        const loadKonva = async () => {
            try {
                const ReactKonva = await import('react-konva');
                Stage = ReactKonva.Stage;
                Layer = ReactKonva.Layer;
                Rect = ReactKonva.Rect;
                Line = ReactKonva.Line;
                Group = ReactKonva.Group;
                Text = ReactKonva.Text;
                setKonvaLoaded(true);
            } catch (error) {
                console.error('Failed to load Konva:', error);
            }
        };

        loadKonva();
    }, []);

    // Animation effect
    useEffect(() => {
        if (!isMounted) return;

        const animate = () => {
            setTime(prevTime => prevTime + 0.05);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isMounted]);

    // Generate wave points for the top of the blood
    const generateWavePoints = () => {
        const points = [];
        const amplitude = expiring ? 3 : 2; // Wave height
        const frequency = 0.2; // Wave frequency
        const segments = 10; // Number of segments for the wave

        // Start with the bottom left corner
        points.push(0, dimensions.height);

        // Add the left side
        points.push(0, dimensions.height - fillHeight);

        // Add the wave points on top
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * dimensions.width;
            // Create a sine wave with some animation based on time
            const y = dimensions.height - fillHeight +
                Math.sin((i / segments) * Math.PI * 2 * frequency + time) * amplitude;
            points.push(x, y);
        }

        // Add the right side
        points.push(dimensions.width, dimensions.height - fillHeight);

        // Close the shape with the bottom right corner
        points.push(dimensions.width, dimensions.height);

        return points;
    };

    // Generate a secondary wave for more dynamic effect
    const generateSecondaryWavePoints = () => {
        const points = [];
        const amplitude = 1.5; // Smaller amplitude for secondary wave
        const frequency = 0.3; // Different frequency
        const segments = 10;
        const waveOffset = dimensions.height - fillHeight + 5; // Position below the main wave

        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * dimensions.width;
            // Phase shifted wave
            const y = waveOffset +
                Math.sin((i / segments) * Math.PI * 2 * frequency + time * 1.3) * amplitude;
            points.push(x, y);
        }

        return points;
    };

    // Generate pattern points for dispatched blood (diagonal stripes)
    const generateDispatchedPattern = () => {
        const stripeWidth = 6; // Width between stripes
        const stripeCount = Math.ceil(dimensions.width / stripeWidth) * 2;
        const points = [];

        for (let i = -dimensions.height; i < dimensions.width; i += stripeWidth) {
            points.push(
                i, dimensions.height - fillHeight,
                i + fillHeight, dimensions.height
            );
        }

        return points;
    };

    // Create tooltip content
    const tooltipContent = (
        <div>
            <div><strong>Blood Type:</strong> {bloodType}</div>
            <div><strong>Component:</strong> {componentType}</div>
            <div><strong>Quantity:</strong> {quantity} {quantity > 1 ? 'units' : 'unit'}</div>
            <div><strong>Volume:</strong> {actualQuantity} ml</div>
            <div><strong>Status:</strong> {status}</div>
        </div>
    );

    // Hiển thị thông tin chi tiết về thể tích
    const renderVolumeInfo = () => {
        return (
            <div className="text-xs mt-1 font-medium">{quantity}</div>
        );
    };

    // Get the status letter to display
    const getStatusLetter = () => {
        if (isDispatched) return "D";
        if (isUsed) return "U";
        if (expired) return "E";
        if (expiring) return "X";
        if (isAvailable) return "A";
        return "";
    };

    // Fallback for server-side rendering or when Konva is not loaded yet
    if (!isMounted || !konvaLoaded) {
        return (
            <Tooltip title={tooltipContent} placement="top">
                <div className="flex flex-col items-center mb-2 mx-1">
                    <div className={`relative w-10 h-20 bg-gray-100 rounded-b-full border-2 border-${statusColor}-500 overflow-hidden`}>
                        <div
                            className={`absolute bottom-0 w-full transition-all duration-500`}
                            style={{
                                height: `${fillPercentage}%`,
                                backgroundColor: fillColor,
                                opacity: expired ? 0.5 : 1,
                                backgroundImage: isDispatched ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)' : 'none'
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-black bg-white bg-opacity-70 px-1 rounded">
                                {getStatusLetter()}
                            </span>
                        </div>
                    </div>
                    {renderVolumeInfo()}
                </div>
            </Tooltip>
        );
    }

    return (
        <Tooltip title={tooltipContent} placement="top">
            <div className="flex flex-col items-center mb-2 mx-1">
                <div
                    ref={containerRef}
                    className={`relative w-10 h-20 bg-gray-100 rounded-b-full border-2 border-${statusColor}-500 overflow-hidden`}
                >
                    <Stage width={dimensions.width} height={dimensions.height}>
                        <Layer>
                            {/* Blood fill with wave effect */}
                            {fillHeight > 0 && (
                                <Group>
                                    {/* Main blood fill with wave effect */}
                                    <Line
                                        points={generateWavePoints()}
                                        closed={true}
                                        fill={fillColor}
                                        opacity={opacity}
                                    />

                                    {/* Pattern for dispatched blood */}
                                    {isDispatched && (
                                        <Line
                                            points={generateDispatchedPattern()}
                                            stroke="rgba(0,0,0,0.2)"
                                            strokeWidth={1}
                                            opacity={0.7}
                                        />
                                    )}

                                    {/* Secondary wave for more dynamic effect - only when not expired */}
                                    {!expired && (
                                        <Line
                                            points={generateSecondaryWavePoints()}
                                            stroke={fillColor}
                                            strokeWidth={1.5}
                                            opacity={0.6}
                                            tension={0.3}
                                        />
                                    )}

                                    {/* Highlight effect on top of the blood */}
                                    {!expired && (
                                        <Rect
                                            x={0}
                                            y={dimensions.height - fillHeight + 2}
                                            width={dimensions.width}
                                            height={4}
                                            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                                            fillLinearGradientEndPoint={{ x: dimensions.width, y: 0 }}
                                            fillLinearGradientColorStops={[
                                                0, 'rgba(255,255,255,0.1)',
                                                0.5, 'rgba(255,255,255,0.3)',
                                                1, 'rgba(255,255,255,0.1)'
                                            ]}
                                            opacity={0.5}
                                            offsetX={-dimensions.width * (time % 1) * 0.5}
                                        />
                                    )}

                                    {/* Status indicator */}
                                    <Text
                                        text={getStatusLetter()}
                                        x={dimensions.width / 2 - 5}
                                        y={dimensions.height - fillHeight / 2 - 5}
                                        fontSize={10}
                                        fontStyle="bold"
                                        fill="#000"
                                        opacity={0.7}
                                    />
                                </Group>
                            )}
                        </Layer>
                    </Stage>
                </div>
                {renderVolumeInfo()}
            </div>
        </Tooltip>
    );
};

export default BloodVialCanvas; 