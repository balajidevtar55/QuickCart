import React, { useEffect, useState } from "react";
import { ShoppingCart, Scan, Package, CheckCircle, Clock } from "lucide-react";
import {QRScanner} from "./QRScanner.jsx"
export const CustomerDashboard = () => {
  const [user, setUser] = useState({ name: "Sarah" });
  const [cartCount, setCartCount] = useState(3);
  const [cartTotal, setCartTotal] = useState(1847);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const openScanner = () => {
   setScannerOpen(true)
  };

    const handleScan = (code) => {
    setScannedCode(code);
    setScannerOpen(false);
    
    // Auto-clear after 5 seconds
    setTimeout(() => setScannedCode(null), 5000);
  };

  const recentOrders = [
    { id: "ORD1023", total: 1240, status: "Delivered", date: "Nov 24, 2025" },
    { id: "ORD1022", total: 540, status: "Processing", date: "Nov 23, 2025" },
    { id: "ORD1021", total: 890, status: "Delivered", date: "Nov 20, 2025" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{user?.name}</h2>
              <p className="text-xs text-gray-500">Premium Member</p>
            </div>
          </div>
          
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to shop? Scan products for instant checkout.
          </p>
        </div>

        {/* Main Action Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Scan className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Quick Scan</h2>
              </div>
              <p className="text-blue-100 mb-6">
                Use your camera to scan product barcodes and add them to your cart instantly
              </p>
              <button
                onClick={openScanner}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Scan className="w-5 h-5" />
                Start Scanning
              </button>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
              Your Cart
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl">
              <p className="text-gray-600 text-sm mb-1">Items in Cart</p>
              <p className="text-3xl font-bold text-indigo-600">{cartCount}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl">
              <p className="text-gray-600 text-sm mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-green-600">₹{cartTotal}</p>
            </div>

            <div className="flex items-center justify-center">
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Recent Orders
          </h2>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-gray-800 text-lg">{order.id}</p>
                      {order.status === "Delivered" ? (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Delivered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                          <Clock className="w-4 h-4" />
                          Processing
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{order.date}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-500 text-sm mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-800">₹{order.total}</p>
                  </div>

                  <button className="border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
};

export default CustomerDashboard;