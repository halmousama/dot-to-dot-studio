declare let cv: any;

let isCvLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const loadOpenCV = (): Promise<void> => {
  if (isCvLoaded) {
    return Promise.resolve();
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.async = true;

    script.onload = () => {
      const checkCvReady = () => {
        if (typeof cv !== 'undefined' && cv.Mat) {
          isCvLoaded = true;
          loadingPromise = null;
          resolve();
        } else {
          setTimeout(checkCvReady, 50);
        }
      };
      checkCvReady();
    };

    script.onerror = () => {
      console.error('Failed to load OpenCV.js script.');
      loadingPromise = null;
      reject(new Error('Failed to load OpenCV.js script.'));
    };
    document.body.appendChild(script);
  });

  return loadingPromise;
};
