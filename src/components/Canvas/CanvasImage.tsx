import { useEffect, useState } from 'react';
import { Image } from 'react-konva';

interface CanvasImageProps {
  dataUrl: string | null;
  width: number;
  height: number;
  visible?: boolean;
}

function CanvasImage({ dataUrl, width, height, visible = true }: CanvasImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (dataUrl) {
      const img = new window.Image();
      img.src = dataUrl;
      img.onload = () => {
        setImage(img);
      };
    }
  }, [dataUrl]);

  if (!image) {
    return null;
  }

  return <Image image={image} width={width} height={height} visible={visible} />;
}

export default CanvasImage;
