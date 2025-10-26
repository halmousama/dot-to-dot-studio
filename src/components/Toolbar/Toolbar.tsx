import React from "react";
import { useAppState, useAppDispatch } from "../../context/hooks";
import { TOOLS } from "../../config/tools.config";
import { Undo, Redo, LoaderCircle, Frame, Trash } from "lucide-react";
import ToolButton from "./ToolButton";
import { generatePointsOpenCV } from "../../utils/autoGenerator";
import type { AppState } from "../../context/types";

function Toolbar() {
  const state: AppState = useAppState();
  const dispatch = useAppDispatch();

  const { activeTool, projects, activeProjectId, isGenerating } = state;

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const canUndo = activeProject ? activeProject.history.index > 0 : false;
  const canRedo = activeProject
    ? activeProject.history.index < activeProject.history.stack.length - 1
    : false;

  const handleAutoGenerate = async () => {
    if (!activeProject || !activeProject.image.dataUrl) {
      alert("Please select a project with an image first.");
      return;
    }

    dispatch({ type: "SET_IS_GENERATING", payload: true });

    try {
      const generatedPoints = await generatePointsOpenCV(
        activeProject.image.dataUrl,
        {
          targetPoints: activeProject.settings.generator.targetPoints,
          minPointDistance: activeProject.settings.generator.minPointDistance,
        }
      );

      dispatch({ type: "SET_GENERATED_POINTS", payload: generatedPoints });
    } catch (error) {
      console.error("Failed to generate points:", error);
      alert(
        "An error occurred during point generation. Please check the console."
      );
      dispatch({ type: "SET_IS_GENERATING", payload: false });
    }
  };

  const handleResetView = () => {
    window.dispatchEvent(new CustomEvent("resetView"));
  };

  const handleClearAllPoints = () => {
    if (!activeProject || activeProject.points.length === 0) return;

    if (window.confirm('Are you sure you want to delete all points on this image? This action cannot be undone.')) {
      dispatch({ type: 'CLEAR_ALL_POINTS' });
    }
  };

  return (
    <div className="h-14 bg-white dark:bg-slate-800 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2">
        {Object.values(TOOLS).map((tool) => {
          if (tool.id === "AUTO_GENERATE" && isGenerating) {
            return (
              <div
                key="generating-indicator"
                className="p-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
              >
                <LoaderCircle size={20} className="animate-spin" />
                <span>Generating...</span>
              </div>
            );
          }

          return (
            <ToolButton
              key={tool.id}
              tool={tool}
              isActive={activeTool === tool.id}
              disabled={isGenerating}
              onClick={() => {
                if (tool.isActionButton) {
                  if (tool.id === "AUTO_GENERATE") {
                    handleAutoGenerate();
                  }
                } else {
                  dispatch({ type: "SET_ACTIVE_TOOL", payload: tool.id });
                }
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleResetView}
          disabled={!activeProject}
          className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Fit to Screen (F)"
        >
          <Frame size={20} />
        </button>

        <button
          onClick={handleClearAllPoints}
          disabled={!activeProject || activeProject.points.length === 0}
          className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Clear All Points"
        >
          <Trash size={20} />
        </button>

        <button
          onClick={() => dispatch({ type: "UNDO" })}
          disabled={!canUndo}
          className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={() => dispatch({ type: "REDO" })}
          disabled={!canRedo}
          className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo size={20} />
        </button>
      </div>
    </div>
  );
}

export default React.memo(Toolbar);
