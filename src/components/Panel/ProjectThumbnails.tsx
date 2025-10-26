import { useAppState, useAppDispatch } from '../../context/hooks';
import { PlusCircle, X } from 'lucide-react';
import clsx from 'clsx';
import type { Project } from '../../context/types';

interface ImageData {
  dataUrl: string;
  width: number;
  height: number;
}

function ProjectThumbnails() {
  const { projects, activeProjectId } = useAppState();
  const dispatch = useAppDispatch();

  const loadImage = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve({ dataUrl: e.target?.result as string, width: img.width, height: img.height });
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of files) {
      try {
        const imageData = await loadImage(file);
        dispatch({ type: 'ADD_PROJECT', payload: { name: file.name, image: imageData } });
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    }
  };

  return (
    <div className="h-28 bg-white dark:bg-slate-800 p-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3 overflow-x-auto">
      {projects.map((project: Project) => (
        <div
          key={project.id}
          onClick={() => {
            dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });
          }}
          className={clsx(
            "h-24 w-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition-all relative group",
            activeProjectId === project.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-blue-300 dark:hover:border-blue-400'
          )}
        >
          <img
            src={project.image.dataUrl || ''}
            alt={project.name}
            className="w-full h-full object-cover"
          />

          <button
            onClick={(e) => handleDeleteProject(e, project.id)}
            className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center
                       text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
            title="Delete Project"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <label
        htmlFor="thumbnail-uploader"
        className="h-24 w-24 flex-shrink-0 rounded-md border-2 border-dashed border-slate-400 dark:border-slate-500
                   flex flex-col items-center justify-center text-slate-500 dark:text-slate-400
                   cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-500 dark:hover:border-slate-400 transition-colors"
      >
        <PlusCircle size={24} className="text-slate-500 dark:text-slate-400" />
        <span className="text-xs mt-1">Add Image</span>
      </label>
      <input
        id="thumbnail-uploader"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default ProjectThumbnails;
