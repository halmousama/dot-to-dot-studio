import React, { useState, useRef, useLayoutEffect, useMemo, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { useAppState, useAppDispatch } from '../../context/hooks';
import CanvasImage from './CanvasImage';
import Dot from './Dot';
import Konva from 'konva';
import type { Project } from '../../context/types';
import { TOOLS } from '../../config/tools.config';

function throttle(func: (...args: any[]) => void, limit: number) {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const pointsToDeleteOnMouseUp = useRef<Set<string>>(new Set());

  const [isZooming, setIsZooming] = useState(false);
  const [isDraggingDot, setIsDraggingDot] = useState(false);
  const zoomTimeoutRef = useRef<number | null>(null);

  const { projects, activeProjectId, activeTool } = useAppState();
  const dispatch = useAppDispatch();

  const activeProject = useMemo(() => {
    return projects.find((p: Project) => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  const linePoints = useMemo(() => {
    return activeProject?.points.flatMap(p => [p.x, p.y]) || [];
  }, [activeProject?.points]);

  useLayoutEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const newSize = { width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight };
        setSize(newSize);
        if (previewCanvasRef.current) {
          previewCanvasRef.current.width = newSize.width;
          previewCanvasRef.current.height = newSize.height;
        }
      }
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const resetView = () => {
      const stage = stageRef.current;
      const container = containerRef.current;
      if (!stage || !container || !activeProject) return;

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const imageWidth = activeProject.image.width;
      const imageHeight = activeProject.image.height;

      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const scale = Math.min(scaleX, scaleY) * 0.78;

      const newX = (containerWidth - imageWidth * scale) / 2;
      const newY = (containerHeight - imageHeight * scale) / 2;

      stage.scale({ x: scale, y: scale });
      stage.position({ x: newX, y: newY });
    };

    window.addEventListener('resetView', resetView);
    return () => window.removeEventListener('resetView', resetView);
  }, [activeProject]);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
        const toolConfig = TOOLS[activeTool];
        stage.container().style.cursor = toolConfig?.cursor || 'default';
    }
  }, [activeTool]);

  const isInteracting = useMemo(() => {
    return activeTool === 'PAN' || isZooming || isDraggingDot;
  }, [activeTool, isZooming, isDraggingDot]);

  const getRelativePointerPosition = (stage: Konva.Stage) => {
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return {
      x: (pos.x - stage.x()) / stage.scaleX(),
      y: (pos.y - stage.y()) / stage.scaleY()
    };
  };

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    setIsZooming(true);
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);

    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale * 1.1 : oldScale / 1.1;
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);

    zoomTimeoutRef.current = window.setTimeout(() => {
      setIsZooming(false);
    }, 150);
  }, []);

  const throttledWheel = useMemo(() => throttle(handleWheel, 16), [handleWheel]);

  const handleStageClick = () => {
    const stage = stageRef.current;
    if (activeTool !== 'ADD_POINT' || !stage) return;
    const relativePos = getRelativePointerPosition(stage);
    if (relativePos) {
      dispatch({ type: 'ADD_POINT', payload: relativePos });
    }
  };

  const handleMouseDown = (_e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsMouseDown(true);
    const stage = stageRef.current;
    if (!stage || !activeProject || activeTool !== 'ERASE_CIRCLE') return;

    const relativePos = getRelativePointerPosition(stage);
    if (!relativePos) return;

    const eraseRadius = activeProject.settings.eraseRadius / stage.scaleX();
    const pointsToDeleteNow = new Set<string>();

    activeProject.points.forEach(p => {
        const dist = Math.hypot(p.x - relativePos.x, p.y - relativePos.y);
        if (dist < eraseRadius) {
            pointsToDeleteNow.add(p.id);
        }
    });

    if (pointsToDeleteNow.size > 0) {
        dispatch({ type: 'DELETE_MULTIPLE_POINTS', payload: Array.from(pointsToDeleteNow) });
    }
  };

  const handleMouseMove = (_e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    const previewCtx = previewCanvasRef.current?.getContext('2d');
    if (!stage || !previewCtx || !activeProject) return;

    previewCtx.clearRect(0, 0, previewCtx.canvas.width, previewCtx.canvas.height);

    if (activeTool === 'ERASE_CIRCLE') {
        const pointer = stage.getPointerPosition();
        if (pointer) {
            previewCtx.beginPath();
            previewCtx.arc(pointer.x, pointer.y, activeProject.settings.eraseRadius, 0, 2 * Math.PI);
            previewCtx.fillStyle = "rgba(255, 0, 0, 0.2)";
            previewCtx.fill();
            previewCtx.strokeStyle = "red";
            previewCtx.lineWidth = 1;
            previewCtx.stroke();
        }
    }

    if (activeTool === 'ERASE_CIRCLE' && isMouseDown) {
      const relativePos = getRelativePointerPosition(stage);
      if (!relativePos) return;

      const eraseRadius = activeProject.settings.eraseRadius / stage.scaleX();
      activeProject.points.forEach(p => {
          const dist = Math.hypot(p.x - relativePos.x, p.y - relativePos.y);
          if (dist < eraseRadius) {
              pointsToDeleteOnMouseUp.current.add(p.id);
          }
      });
    }
  };

  const handleMouseUp = (_e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsMouseDown(false);
    if (pointsToDeleteOnMouseUp.current.size > 0) {
      dispatch({ type: 'DELETE_MULTIPLE_POINTS', payload: Array.from(pointsToDeleteOnMouseUp.current) });
      pointsToDeleteOnMouseUp.current.clear();
    }
  };

  const handleMouseLeave = (_e: Konva.KonvaEventObject<MouseEvent>) => {
    const previewCtx = previewCanvasRef.current?.getContext('2d');
    if (previewCtx) {
        previewCtx.clearRect(0, 0, previewCtx.canvas.width, previewCtx.canvas.height);
    }
  };

  const handleDragStart = () => {
  };

  const handleDragEnd = () => {
  };

  return (
    <main ref={containerRef} className="flex-1 bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
      {activeProject ? (
        <>
          <Stage
            key={activeProject.id}
            ref={stageRef}
            width={size.width}
            height={size.height}
            onWheel={throttledWheel}
            onClick={handleStageClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            draggable={activeTool === 'PAN'}
          >
            <Layer>
              <Rect x={0} y={0} width={activeProject.image.width} height={activeProject.image.height} fill="#FFFFFF" />
              <CanvasImage
                dataUrl={activeProject.image.dataUrl}
                width={activeProject.image.width}
                height={activeProject.image.height}
                visible={activeProject.settings.showImage}
              />
            </Layer>

            <Layer
              listening={!isInteracting}
            >
              <Line
                points={linePoints}
                stroke={activeProject.settings.lineColor}
                strokeWidth={activeProject.settings.lineWidth}
                visible={activeProject.settings.showPath}
                tension={0}
                lineCap="round"
                lineJoin="round"
              />
              {activeProject.points.map((point) => (
                <Dot
                  key={point.id}
                  point={point}
                  settings={activeProject.settings}
                  isInteracting={isInteracting}
                  onDragChange={setIsDraggingDot}
                />
              ))}
            </Layer>
          </Stage>
          <canvas
            ref={previewCanvasRef}
            width={size.width}
            height={size.height}
            className="absolute top-0 left-0 pointer-events-none"
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
          <p>Upload an image to start.</p>
        </div>
      )}
    </main>
  );
}

export default React.memo(CanvasArea);
