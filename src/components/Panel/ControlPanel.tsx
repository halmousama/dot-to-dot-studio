import React, { useMemo, useState } from "react";
import { useAppState, useAppDispatch } from "../../context/hooks";
import type { ProjectSettings } from "../../context/types";
import { useTheme } from "../../context/ThemeContext";
import Accordion from "./Accordion";
import ScrubberInput from "./ScrubberInput";
import { ToggleButton, ToggleButtonGroup } from "./ToggleButtonGroup";
import { ImageIcon, Type, Minus, Sun, Moon, Download } from "lucide-react";
import ExportModal from "./ExportModal";
import { exportSingleProject, exportAllAsPDF, exportAllAsZIP } from "../../utils/exporter";
import type { ExportSettings } from "../../utils/exporter";

const SettingColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-10 h-8 p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded cursor-pointer"
    />
  </div>
);

function ControlPanel() {
  const { projects, activeProjectId } = useAppState();
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();

  const [modalOpen, setModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'single' | 'all-pdf' | 'all-zip' | null>(null);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  const handleSettingChange = <K extends keyof ProjectSettings>(
    key: K,
    value: ProjectSettings[K]
  ) => {
    dispatch({
      type: "UPDATE_PROJECT_SETTINGS",
      payload: { [key]: value },
    });
  };

  const handleExport = (settings: ExportSettings) => {
    if (exportScope === 'single' && activeProject) {
      exportSingleProject(activeProject, settings);
    }
    if (exportScope === 'all-pdf') {
      exportAllAsPDF(projects, settings);
    }
    if (exportScope === 'all-zip') {
      exportAllAsZIP(projects, settings);
    }
    setModalOpen(false);
    setExportScope(null);
  };

  return (
    <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col text-slate-700 dark:text-slate-300">
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Dot-to-Dot Studio</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Dark Mode"
        >
          {theme === 'light' ? <Moon size={18} className="text-slate-600 dark:text-slate-400" /> : <Sun size={18} className="text-slate-600 dark:text-slate-400" />}
        </button>
      </div>

      {activeProject ? (
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <Accordion title="Automatic Generation" defaultOpen>
            <ScrubberInput
              label="Target Points"
              value={activeProject.settings.generator.targetPoints}
              min={10}
              max={500}
              onChange={(v) => handleSettingChange("generator", { ...activeProject.settings.generator, targetPoints: v })}
              unit=""
            />
            <ScrubberInput
              label="Min Distance"
              value={activeProject.settings.generator.minPointDistance}
              min={1}
              max={50}
              onChange={(v) => handleSettingChange("generator", { ...activeProject.settings.generator, minPointDistance: v })}
            />
          </Accordion>

          <Accordion title="Tool Settings" defaultOpen>
            <ScrubberInput
              label="Erase Radius"
              value={activeProject.settings.eraseRadius}
              min={5}
              max={100}
              onChange={(v) => handleSettingChange("eraseRadius", v)}
            />
          </Accordion>

          <Accordion title="Appearance">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">DOTS</h4>
            <ScrubberInput
              label="Size"
              value={activeProject.settings.dotSize}
              min={2}
              max={30}
              onChange={(v) => handleSettingChange("dotSize", v)}
            />
            <ScrubberInput
              label="Font Size"
              value={activeProject.settings.fontSize}
              min={6}
              max={40}
              onChange={(v) => handleSettingChange("fontSize", v)}
            />
            <SettingColorPicker
              label="Color"
              value={activeProject.settings.dotColor}
              onChange={(v: string) => handleSettingChange("dotColor", v)}
            />

            <hr className="my-4 border-slate-200 dark:border-slate-600" />

            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">PATH</h4>
            <ScrubberInput
              label="Line Width"
              value={activeProject.settings.lineWidth}
              min={0}
              max={20}
              onChange={(v) => handleSettingChange("lineWidth", v)}
            />
            <SettingColorPicker
              label="Color"
              value={activeProject.settings.lineColor}
              onChange={(v: string) => handleSettingChange("lineColor", v)}
            />
          </Accordion>

          <Accordion title="Visibility">
            <ToggleButtonGroup>
              <ToggleButton
                label={activeProject.settings.showImage ? "Hide Image" : "Show Image"}
                Icon={ImageIcon}
                isActive={activeProject.settings.showImage}
                onClick={() => handleSettingChange("showImage", !activeProject.settings.showImage)}
              />
              <ToggleButton
                label={activeProject.settings.showNumbers ? "Hide Numbers" : "Show Numbers"}
                Icon={Type}
                isActive={activeProject.settings.showNumbers}
                onClick={() => handleSettingChange("showNumbers", !activeProject.settings.showNumbers)}
              />
              <ToggleButton
                label={activeProject.settings.showPath ? "Hide Path" : "Show Path"}
                Icon={Minus}
                isActive={activeProject.settings.showPath}
                onClick={() => handleSettingChange("showPath", !activeProject.settings.showPath)}
              />
            </ToggleButtonGroup>
          </Accordion>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Select or add a project to start.
          </p>
        </div>
      )}

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Export</h3>
        <button
          onClick={() => { setExportScope('single'); setModalOpen(true); }}
          disabled={!activeProject}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-blue-500 text-white disabled:opacity-50"
        >
          <Download size={16} />
          Export Current Image...
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => { setExportScope('all-pdf'); setModalOpen(true); }}
            disabled={projects.length < 2}
            className="w-full py-2 px-4 rounded-md bg-slate-600 text-white disabled:opacity-50"
          >
            Export All (PDF)...
          </button>
          <button
            onClick={() => { setExportScope('all-zip'); setModalOpen(true); }}
            disabled={projects.length < 2}
            className="w-full py-2 px-4 rounded-md bg-slate-600 text-white disabled:opacity-50"
          >
            Export All (ZIP)...
          </button>
        </div>
      </div>

      <ExportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onExport={handleExport}
        title={
          exportScope === 'single' ? `Export '${activeProject?.name}'` : 'Export All Projects'
        }
      />
    </aside>
  );
}

export default React.memo(ControlPanel);
