import Toolbar from '../Toolbar/Toolbar';
import ControlPanel from '../Panel/ControlPanel';
import CanvasArea from '../Canvas/CanvasArea';
import ProjectThumbnails from '../Panel/ProjectThumbnails';

function AppLayout() {
  return (
    <div className="h-screen w-screen bg-white dark:bg-slate-900 font-sans flex overflow-hidden">
      <ControlPanel />

      <div className="flex flex-1 flex-col relative">
        <div className="absolute top-0 left-0 w-full z-10">
          <Toolbar />
        </div>
        <CanvasArea />
        <div className="absolute bottom-0 left-0 w-full z-10">
          <ProjectThumbnails />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
