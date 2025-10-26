export interface Point {
  id: string;
  x: number;
  y: number;
  number: number;
}

export interface GeneratorSettings {
  targetPoints: number;
  minPointDistance: number;
}

export interface ProjectSettings {
  dotSize: number;
  fontSize: number;
  lineWidth: number;
  dotColor: string;
  lineColor: string;
  showImage: boolean;
  showNumbers: boolean;
  showPath: boolean;
  generator: GeneratorSettings;
  eraseRadius: number;
}

export interface Project {
  id: string;
  name: string;
  image: {
    dataUrl: string | null;
    width: number;
    height: number;
  };
  points: Point[];
  history: {
    stack: Point[][];
    index: number;
  };
  settings: ProjectSettings;
}

export type Action =
  | { type: "SET_ACTIVE_TOOL"; payload: string }
  | { type: "ADD_PROJECT"; payload: Pick<Project, "name" | "image"> }
  | { type: "SET_ACTIVE_PROJECT"; payload: string }
  | { type: "ADD_POINT"; payload: { x: number; y: number } }
  | { type: "START_POINT_MOVE"; payload: { pointId: string } }
  | {
      type: "MOVE_POINT";
      payload: { pointId: string; newCoords: { x: number; y: number } };
    }
  | {
      type: "END_POINT_MOVE";
      payload: { pointId: string; newCoords: { x: number; y: number } };
    }
  | { type: "DELETE_POINT"; payload: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "UPDATE_PROJECT_SETTINGS"; payload: Partial<ProjectSettings> }
  | { type: "SET_GENERATED_POINTS"; payload: Omit<Point, "id" | "number">[] }
  | { type: "SET_IS_GENERATING"; payload: boolean }
  | { type: "DELETE_MULTIPLE_POINTS"; payload: string[] }
  | { type: "CLEAR_ALL_POINTS" }
  | { type: "DELETE_PROJECT"; payload: string };

export interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  activeTool: string;
  isGenerating: boolean;
}
