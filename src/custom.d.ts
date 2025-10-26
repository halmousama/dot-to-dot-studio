declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    rightangleenhance?: boolean;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    grouping?: number;
    groupmode?: 'majority' | 'intensity' | 'none';
    roundcoords?: number;
    lcpr?: number;
    qcpr?: number;
    desc?: boolean;
    initvectors?: string;
  }

  interface ImageTracer {
    imageToSVG(url: string, options?: ImageTracerOptions): string;
    imageToSVG(url: string, callback: (svgString: string) => void, options?: ImageTracerOptions): void;
  }

  const ImageTracer: ImageTracer;
  export default ImageTracer;
}
