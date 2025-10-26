import { useState } from 'react';
import type { ExportSettings } from '../../utils/exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
  title: string;
}

function ExportModal({ isOpen, onClose, onExport, title }: ExportModalProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'png',
    includeBackground: true,
    includeNumbers: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">{title}</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Format</label>
            <select
              value={settings.format}
              onChange={e => setSettings({ ...settings, format: e.target.value as 'png' | 'jpeg' })}
              className="w-full mt-1 p-2 border rounded-md bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.includeBackground}
              onChange={e => setSettings({ ...settings, includeBackground: e.target.checked })}
            />
            <span className="text-sm">Include background image</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.includeNumbers}
              onChange={e => setSettings({ ...settings, includeNumbers: e.target.checked })}
            />
            <span className="text-sm">Include dot numbers</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="py-2 px-4 rounded-md bg-slate-200 dark:bg-slate-600">Cancel</button>
          <button onClick={() => onExport(settings)} className="py-2 px-4 rounded-md bg-blue-500 text-white">Export</button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
