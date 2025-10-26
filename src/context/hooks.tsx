import { useContext, createContext } from "react";
import type { Dispatch } from "react";
import type { AppState, Action } from "./types";

export type { Point, AppState, Action } from "./types";

export const AppStateContext = createContext<AppState | undefined>(undefined);
export const AppDispatchContext = createContext<Dispatch<Action> | undefined>(
  undefined
);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error("useAppDispatch must be used within an AppProvider");
  }
  return context;
};

export const useGeneratorSettings = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const handleGeneratorSettingChange = (key: keyof import("./types").GeneratorSettings, value: number) => {
    if (!state.activeProjectId) return;

    const activeProject = state.projects.find((p) => p.id === state.activeProjectId);
    if (!activeProject) return;

    dispatch({
      type: "UPDATE_PROJECT_SETTINGS",
      payload: {
        generator: {
          ...activeProject.settings.generator,
          [key]: value,
        },
      },
    });
  };

  return {
    settings: state.projects.find((p) => p.id === state.activeProjectId)?.settings.generator || { targetPoints: 150, minPointDistance: 5 },
    handleGeneratorSettingChange,
  };
};
