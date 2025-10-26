import React, { useReducer } from "react";
import type {
  Project,
  AppState,
  Action,
  Point,
  ProjectSettings,
} from "./types";
import { AppStateContext, AppDispatchContext } from "./hooks";

const defaultSettings: ProjectSettings = {
  dotSize: 8,
  fontSize: 10,
  lineWidth: 2,
  dotColor: "#000000",
  lineColor: "#000000",
  showImage: true,
  showNumbers: true,
  showPath: true,
  generator: {
    targetPoints: 150,
    minPointDistance: 5,
  },
  eraseRadius: 20,
};

const initialState: AppState = {
  projects: [],
  activeProjectId: null,
  activeTool: "SELECT",
  isGenerating: false,
};
const appReducer = (state: AppState, action: Action): AppState => {
  const recordHistoryForActiveProject = (
    projects: Project[],
    activeId: string | null
  ): Project[] => {
    return projects.map((p) => {
      if (p.id !== activeId) return p;

      const newStack = p.history.stack.slice(0, p.history.index + 1);

      return {
        ...p,
        history: {
          stack: [...newStack, p.points],
          index: newStack.length,
        },
      };
    });
  };

  switch (action.type) {
    case "SET_ACTIVE_TOOL":
      if (state.isGenerating) return state;
      return { ...state, activeTool: action.payload };

    case "SET_ACTIVE_PROJECT":
      return { ...state, activeProjectId: action.payload };

    case "SET_IS_GENERATING":
      return { ...state, isGenerating: action.payload };

    case "SET_GENERATED_POINTS": {
      if (!state.activeProjectId) return { ...state, isGenerating: false };

      const projectsWithNewPoints = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;

        const newPoints: Point[] = action.payload.map((pt, index) => ({
          ...pt,
          id: `point_${Date.now()}_${index}`,
          number: index + 1,
        }));

        return { ...p, points: newPoints };
      });

      const projectsWithHistory = recordHistoryForActiveProject(
        projectsWithNewPoints,
        state.activeProjectId
      );

      return { ...state, projects: projectsWithHistory, isGenerating: false };
    }

    case "UPDATE_PROJECT_SETTINGS": {
      if (!state.activeProjectId) return state;
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        const newSettings = { ...p.settings };
        if ("generator" in action.payload) {
          newSettings.generator = {
            ...p.settings.generator,
            ...action.payload.generator,
          };
          delete (action.payload as Partial<ProjectSettings>).generator;
        }
        Object.assign(newSettings, action.payload);

        return { ...p, settings: newSettings };
      });
      return { ...state, projects: updatedProjects };
    }

    case "ADD_PROJECT": {
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: action.payload.name || "Untitled Project",
        image: action.payload.image,
        points: [],
        history: {
          stack: [[]],
          index: 0,
        },
        settings: defaultSettings,
      };
      return {
        ...state,
        projects: [...state.projects, newProject],
        activeProjectId: newProject.id,
      };
    }

    case "ADD_POINT":
    case "DELETE_POINT":
    case "START_POINT_MOVE": {
      let projectsAfterAction = state.projects;

      if (action.type === "START_POINT_MOVE") {
        projectsAfterAction = state.projects;
      } else if (action.type === "ADD_POINT") {
        projectsAfterAction = state.projects.map((p) => {
          if (p.id !== state.activeProjectId) return p;
          const newPoint: Point = {
            id: `point_${Date.now()}`,
            x: action.payload.x,
            y: action.payload.y,
            number: p.points.length + 1,
          };
          return { ...p, points: [...p.points, newPoint] };
        });
      } else if (action.type === "DELETE_POINT") {
        projectsAfterAction = state.projects.map((p) => {
          if (p.id !== state.activeProjectId) return p;
          const filtered = p.points.filter((pt) => pt.id !== action.payload);
          return {
            ...p,
            points: filtered.map((pt, i) => ({ ...pt, number: i + 1 })),
          };
        });
      }

      const projectsWithNewHistory = recordHistoryForActiveProject(
        projectsAfterAction,
        state.activeProjectId
      );
      return { ...state, projects: projectsWithNewHistory };
    }

    case "MOVE_POINT": {
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        return {
          ...p,
          points: p.points.map((pt) =>
            pt.id === action.payload.pointId
              ? {
                  ...pt,
                  x: action.payload.newCoords.x,
                  y: action.payload.newCoords.y,
                }
              : pt
          ),
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case "END_POINT_MOVE": {
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        const newPoints = p.points.map((pt) =>
          pt.id === action.payload.pointId
            ? {
                ...pt,
                x: action.payload.newCoords.x,
                y: action.payload.newCoords.y,
              }
            : pt
        );

        const lastHistoryState = p.history.stack.slice(0, p.history.index + 1);
        lastHistoryState[p.history.index] = newPoints;

        return {
          ...p,
          points: newPoints,
          history: {
            ...p.history,
            stack: lastHistoryState,
          },
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case "UNDO": {
      const newProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId || p.history.index <= 0) return p;

        const newIndex = p.history.index - 1;
        return {
          ...p,
          points: p.history.stack[newIndex],
          history: { ...p.history, index: newIndex },
        };
      });
      return { ...state, projects: newProjects };
    }

    case "REDO": {
      const newProjects = state.projects.map((p) => {
        if (
          p.id !== state.activeProjectId ||
          p.history.index >= p.history.stack.length - 1
        )
          return p;

        const newIndex = p.history.index + 1;
        return {
          ...p,
          points: p.history.stack[newIndex],
          history: { ...p.history, index: newIndex },
        };
      });
      return { ...state, projects: newProjects };
    }

    case "DELETE_MULTIPLE_POINTS": {
      const projectsAfterAction = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        const idsToDelete = new Set(action.payload);
        const filtered = p.points.filter((pt) => !idsToDelete.has(pt.id));
        return {
          ...p,
          points: filtered.map((pt, i) => ({ ...pt, number: i + 1 })),
        };
      });
      const projectsWithNewHistory = recordHistoryForActiveProject(
        projectsAfterAction,
        state.activeProjectId
      );
      return { ...state, projects: projectsWithNewHistory };
    }

    case 'DELETE_PROJECT': {
      const remainingProjects = state.projects.filter(p => p.id !== action.payload);

      let nextActiveId: string | null = state.activeProjectId;

      if (state.activeProjectId === action.payload) {
        if (remainingProjects.length > 0) {
          const originalIndex = state.projects.findIndex(p => p.id === action.payload);
          const newIndex = Math.max(0, originalIndex - 1);
          nextActiveId = remainingProjects[newIndex]?.id || remainingProjects[0].id;
        } else {
          nextActiveId = null;
        }
      }

      return {
        ...state,
        projects: remainingProjects,
        activeProjectId: nextActiveId,
      };
    }

    default:
      return state;
  }
};
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};
