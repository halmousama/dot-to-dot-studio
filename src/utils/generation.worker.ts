declare const self: any & {
  importScripts: (url: string) => void;
};

try {
    self.importScripts('https://docs.opencv.org/4.x/opencv.js');
    self.importScripts('https://unpkg.com/simplify-js@1.2.4/simplify.js');
} catch (e) {
    console.error('[Worker] Failed to import scripts:', e);
}

declare let cv: any;
declare let simplify: any;

const librariesReadyPromise: Promise<[any, any]> = new Promise((resolve) => {
    const checkReady = () => {
        if (typeof cv !== 'undefined' && cv.Mat && typeof simplify !== 'undefined') {
            resolve([cv, simplify]);
        } else {
            setTimeout(checkReady, 50);
        }
    };
    checkReady();
});

const distance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

function thinning(srcMat: any, cvInstance: any) {
    const dst = srcMat.clone();
    const marker = new cvInstance.Mat.zeros(srcMat.rows, srcMat.cols, cvInstance.CV_8U);
    const thinned = dst;
    thinned.convertTo(thinned, cvInstance.CV_8U, 1.0/255.0);
    let changed = true;
    while(changed) {
        changed = false;
        for (let iter = 0; iter < 2; iter++) {
            for (let i = 1; i < thinned.rows - 1; i++) {
                for (let j = 1; j < thinned.cols - 1; j++) {
                    if (thinned.ucharPtr(i, j)[0] === 1) {
                        const p2 = thinned.ucharPtr(i - 1, j)[0];
                        const p3 = thinned.ucharPtr(i - 1, j + 1)[0];
                        const p4 = thinned.ucharPtr(i, j + 1)[0];
                        const p5 = thinned.ucharPtr(i + 1, j + 1)[0];
                        const p6 = thinned.ucharPtr(i + 1, j)[0];
                        const p7 = thinned.ucharPtr(i + 1, j - 1)[0];
                        const p8 = thinned.ucharPtr(i, j - 1)[0];
                        const p9 = thinned.ucharPtr(i - 1, j - 1)[0];
                        const A = Number(p2 === 0 && p3 === 1) + Number(p3 === 0 && p4 === 1) + Number(p4 === 0 && p5 === 1) + Number(p5 === 0 && p6 === 1) + Number(p6 === 0 && p7 === 1) + Number(p7 === 0 && p8 === 1) + Number(p8 === 0 && p9 === 1) + Number(p9 === 0 && p2 === 1);
                        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
                        let m1 = iter === 0 ? (p2 * p4 * p6 === 0) : (p2 * p4 * p8 === 0);
                        let m2 = iter === 0 ? (p4 * p6 * p8 === 0) : (p2 * p6 * p8 === 0);
                        if (A === 1 && (B >= 2 && B <= 6) && m1 && m2) {
                            marker.ucharPtr(i, j)[0] = 1;
                        }
                    }
                }
            }
            for (let i = 1; i < thinned.rows - 1; i++) {
                for (let j = 1; j < thinned.cols - 1; j++) {
                    if (marker.ucharPtr(i, j)[0] === 1) {
                        thinned.ucharPtr(i, j)[0] = 0;
                        changed = true;
                    }
                }
            }
            marker.setTo(new cvInstance.Scalar(0));
        }
    }
    thinned.convertTo(thinned, cvInstance.CV_8U, 255.0);
    marker.delete();
    return thinned;
}

function traceSkeleton(skeletonMat: any, cvInstance: any): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const visited = new cvInstance.Mat.zeros(skeletonMat.rows, skeletonMat.cols, cvInstance.CV_8U);
    let startPoint: { x: number; y: number } | null = null;
    for (let i = 0; i < skeletonMat.rows; i++) {
        for (let j = 0; j < skeletonMat.cols; j++) {
            if (skeletonMat.ucharPtr(i, j)[0] > 0) {
                startPoint = { x: j, y: i };
                break;
            }
        }
        if (startPoint) break;
    }
    if (!startPoint) return [];
    const stack: { x: number; y: number }[] = [startPoint];
    while(stack.length > 0) {
        const p = stack.pop()!;
        if (visited.ucharPtr(p.y, p.x)[0] === 1) continue;
        points.push(p);
        visited.ucharPtr(p.y, p.x)[0] = 1;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = p.x + dx;
                const ny = p.y + dy;
                if (nx >= 0 && nx < skeletonMat.cols && ny >= 0 && ny < skeletonMat.rows) {
                    if (skeletonMat.ucharPtr(ny, nx)[0] > 0 && visited.ucharPtr(ny, nx)[0] === 0) {
                        stack.push({ x: nx, y: ny });
                    }
                }
            }
        }
    }
    visited.delete();
    return points;
}

async function runGeneration(imageData: ImageData, options: any, cv: any, simplify: any) {
  const srcMat = cv.matFromImageData(imageData);

  const grayMat = new cv.Mat();
  cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY, 0);
  const binaryMat = new cv.Mat();
  cv.threshold(grayMat, binaryMat, 128, 255, cv.THRESH_BINARY_INV);

  const skeletonMat = thinning(binaryMat, cv);
  const tracedPath = traceSkeleton(skeletonMat, cv);

  if (tracedPath.length < 2) {
    srcMat.delete(); grayMat.delete(); binaryMat.delete(); skeletonMat.delete();
    return [];
  }

  const simplifiedPath = simplify(tracedPath, 1.5, true);

  let totalLength = 0;
  for (let i = 0; i < simplifiedPath.length - 1; i++) {
      totalLength += distance(simplifiedPath[i], simplifiedPath[i+1]);
  }

  let finalPoints: {x: number, y: number}[] = [];
  if (totalLength > 0) {
      const step = totalLength / (options.targetPoints - 1);
      if (isFinite(step) && step > 0) {
          let accumulatedLength = 0;
          let pathIndex = 0;
          finalPoints.push(simplifiedPath[0]);
          for (let i = 1; i < options.targetPoints - 1; i++) {
              const targetLength = i * step;
              while (accumulatedLength < targetLength && pathIndex < simplifiedPath.length - 1) {
                  accumulatedLength += distance(simplifiedPath[pathIndex], simplifiedPath[pathIndex + 1]);
                  pathIndex++;
              }
              finalPoints.push(simplifiedPath[pathIndex]);
          }
          finalPoints.push(simplifiedPath[simplifiedPath.length - 1]);
      } else {
          finalPoints = simplifiedPath;
      }
  }

  if (finalPoints.length < 2) {
    srcMat.delete(); grayMat.delete(); binaryMat.delete(); skeletonMat.delete();
    return finalPoints;
  }

  const minDistance = options.minPointDistance || 5;
  const spacedPoints = [finalPoints[0]];
  for (let i = 1; i < finalPoints.length; i++) {
    if (distance(finalPoints[i], spacedPoints[spacedPoints.length - 1]) >= minDistance) {
      spacedPoints.push(finalPoints[i]);
    }
  }

  srcMat.delete(); grayMat.delete(); binaryMat.delete(); skeletonMat.delete();
  return spacedPoints;
}

self.onmessage = async (e: MessageEvent) => {
  const { imageData, options } = e.data;

  try {
    const [cv, simplifyInstance] = await librariesReadyPromise;

    const testMat = new cv.Mat();
    testMat.delete();

    const resultPoints = await runGeneration(imageData, options, cv, simplifyInstance);

    self.postMessage({ status: 'success', points: resultPoints });

  } catch (error: any) {
    console.error('[Worker] An error occurred in onmessage:', error);
    self.postMessage({ status: 'error', message: error.message });
  }
};
