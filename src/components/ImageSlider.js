import React, { useRef, useEffect, useState, useCallback } from 'react';
import './ImageSlider.css';

const ImageSlider = ({ fixedCanvasWidth, fixedCanvasHeight, images }) => {
  // Refs for the canvas element and image context
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);

  // State for tracking drag interaction
  const [isDragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  // Ref for storing loaded images
  const contextRef = useRef(null);

  // Function to set canvas dimensions
  const setCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    canvas.width = fixedCanvasWidth;
    canvas.height = fixedCanvasHeight;
  }, [fixedCanvasWidth, fixedCanvasHeight]);

  // Adjusts the size of each image to fit within the specified container dimensions.
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

  // Draws images on the canvas based on the current state and loaded images.
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const containerWidth = fixedCanvasWidth;
    const containerHeight = fixedCanvasHeight;
    const totalImagesWidth = imagesRef.current.length * containerWidth;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background
    context.fillStyle = 'rgb(242, 242, 242)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    imagesRef.current.forEach((img, index) => {
      const imageX = (index * containerWidth + offsetX) % totalImagesWidth;

      if (imageX < -containerWidth || imageX > canvas.width) {
        // Skip drawing images that are completely outside the canvas
        return;
      }

      const startImageX = (canvas.width - img.width) / 2 + imageX;
      const imageY = (containerHeight - img.height) / 2;

      // Fill background for each image
      context.fillStyle = 'rgb(242, 242, 242)';
      context.fillRect(startImageX, 0, img.width, canvas.height);

      // Draw the image
      context.drawImage(img, startImageX, imageY, img.width, img.height);
    });
  }, [fixedCanvasWidth, fixedCanvasHeight, offsetX, imagesRef]);

  // Event handlers

  // Handles the mouse down event, initiating the dragging state and storing the start position.
  const handleMouseDown = (e) => {
    setDragging(true);
    setStartX(e.clientX);
  };

  // Handles the mouse up event, ending the dragging state.
  const handleMouseUp = () => {
    setDragging(false);
  };

  // Handles the mouse move event during dragging, updating the offset and redrawing images.
  const handleMouseMove = useCallback(
    (e) => {
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
    },
    [isDragging, startX, fixedCanvasWidth, offsetX, drawImage]
  );

  // Set up event listeners and load images on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    contextRef.current = canvas.getContext('2d');

    /**
     * Asynchronously loads images, sets up canvas dimensions, adjusts image sizes,
     * and draws images on the canvas.
     */
    const loadImages = async () => {
      try {
        const loadedImages = await Promise.all(
          images.map((path) => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = (error) => reject(error);
              img.src = path;
            });
          })
        );

        imagesRef.current = loadedImages;
        setCanvasDimensions();
        adjustImageSizes();
        drawImage();
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();

    // Event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Clean up event listeners
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [
    adjustImageSizes,
    drawImage,
    handleMouseMove,
    images,
    setCanvasDimensions,
  ]);

  // Reset offsetX on mount
  useEffect(() => {
    setOffsetX(0);
  }, []);

  // Redraw when necessary dependencies change
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
