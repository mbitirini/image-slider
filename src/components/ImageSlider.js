import React, { useRef, useEffect, useState, useCallback } from 'react';
import './ImageSlider.css';

const ImageSlider = ({ fixedCanvasWidth, fixedCanvasHeight, images }) => {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const contextRef = useRef(null);

  const [isDragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const setCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    canvas.width = fixedCanvasWidth;
    canvas.height = fixedCanvasHeight;
  }, [fixedCanvasWidth, fixedCanvasHeight]);

  const adjustImageSizes = useCallback(() => {
    const containerWidth = fixedCanvasWidth;
    const containerHeight = fixedCanvasHeight;

    imagesRef.current.forEach((img) => {
      const imgAspectRatio = img.width / img.height;

      if (img.width > containerWidth || img.height > containerHeight) {
        if (imgAspectRatio > containerWidth / containerHeight) {
          img.width = containerWidth;
          img.height = containerWidth / imgAspectRatio;
        } else {
          img.height = containerHeight;
          img.width = containerHeight * imgAspectRatio;
        }
      }
    });
  }, [fixedCanvasWidth, fixedCanvasHeight, imagesRef]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const containerWidth = fixedCanvasWidth;
    const containerHeight = fixedCanvasHeight;
    const totalImagesWidth = imagesRef.current.length * containerWidth;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'rgb(242, 242, 242)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    imagesRef.current.forEach((img, index) => {
      const imageX = (index * containerWidth + offsetX) % totalImagesWidth;

      if (imageX < -containerWidth || imageX > canvas.width) {
        return;
      }

      const startImageX = (canvas.width - img.width) / 2 + imageX;
      const imageY = (containerHeight - img.height) / 2;

      context.fillStyle = 'rgb(242, 242, 242)';
      context.fillRect(startImageX, 0, img.width, canvas.height);

      context.drawImage(img, startImageX, imageY, img.width, img.height);
    });
  }, [fixedCanvasWidth, fixedCanvasHeight, offsetX, imagesRef]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleCanvasMouseLeave = () => {
    setDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    contextRef.current = canvas.getContext('2d');

    // Handles the mouse move event during dragging, updating the offset and redrawing images.
    const handleMouseMove = (e) => {
      if (isDragging) {
        const x = e.clientX;
        const dx = x - startX;
        const totalImagesWidth = imagesRef.current.length * fixedCanvasWidth;
        const canvasWidth = canvasRef.current.width;

        if (offsetX + dx >= 0) {
          setOffsetX(0);
        } else if (offsetX + dx <= canvasWidth - totalImagesWidth) {
          setOffsetX(canvasWidth - totalImagesWidth);
        } else {
          setOffsetX(offsetX + dx);
        }

        drawImage();
        setStartX(x);
      }
    };

    const loadImage = (index) => {
      if (index < images.length) {
        const img = new Image();
        img.onload = () => {
          imagesRef.current.push(img);
          loadImage(index + 1);
        };
        img.src = images[index];
      } else {
        setCanvasDimensions();
        adjustImageSizes();
        drawImage();
      }
    };

    window.onload = () => {
      loadImage(0);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);

    return () => {
      window.onload = null;
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleCanvasMouseLeave);
    };
  }, [
    isDragging,
    images,
    fixedCanvasWidth,
    setCanvasDimensions,
    adjustImageSizes,
    drawImage,
    startX,
    offsetX,
  ]);

  useEffect(() => {
    setOffsetX(0);
  }, []);

  useEffect(() => {
    drawImage();
  }, [offsetX, images, drawImage]);

  return (
    <canvas
      ref={canvasRef}
      className={`image_slider ${isDragging ? 'drag-active' : ''}`}
    />
  );
};

export default ImageSlider;
