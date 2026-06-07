"use client";
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

interface TableConfig {
  id: string;
  type: 'rectangle' | 'square' | 'polygon' | 'round' | 'small';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  chairsCount: number;
  chairRadius: number;
  chairIds: string[];
}

interface SeatData {
  name: string;
  booked: boolean;
}

interface InfoSeatSection {
  data_seat: SeatData[];
}

interface TableLayoutProps {
  onSeatSelect?: (seatId: string) => void;
  selectedTables?: string[];
  InfoSeatSections?: InfoSeatSection[];
  userInfo?: any
}

// Helper functions for drawing shapes
const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
};

const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  rotation: number = 0,
) => {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  const radius = 10; // Bán kính bo góc

  ctx.beginPath();
  // Vẽ hình chữ nhật với các góc bo tròn
  ctx.moveTo(-width / 2 + radius, -height / 2);
  ctx.lineTo(width / 2 - radius, -height / 2);
  ctx.arcTo(width / 2, -height / 2, width / 2, -height / 2 + radius, radius);
  ctx.lineTo(width / 2, height / 2 - radius);
  ctx.arcTo(width / 2, height / 2, width / 2 - radius, height / 2, radius);
  ctx.lineTo(-width / 2 + radius, height / 2);
  ctx.arcTo(-width / 2, height / 2, -width / 2, height / 2 - radius, radius);
  ctx.lineTo(-width / 2, -height / 2 + radius);
  ctx.arcTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2, radius);
  ctx.closePath();

  // Tô màu nền
  ctx.fillStyle = color;
  ctx.fill();

  // Vẽ viền
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
};

const drawVShape = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  // Tính toán các điểm cho hình chữ V lồng nhau
  const outerLeft = x + width * 0.1;             // Điểm ngoài bên trái (dịch vào trong)
  const outerRight = x + width * 0.9;            // Điểm ngoài bên phải (dịch vào trong)
  const innerLeft = x + width * 0.35;            // Điểm trong bên trái (tăng khoảng cách)
  const innerRight = x + width * 0.65;           // Điểm trong bên phải (giảm khoảng cách)
  const topY = y + height * 0.3;                 // Đỉnh trên (hạ thấp xuống)
  const bottomY = y + height * 0.9;              // Đáy (nâng lên)
  const centerX = x + width * 0.5;               // Điểm giữa
  const innerTopY = y + height * 0.65;           // Đỉnh trong (hạ thấp xuống)

  // Vẽ hình V ngoài
  ctx.moveTo(outerLeft, bottomY);                // Bắt đầu từ góc trái ngoài
  ctx.lineTo(centerX, topY);                     // Đến đỉnh
  ctx.lineTo(outerRight, bottomY);               // Đến góc phải ngoài

  // Vẽ hình V trong
  ctx.lineTo(innerRight, bottomY);               // Đến góc phải trong
  ctx.lineTo(centerX, innerTopY);                // Đến đỉnh trong
  ctx.lineTo(innerLeft, bottomY);                // Đến góc trái trong

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
};

const checkUserType = (userInfo: any, seatInfo: any) => {
  const customerType = userInfo.customer_type;
  let expBooking = null;
  switch (customerType) {
    case 'J':
      expBooking = seatInfo.j_booking_start
      break;
    case 'Q':
      expBooking = seatInfo.q_booking_start
      break;
    case 'K':
      expBooking = seatInfo.k_booking_start
      break;
    default:
      break;
  }

  if ((new Date()).getTime() >= (new Date(expBooking)).getTime()) {
    return true;
  } else {
    return false;
  }

}

const drawChairsAroundTable = (
  ctx: CanvasRenderingContext2D,
  table: TableConfig,
  scale: number,
  setChairPositionMap: React.Dispatch<React.SetStateAction<{ [key: string]: { x: number; y: number } }>>,
  selectedTables: string[],
  InfoSeatSections: any,
  userInfo: any
) => {
  const chairPositions: { x: number; y: number }[] = [];
  const centerX = table.x + table.width / 2;
  const centerY = table.y + table.height / 2;
  const angle = (table.rotation * Math.PI) / 180;

  // Function to apply rotation to a position
  const rotatePosition = (pos: { x: number, y: number }) => {
    if (table.rotation === 0) return pos; // Skip calculation if no rotation

    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    return {
      x: centerX + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: centerY + dx * Math.sin(angle) + dy * Math.cos(angle)
    };
  };

  if (table.type === 'square') {
    // Calculate base positions (before rotation)
    const basePositions = [
      // 2 ghế ở cạnh trên
      { x: table.x + table.width * 0, y: table.y - table.chairRadius * 2 },
      { x: table.x + table.width * 1, y: table.y - table.chairRadius * 2 },
      // 1 ghế ở cạnh trái
      { x: table.x - table.chairRadius * 2, y: table.y + table.height / 2 },
      // 1 ghế ở cạnh phải
      { x: table.x + table.width + table.chairRadius * 2, y: table.y + table.height / 2 }
    ];

    // Apply rotation to each chair position
    basePositions.forEach(pos => {
      const rotated = rotatePosition(pos);
      chairPositions.push({
        x: rotated.x,
        y: rotated.y
      });
    });
  } else if (table.type === 'round') {
    const chairCount = table.chairsCount;
    const angleStep = (2 * Math.PI) / chairCount;
    const radius = Math.min(table.width, table.height) / 2 + table.chairRadius * 2;

    // For round tables, add table rotation to each chair's angle
    for (let i = 0; i < chairCount; i++) {
      const chairAngle = i * angleStep - Math.PI / 2 + angle;
      chairPositions.push({
        x: centerX + Math.cos(chairAngle) * radius,
        y: centerY + Math.sin(chairAngle) * radius
      });
    }
  } else if (table.type === 'small') {
    // Calculate base positions (before rotation)
    const basePositions = [
      { x: table.x + table.width * 0, y: table.y - table.chairRadius * 1.5 },
      { x: table.x + table.width * 1, y: table.y - table.chairRadius * 1.5 }
    ];

    // Apply rotation to each chair position
    basePositions.forEach(pos => {
      const rotated = rotatePosition(pos);
      chairPositions.push({
        x: rotated.x,
        y: rotated.y
      });
    });
  } else if (table.type === 'polygon') {
    // V-shaped table chairs - base positions
    const basePositions = [
      // 2 ghế bên trái
      { x: table.x + table.width * -0.2, y: table.y + table.height * 0.5 },
      { x: table.x + table.width * 0.1, y: table.y + table.height * 0.5 },
      // 2 ghế bên phải
      { x: table.x + table.width * 1.2, y: table.y + table.height * 0.5 },
      { x: table.x + table.width * 0.9, y: table.y + table.height * 0.5 },
      // 2 ghế phía dưới
      { x: table.x + table.width * 0.35, y: table.y + table.height + table.chairRadius },
      { x: table.x + table.width * 0.65, y: table.y + table.height + table.chairRadius }
    ];

    // Apply rotation to each chair position
    basePositions.forEach(pos => {
      const rotated = rotatePosition(pos);
      chairPositions.push({
        x: rotated.x,
        y: rotated.y
      });
    });
  }
  // console.log(selectedTables);

  // selectedTables
  // Draw chairs and update chairPositionMap
  chairPositions.forEach((pos, index) => {
    const chairId = table.chairIds[index]; // Get the chair ID
    const isSelected = selectedTables.includes(chairId); // Check if the chairId is in selectedTables

    let tableData: any = undefined;
    for (const section of InfoSeatSections) {
      for (const seat of section.data_seat) {
        if (seat.name === chairId) {
          tableData = seat;
          const check = checkUserType(userInfo, section)
          if (!check) {
            tableData.booked = true
          }
          break;
        }
      }
      if (tableData) break;
    }

    ctx.fillStyle = tableData?.booked ? 'red' : (isSelected ? 'green' : '#666'); // Set color based on selection
    drawCircle(ctx, pos.x * scale, pos.y * scale, table.chairRadius * scale, ctx.fillStyle);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(chairId, pos.x * scale, pos.y * scale); // Draw chair ID above the chair

    // Update the chairPositionMap
    setChairPositionMap(prev => ({
      ...prev,
      [chairId]: { x: pos.x, y: pos.y }
    }));
  });
  return chairPositions;
};

const TableLayout: React.FC<TableLayoutProps> = ({ onSeatSelect, selectedTables = [], InfoSeatSections = [], userInfo }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastOffset, setLastOffset] = useState({ x: 0, y: 0 });
  const [chairPositionMap, setChairPositionMap] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Add touch state tracking
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch start
  const handleTouchStart = (e: any) => {
    if (e.touches.length === 2) {
      // Pinch to zoom start
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setTouchStartDistance(distance);
      setInitialScale(scale);
    } else if (e.touches.length === 1) {
      // Single touch for panning
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastOffset({ x: offset.x, y: offset.y });
    }
  };

  // Handle touch move
  const handleTouchMove = (e: any) => {
    e.preventDefault(); // Prevent scrolling while interacting with canvas

    if (e.touches.length === 2 && touchStartDistance !== null) {
      // Handle pinch to zoom
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleFactor = currentDistance / touchStartDistance;
      const newScale = Math.max(0.5, Math.min(3, initialScale * scaleFactor));
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging) {
      // Handle panning
      setOffset({
        x: lastOffset.x + (e.touches[0].clientX - dragStart.x),
        y: lastOffset.y + (e.touches[0].clientY - dragStart.y),
      });
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStartDistance(null);
  };

  // Handle tap for seat selection
  const handleTouchTap = (e: React.TouchEvent) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0] || e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const touchY = (touch.clientY - rect.top) * (canvas.height / rect.height);

    // Adjust for pan and zoom
    const adjustedX = (touchX - offset.x) / scale;
    const adjustedY = (touchY - offset.y) / scale;

    // Check if tap is on a chair (increase hit area for better touch interaction)
    for (const [chairId, position] of Object.entries(chairPositionMap)) {
      const isWithinX = Math.abs(adjustedX - position.x) <= 15; // Increased touch area
      const isWithinY = Math.abs(adjustedY - position.y) <= 15; // Increased touch area

      if (isWithinX && isWithinY) {
        let seatData: any = undefined;
        for (const section of InfoSeatSections) {
          for (const seat of section.data_seat) {
            if (seat.name === chairId) {
              seatData = seat;
              const check = checkUserType(userInfo, section);
              if (!check) {
                seatData.booked = true;
              }
              break;
            }
          }
          if (seatData) break;
        }

        if (seatData && !seatData.booked) {
          onSeatSelect?.(chairId);
        }
      }
    }
  };

  // Memoize tables array
  const tables = useMemo<TableConfig[]>(() => [
    // Top row square tables (B1-B7)
    ...Array(8).fill(null).map((_, i) => ({
      id: `B${i + 1}`,
      type: 'square' as const,
      x: (i * 150),
      y: 50,
      width: 35,
      height: 35,
      rotation: 0,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 4 }, (_, j) => `J.${i * 4 + j + 57}`)
    })),
    // Middle row square tables (B9-B13)
    ...Array(7).fill(null).map((_, i) => ({
      id: `B${i + 9}`,
      type: 'square' as const,
      x: 75 + (i * 150),
      y: 150,
      width: 35,
      height: 35,
      rotation: 0,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 4 }, (_, j) => `J.${i * 4 + j + 29}`)
    })),
    // Middle row square tables (B16-B22)
    ...Array(7).fill(null).map((_, i) => ({
      id: `B${i + 16}`,
      type: 'square' as const,
      x: 75 + (i * 150),
      y: 270,
      width: 35,
      height: 35,
      rotation: 0,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 4 }, (_, j) => `J.${i * 4 + j + 1}`)
    })),
    // V-shaped tables and small tables
    {
      id: 'B23',
      type: 'polygon',
      x: 150,
      y: 350,
      width: 120,
      height: 60,
      rotation: 0,
      chairsCount: 6,
      chairRadius: 15,
      chairIds: ['Q.27', 'Q.28', 'Q.29', 'Q.30', 'K.27', 'K.28']
    },
    {
      id: 'B24',
      type: 'small',
      x: 400,
      y: 400,
      width: 35,
      height: 35,
      rotation: 0,
      chairsCount: 2,
      chairRadius: 15,
      chairIds: Array.from({ length: 2 }, (_, i) => `Q.${i + 31}`)
    },
    {
      id: 'B25',
      type: 'small',
      x: 550,
      y: 400,
      width: 35,
      height: 35,
      rotation: 0,
      chairsCount: 2,
      chairRadius: 15,
      chairIds: Array.from({ length: 2 }, (_, i) => `Q.${i + 33}`)
    },

    {
      id: 'B26',
      type: 'polygon',
      x: 800,
      y: 350,
      width: 120,
      height: 60,
      rotation: 0,
      chairsCount: 6,
      chairRadius: 15,
      chairIds: ['Q.35', 'Q.36', 'Q.37', 'Q.38', 'K.29', 'K.30']
    },
    {
      id: 'B27',
      type: 'small',
      x: 1000,
      y: 400,
      width: 35,
      height: 35,
      rotation: 0,
      chairsCount: 2,
      chairRadius: 15,
      chairIds: Array.from({ length: 2 }, (_, i) => `Q.${i + 39}`)
    },
    ...Array(5).fill(null).map((_, i) => ({
      id: `B${i + 28}`,
      type: 'small' as const,
      x: 150 + (i * 120),
      y: 500,
      width: 35,
      height: 35,
      rotation: 0,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 4 }, (_, j) => `K.${i * 2 + j + 15}`)
    })),
    {
      id: 'B33',
      type: 'small',
      x: 750,
      y: 550,
      width: 35,
      height: 35,
      rotation: 45,
      chairsCount: 2,
      chairRadius: 15,
      chairIds: Array.from({ length: 2 }, (_, i) => `K.${i + 25}`)
    },
    ...Array(2).fill(null).map((_, i) => ({
      id: `B${i + 34}`,
      type: 'small' as const,
      x: 850 + (i * 120),
      y: 500,
      width: 35,
      height: 35,
      rotation: 90,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 2 }, (_, j) => `Q.${i * 2 + j + 17}`)
    })),
    ...Array(2).fill(null).map((_, i) => ({
      id: `B${i + 36}`,
      type: 'small' as const,
      x: 50 + (i * 100),
      y: 600,
      width: 35,
      height: 35,
      rotation: -90,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 4 }, (_, j) => `Q.${i * 2 + j + 5}`)
    })),
    ...Array(4).fill(null).map((_, i) => ({
      id: `B${i + 38}`,
      type: 'small' as const,
      x: 270 + (i * 120),
      y: 600,
      width: 35,
      height: 35,
      rotation: 0,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 4 }, (_, j) => `K.${i * 2 + j + 7}`)
    })),

    ...Array(2).fill(null).map((_, i) => ({
      id: `B${i + 42}`,
      type: 'small' as const,
      x: 850 + (i * 120),
      y: 600,
      width: 35,
      height: 35,
      rotation: 90,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: i === 0 ? ['Q.15', 'Q.16'] : ['Q.21', 'Q.22']
    })),
    ...Array(2).fill(null).map((_, i) => ({
      id: `B${i + 44}`,
      type: 'small' as const,
      x: 50 + (i * 100),
      y: 700,
      width: 40,
      height: 40,
      rotation: -90,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: i === 0 ? ['Q.3', 'Q.4'] : ['Q.9', 'Q.10']
    })),
    ...Array(2).fill(null).map((_, i) => ({
      id: `B${i + 46}`,
      type: 'small' as const,
      x: 850 + (i * 120),
      y: 700,
      width: 35,
      height: 35,
      rotation: 90,
      chairsCount: 2,
      chairRadius: 15,
      chairIds: i === 0 ? ['Q.13', 'Q.14'] : ['Q.23', 'Q.24']
    })),
    {
      id: 'B48',
      type: 'small',
      x: 50,
      y: 800,
      width: 35,
      height: 35,
      rotation: -90,
      chairsCount: 2,
      chairRadius: 15,
      chairIds: ['Q.1', 'Q.2']
    },
    {
      id: 'B49',
      type: 'small',
      x: 300,
      y: 800,
      width: 35,
      height: 35,
      rotation: -45,
      chairsCount: 2,
      chairRadius: 15,
      chairIds: Array.from({ length: 2 }, (_, i) => `K.${i + 1}`)
    },
    ...Array(2).fill(null).map((_, i) => ({
      id: `B${i + 50}`,
      type: 'small' as const,
      x: 450 + (i * 120),
      y: 800,
      width: 40,
      height: 40,
      rotation: 45,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 4 }, (_, j) => `K.${i * 2 + j + 3}`)
    })),
    ...Array(2).fill(null).map((_, i) => ({
      id: `B${i + 52}`,
      type: 'small' as const,
      x: 850 + (i * 120),
      y: 800,
      width: 35,
      height: 35,
      rotation: 90,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: i === 0 ? ['Q.11', 'Q.12'] : ['Q.25', 'Q.26']
    })),
    {
      id: 'B50',
      type: 'round',
      x: 1250,
      y: 50,
      width: 40,
      height: 40,
      rotation: 0,
      chairsCount: 6,
      chairRadius: 15,
      chairIds: Array.from({ length: 6 }, (_, i) => `J.${i + 89}`)
    },
    {
      id: 'B51',
      type: 'square' as const,
      x: 1250,
      y: 225,
      width: 35,
      height: 35,
      rotation: 90,
      chairsCount: 6,
      chairRadius: 15,
      chairIds: Array.from({ length: 6 }, (_, i) => `J.${i + 95}`)
    },
    ...Array(6).fill(null).map((_, i) => ({
      id: `B${i + 53}`,
      type: 'small' as const,
      x: 1220,
      y: 350 + (i * 100),
      width: 35,
      height: 35,
      rotation: 90,
      chairsCount: 4,
      chairRadius: 15,
      chairIds: Array.from({ length: 6 }, (_, j) => `J.${i * 2 + j + 99}`)
    })),
  ], []);

  const drawAll = useCallback((ctx: CanvasRenderingContext2D, scale: number) => {
    if (!canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw stage area
    ctx.beginPath();
    const stageX = 400;
    const stageY = 1000;
    const stageWidth = 400;
    const stageHeight = 200;
    const topOffset = 100;

    ctx.moveTo(stageX - stageWidth / 2, stageY);
    ctx.lineTo(stageX - stageWidth / 3, stageY - stageHeight + topOffset * 1.3);
    ctx.lineTo(stageX, stageY - stageHeight + 70);
    ctx.lineTo(stageX + stageWidth / 3, stageY - stageHeight + topOffset * 1.2);
    ctx.lineTo(stageX + stageWidth / 2, stageY);
    ctx.lineTo(stageX - stageWidth / 2, stageY);

    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SÂN KHẤU', stageX, stageY - stageHeight / 3);

    // Draw tables and chairs
    tables.forEach(table => {
      const isTableSelected = selectedTables.includes(table.id);
      const tableData = InfoSeatSections.flatMap((item: InfoSeatSection) => item.data_seat)
        .find((seat: SeatData) => seat.name === table.id);
      let tableColor = isTableSelected ? '#4CAF50' : '#ccc';

      if (tableData?.booked) {
        tableColor = 'red';
      }

      if (table.type === 'square') {
        drawRectangle(ctx, table.x, table.y, table.width, table.height, tableColor, table.rotation);
      } else if (table.type === 'polygon') {
        drawVShape(ctx, table.x, table.y, table.width, table.height, tableColor);
      } else if (table.type === 'round') {
        drawCircle(ctx, table.x + table.width / 2, table.y + table.height / 2, table.width / 2, tableColor);
      } else if (table.type === 'small') {
        drawRectangle(ctx, table.x, table.y, table.width, table.height, tableColor, table.rotation);
      }

      // Draw chairs
      drawChairsAroundTable(ctx, table, 1, setChairPositionMap, selectedTables, InfoSeatSections, userInfo);
      // console.log(chairPositionMap);>
      // console.log(selectedTables);
      // Draw seats (assuming you have seat data available)
      // const seats = InfoSeatSections.flatMap(item => item.data_seat);



      // Draw table ID
      ctx.fillStyle = '#000';
      ctx.font = `10px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(table.id, table.x + table.width / 2, table.y + table.height / 2);
    });

    // Draw line
    const lineX = canvasRef.current.width + 65;
    ctx.beginPath();
    ctx.moveTo(lineX, 0);
    ctx.lineTo(lineX, 170);
    ctx.lineTo(lineX + 50, 200);
    ctx.lineTo(lineX + 50, 200);
    ctx.lineTo(lineX + 50, 1000);
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }, [offset, selectedTables, tables]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      drawAll(ctx, scale);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [scale, offset, selectedTables, drawAll]);

  // Chặn cuộn trang khi zoom trên canvas
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (canvasRef.current && canvasRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    const options = { passive: false };
    canvasRef.current?.addEventListener("wheel", preventScroll, options);

    return () => {
      canvasRef.current?.removeEventListener("wheel", preventScroll);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn cuộn trang

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastOffset({ x: offset.x, y: offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: lastOffset.x + (e.clientX - dragStart.x),
      y: lastOffset.y + (e.clientY - dragStart.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d'); // Get the canvas context
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const adjustedX = (mouseX - offset.x) / scale;
    const adjustedY = (mouseY - offset.y) / scale;

    // Check against chairPositionMap
    for (const [chairId, position] of Object.entries(chairPositionMap)) {
      const isWithinX = Math.abs(adjustedX - position.x) <= 10; // Adjust tolerance as needed
      const isWithinY = Math.abs(adjustedY - position.y) <= 10; // Adjust tolerance as needed

      if (isWithinX && isWithinY) {

        let seatData: any = undefined;
        for (const section of InfoSeatSections) {
          for (const seat of section.data_seat) {
            if (seat.name === chairId) {
              seatData = seat;
              const check = checkUserType(userInfo, section)
              if (!check) {
                seatData.booked = true
              }
              break;
            }
          }
          if (seatData) break;
        }

        if (seatData && !seatData.booked) {
          // console.log(`Selected seat ID: ${chairId}`); // Log the selected seat ID
          onSeatSelect?.(chairId); // Use chairId
          // Change the color of the selected seat
          ctx.fillStyle = 'green'; // Set the color to green
          // console.log(seatData);

          ctx.beginPath();
          ctx.arc(position.x, position.y, 10, 0, Math.PI * 2); // Adjust radius as needed
          ctx.fill();
        }
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          width: '100%',
          height: "auto",
          backgroundColor: '#f5f5f5',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none', // Prevent default touch behaviors
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
    </div>
  );
};

export default TableLayout;