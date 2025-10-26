import type { Point } from '../context/types';

export interface GeneratorOptions {
  targetPoints: number;
  minPointDistance: number;
}

let worker: Worker | null = null;

const dataUrlToImageData = (dataUrl: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get 2d context'));
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, img.width, img.height));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

export const generatePointsWithWorker = async (
  imageDataUrl: string,
  options: GeneratorOptions
): Promise<Omit<Point, 'id' | 'number'>[]> => {

  const imageData = await dataUrlToImageData(imageDataUrl);

  return new Promise((resolve, reject) => {
    if (!worker) {
      worker = new Worker(new URL('./generation.worker.ts', import.meta.url), {
        type: 'classic'
      });
    }

    worker.onmessage = (e) => {
      const { status, points, message } = e.data;
      if (status === 'success') {
        resolve(points);
      } else {
        reject(new Error(message));
      }
    };

    worker.onerror = (e) => {
      reject(new Error(`Worker error: ${e.message}`));
    };

    worker.postMessage({ imageData, options }, [imageData.data.buffer]);
  });
};

export const generatePointsOpenCV = async (
  imageDataUrl: string,
  options: GeneratorOptions
): Promise<Omit<Point, 'id' | 'number'>[]> => {
  return generatePointsWithWorker(imageDataUrl, options);
};
