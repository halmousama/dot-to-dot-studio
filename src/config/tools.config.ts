import { Move, Plus, Trash2, Hand, Wand2, Eraser, type LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  Icon: LucideIcon;
  cursor: string;
  shortcut: string;
  isActionButton?: boolean;
}

export const TOOLS: Record<string, Tool> = {
  SELECT: { id: 'SELECT', name: 'Select & Move', Icon: Move, cursor: 'grab', shortcut: 'V' },
  ADD_POINT: { id: 'ADD_POINT', name: 'Add Point', Icon: Plus, cursor: 'crosshair', shortcut: 'A' },
  DELETE_POINT: { id: 'DELETE_POINT', name: 'Delete Point', Icon: Trash2, cursor: 'pointer', shortcut: 'D' },
  ERASE_CIRCLE: { id: 'ERASE_CIRCLE', name: 'Circle Erase', Icon: Eraser, cursor: 'none', shortcut: 'E' },
  PAN: { id: 'PAN', name: 'Pan Tool', Icon: Hand, cursor: 'grab', shortcut: 'H' },
  AUTO_GENERATE: {
    id: 'AUTO_GENERATE',
    name: 'Auto-Generate Points',
    Icon: Wand2,
    cursor: 'default',
    shortcut: 'G',
    isActionButton: true
  },
};
