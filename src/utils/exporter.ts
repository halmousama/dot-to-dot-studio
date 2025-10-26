import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project } from '../context/types';

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'svg';
  includeBackground: boolean;
  includeNumbers: boolean;
}

function renderProjectToDataURL(project: Project, settings: ExportSettings): string {
  const stage = document.createElement('canvas');
  stage.width = project.image.width;
  stage.height = project.image.height;
  const ctx = stage.getContext('2d');

  if (!ctx) return '';

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, stage.width, stage.height);

  if (settings.includeBackground && project.image.dataUrl) {
    const img = new Image();
    img.src = project.image.dataUrl;
    ctx.drawImage(img, 0, 0);
  }

  if (project.settings.showPath && project.points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(project.points[0].x, project.points[0].y);
    project.points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = project.settings.lineColor;
    ctx.lineWidth = project.settings.lineWidth;
    ctx.stroke();
  }

  project.points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, project.settings.dotSize, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = project.settings.dotColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (settings.includeNumbers) {
      ctx.fillStyle = project.settings.dotColor;
      ctx.font = `bold ${project.settings.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(p.number), p.x, p.y);
    }
  });

  return stage.toDataURL(`image/${settings.format}`);
}

export function exportSingleProject(project: Project, settings: ExportSettings) {
  const dataUrl = renderProjectToDataURL(project, settings);
  saveAs(dataUrl, `${project.name.split('.')[0]}.${settings.format}`);
}

export async function exportAllAsPDF(projects: Project[], settings: ExportSettings) {
  const firstProject = projects[0];
  const orientation = firstProject.image.width > firstProject.image.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'px',
    format: [firstProject.image.width, firstProject.image.height]
  });

  pdf.deletePage(1);

  projects.forEach((project) => {
    pdf.addPage([project.image.width, project.image.height], project.image.width > project.image.height ? 'l' : 'p');

    const dataUrl = renderProjectToDataURL(project, { ...settings, format: 'jpeg' });

    pdf.addImage(dataUrl, 'JPEG', 0, 0, project.image.width, project.image.height);
  });

  pdf.save('dot-to-dot_collection.pdf');
}

export async function exportAllAsZIP(projects: Project[], settings: ExportSettings) {
  const zip = new JSZip();

  projects.forEach(project => {
    const dataUrl = renderProjectToDataURL(project, settings);
    const base64Data = dataUrl.split(',')[1];
    zip.file(`${project.name.split('.')[0]}.${settings.format}`, base64Data, { base64: true });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'dot-to-dot_collection.zip');
}
