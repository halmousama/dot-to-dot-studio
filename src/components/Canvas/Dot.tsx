import React from 'react';
import { Circle, Text, Group } from 'react-konva';
import Konva from 'konva';
import { useAppState, useAppDispatch } from '../../context/hooks';
import type { Point, ProjectSettings } from '../../context/types';

interface DotProps {
  point: Point;
  settings: ProjectSettings;
  isInteracting: boolean; 
  onDragChange: (isDragging: boolean) => void;
}

function Dot({ point, settings, isInteracting, onDragChange }: DotProps) {
  const { id, x, y, number } = point;
  const { dotSize, fontSize, dotColor, showNumbers } = settings;

  const { activeTool } = useAppState();
  const dispatch = useAppDispatch();

  const isSelectToolActive = activeTool === 'SELECT';

  const handleDragStart = (_e: Konva.KonvaEventObject<DragEvent>) => {
    onDragChange(true);
    dispatch({ type: 'START_POINT_MOVE', payload: { pointId: id } });
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    dispatch({ type: 'MOVE_POINT', payload: { pointId: id, newCoords: { x: e.target.x(), y: e.target.y() } } });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragChange(false);
    dispatch({ type: 'END_POINT_MOVE', payload: { pointId: id, newCoords: { x: e.target.x(), y: e.target.y() } } });
  };

  const handleClick = () => {
    if (activeTool === 'DELETE_POINT') {
      dispatch({ type: 'DELETE_POINT', payload: id });
    }
  };

  return (
    <Group
      x={x}
      y={y}
      draggable={isSelectToolActive}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      <Circle
        radius={dotSize}
        fill="white"
        stroke={dotColor}
        strokeWidth={1.5}
        shadowColor="black"
        shadowBlur={isSelectToolActive ? 10 : 0}
        shadowOpacity={0.3}
        perfectDrawEnabled={!isInteracting}
      />
      <Text
        text={String(number)}
        fontSize={fontSize}
        fill={dotColor}
        visible={showNumbers && !isInteracting} 
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        width={dotSize * 2}
        height={dotSize * 2}
        offsetX={dotSize}
        offsetY={dotSize}
        perfectDrawEnabled={!isInteracting}
      />
    </Group>
  );
}

export default React.memo(Dot);
