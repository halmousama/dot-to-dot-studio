import React, { useState, useRef, useEffect } from 'react';

interface ScrubberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (newValue: number) => void;
  unit?: string;
}

function ScrubberInput({ label, value, min = 0, max = 100, step = 1, onChange, unit = 'px' }: ScrubberInputProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const startValueRef = useRef(0);
  const startXRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLLabelElement>) => {
    setIsScrubbing(true);
    startXRef.current = e.clientX;
    startValueRef.current = value;
    document.body.style.cursor = 'ew-resize';
  };

  const handleValueClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(value.toString());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEditSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false);
      if (e.key === 'Enter') {
        const numValue = parseFloat(editValue);
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
          onChange(numValue);
        } else {
          setEditValue(value.toString());
        }
      }
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleEditBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    } else {
      setEditValue(value.toString());
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isScrubbing) return;
      const dx = e.clientX - startXRef.current;
      const change = Math.round(dx / 5) * step;
      const newValue = Math.max(min, Math.min(max, startValueRef.current + change));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      document.body.style.cursor = 'default';
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, onChange, min, max, step]);

  return (
    <div className="flex justify-between items-center">
      <label
        onMouseDown={handleMouseDown}
        className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-ew-resize select-none"
        title={`Drag to change ${label}`}
      >
        {label}
      </label>

      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          step={step}
          value={editValue}
          onChange={handleEditChange}
          onKeyDown={handleEditSubmit}
          onBlur={handleEditBlur}
          className="text-sm font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded w-20 text-right border border-blue-300 dark:border-blue-600 text-slate-900 dark:text-slate-100"
        />
      ) : (
        <span
          onClick={handleValueClick}
          className="text-sm font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded w-20 text-right cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-slate-100"
          title={`Click to edit ${label}`}
        >
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      )}
    </div>
  );
}

export default ScrubberInput;
