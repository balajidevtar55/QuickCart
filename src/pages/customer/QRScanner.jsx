import React, { useState, useRef, useEffect } from "react";
import { X, Camera, Zap, RefreshCw, Scan, AlertCircle } from "lucide-react";

export const QRScanner = ({ isOpen, onClose, onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanStatus, setScanStatus] = useState("Initializing...");
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const jsQRRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadJsQR();
    }
    return () => {
      stopCamera();
      stopScanning();
    };
  }, [isOpen]);

  const loadJsQR = () => {
    // Load jsQR library from CDN
    if (!window.jsQR) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js';
      script.onload = () => {
        jsQRRef.current = window.jsQR;
        startCamera();
      };
      script.onerror = () => {
        setError("Failed to load QR scanner library");
        setScanStatus("Library load failed. Use manual entry.");
      };
      document.body.appendChild(script);
    } else {
      jsQRRef.current = window.jsQR;
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setScanning(true);
          setScanStatus("🔍 Point camera at QR code");
          setError(null);
          startAutoScan();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or not available");
      setScanStatus("❌ Camera not accessible");
      alert("Camera access required. Please:\n1. Allow camera permission\n2. Use HTTPS connection\n3. Or use manual entry below");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const startAutoScan = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    
    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (jsQRRef.current) {
          const code = jsQRRef.current(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code && code.data) {
            setScanStatus("✅ QR Code Detected!");
            
            // Vibration feedback
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
            
            // Visual feedback - draw detection box
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 4;
            ctx.strokeRect(
              code.location.topLeftCorner.x,
              code.location.topLeftCorner.y,
              code.location.bottomRightCorner.x - code.location.topLeftCorner.x,
              code.location.bottomRightCorner.y - code.location.topLeftCorner.y
            );
            
            stopScanning();
            stopCamera();
            
            setTimeout(() => {
              onScan(code.data);
            }, 500);
            
            return;
          } else {
            setScanStatus("🔍 Scanning... (Point QR code at camera)");
          }
        }
      }
      
      scanIntervalRef.current = requestAnimationFrame(scan);
    };
    
    scan();
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      cancelAnimationFrame(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const handleManualScan = () => {
    if (manualCode.trim()) {
      stopScanning();
      stopCamera();
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  const restartCamera = () => {
    stopCamera();
    stopScanning();
    setScanStatus("Restarting...");
    setTimeout(() => startCamera(), 300);
  };

  const handleDemoScan = (code) => {
    stopScanning();
    stopCamera();
    onScan(code);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-scale-in max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-3xl">
          <button
            onClick={() => {
              stopCamera();
              stopScanning();
              onClose();
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Scan className={`w-7 h-7 text-white ${scanning ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">QR Code Scanner</h2>
              <p className="text-blue-100 text-sm">Using jsQR library</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          
          {/* Camera View */}
          <div className="relative bg-black rounded-2xl overflow-hidden mb-4 shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-80 object-cover"
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
            
            {/* Scanner Overlay */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-56 h-56">
                  {/* Animated Corner Borders */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-400 rounded-tl-2xl animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-400 rounded-tr-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-400 rounded-bl-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-400 rounded-br-2xl animate-pulse"></div>
                  
                  {/* Center Square */}
                  <div className="absolute inset-0 border-2 border-white border-opacity-30 rounded-xl"></div>
                  
                  {/* Scanning Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                </div>
              </div>
            )}

            {/* Status Bar */}
            <div className="absolute top-4 left-0 right-0 flex justify-center px-4">
              <div className={`${error ? 'bg-red-600' : 'bg-black'} bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-full max-w-full`}>
                <span className="text-white text-sm font-medium break-words">{error || scanStatus}</span>
              </div>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
              {scanning && (
                <div className="bg-black bg-opacity-60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Scanning Active</span>
                </div>
              )}
              
              <button
                onClick={restartCamera}
                className="bg-black bg-opacity-60 backdrop-blur-sm hover:bg-opacity-80 p-2 rounded-full transition-all"
                title="Restart Camera"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Camera Issue</p>
                  <p className="text-xs text-red-700">
                    Make sure you're using HTTPS and have granted camera permissions. 
                    You can still use manual entry or demo codes below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              How to scan
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Hold QR code 6-12 inches from camera</li>
              <li>• Keep QR code within the green frame</li>
              <li>• Ensure good lighting</li>
              <li>• QR code will be detected automatically</li>
            </ul>
          </div>

          {/* Manual Entry */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Manual Entry (If camera doesn't work)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                placeholder="Paste or type QR code data"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleManualScan}
                disabled={!manualCode.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Demo QR Codes */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              🎯 Test with Demo Codes
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => handleDemoScan("PRODUCT-SKU-12345")}
                className="bg-white hover:bg-purple-100 border-2 border-purple-300 text-purple-700 px-4 py-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                📦 Product
              </button>
              <button
                onClick={() => handleDemoScan("ORDER-#2024-001")}
                className="bg-white hover:bg-purple-100 border-2 border-purple-300 text-purple-700 px-4 py-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                🛒 Order
              </button>
              <button
                onClick={() => handleDemoScan("https://example.com/user/123")}
                className="bg-white hover:bg-purple-100 border-2 border-purple-300 text-purple-700 px-4 py-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                🔗 URL
              </button>
              <button
                onClick={() => handleDemoScan("PAYMENT-REF-XYZ789")}
                className="bg-white hover:bg-purple-100 border-2 border-purple-300 text-purple-700 px-4 py-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                💳 Payment
              </button>
            </div>
            <p className="text-xs text-purple-700 text-center">
              Click to simulate QR scanning instantly
            </p>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        @keyframes scan {
          0%, 100% {
            top: 0;
          }
          50% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
