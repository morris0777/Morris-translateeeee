import { useState, useEffect, useRef, useCallback } from 'react';
import Tesseract from 'tesseract.js';

interface UseScreenOCROptions {
  targetLanguage?: string;
  onTextDetected?: (text: string) => void;
  scanInterval?: number; // ms between scans
  enabled?: boolean;
}

export function useScreenOCR({
  targetLanguage = 'spa', // Spanish for Tesseract
  onTextDetected,
  scanInterval = 2000,
  enabled = false,
}: UseScreenOCROptions) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastDetectedText, setLastDetectedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousTextRef = useRef<string>('');

  // Initialize video and canvas elements
  useEffect(() => {
    if (!videoRef.current) {
      videoRef.current = document.createElement('video');
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
    }
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Start screen capture
  const startCapture = useCallback(async () => {
    try {
      setError(null);
      
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      } as DisplayMediaStreamOptions);

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCapturing(true);

      // Handle stream ending (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };

      return true;
    } catch (err) {
      console.error('Screen capture error:', err);
      setError('No se pudo capturar la pantalla. Asegúrate de seleccionar la pantalla completa.');
      return false;
    }
  }, []);

  // Stop screen capture
  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
    setProgress(0);
  }, []);

  // Capture frame and perform OCR
  const captureAndOCR = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCapturing) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Crop to subtitle area (bottom 20% of screen)
      const subtitleHeight = canvas.height * 0.20;
      const subtitleY = canvas.height - subtitleHeight;
      
      // Create a cropped canvas for subtitle area
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = canvas.width;
      croppedCanvas.height = subtitleHeight;
      const croppedCtx = croppedCanvas.getContext('2d');
      
      if (!croppedCtx) return;
      
      croppedCtx.drawImage(
        canvas,
        0, subtitleY, canvas.width, subtitleHeight,
        0, 0, croppedCanvas.width, croppedCanvas.height
      );

      // Perform OCR with Tesseract
      const result = await Tesseract.recognize(
        croppedCanvas,
        targetLanguage,
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          },
        }
      );

      const detectedText = result.data.text.trim();

      // Only process if text changed
      if (detectedText && detectedText !== previousTextRef.current) {
        previousTextRef.current = detectedText;
        setLastDetectedText(detectedText);
        
        if (onTextDetected) {
          onTextDetected(detectedText);
        }
      }

      setIsProcessing(false);
    } catch (err) {
      console.error('OCR error:', err);
      setError('Error al procesar la imagen');
      setIsProcessing(false);
    }
  }, [isCapturing, targetLanguage, onTextDetected]);

  // Start/stop periodic scanning
  useEffect(() => {
    if (isCapturing && enabled) {
      // Start scanning
      intervalRef.current = setInterval(() => {
        captureAndOCR();
      }, scanInterval);

      // Do first scan immediately
      captureAndOCR();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCapturing, enabled, scanInterval, captureAndOCR]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    isCapturing,
    isProcessing,
    progress,
    lastDetectedText,
    error,
    startCapture,
    stopCapture,
    captureAndOCR,
  };
}
