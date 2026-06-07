"use client";

import React, { useState } from 'react';
import { CustomerPageLayout, CustomerCard, CustomerSnackbar } from '@/components/CustomerLayout';
import { motion } from 'framer-motion';

export default function SnackbarTestPage() {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("This is a test message");
  
  const handleShowSnackbar = (success: boolean = true, message: string = "This is a test message") => {
    setIsSuccess(success);
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  return (
    <CustomerPageLayout
      title="Snackbar Test"
      subtitle="Test page for snackbar positioning"
      description="This page is used to test snackbar positioning in different scenarios."
      isLoading={false}
    >
      <CustomerCard title="Snackbar Test Controls" className="mb-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Test Snackbar Positioning</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleShowSnackbar(true, "Success message example")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Show Success Snackbar
              </button>
              
              <button
                onClick={() => handleShowSnackbar(false, "Error message example")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Show Error Snackbar
              </button>
              
              <button
                onClick={() => setShowDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Dialog
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Custom Message</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={snackbarMessage}
                onChange={(e) => setSnackbarMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom message"
              />
              <button
                onClick={() => handleShowSnackbar(true, snackbarMessage)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show Custom Snackbar
              </button>
            </div>
          </div>
        </div>
      </CustomerCard>
      
      <CustomerCard title="Test Information">
        <div className="space-y-4">
          <p className="text-gray-700">
            This page tests the snackbar positioning in different scenarios:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Success snackbar - Green icon, success message</li>
            <li>Error snackbar - Red icon, error message</li>
            <li>Snackbar with dialog open - Tests z-index and positioning</li>
            <li>Custom message - Test with different message lengths</li>
          </ul>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <p className="text-yellow-700">
              <strong>Note:</strong> The snackbar should always be visible and properly positioned regardless of screen size or whether a dialog is open.
            </p>
          </div>
        </div>
      </CustomerCard>
      
      {/* Test Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Test Dialog</h3>
              <button
                onClick={() => setShowDialog(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                This is a test dialog to verify snackbar positioning when dialogs are open.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleShowSnackbar(true, "Success message with dialog open")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Show Success Snackbar
                </button>
                
                <button
                  onClick={() => handleShowSnackbar(false, "Error message with dialog open")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Show Error Snackbar
                </button>
                
                <button
                  onClick={() => handleShowSnackbar(true, "This is a very long message that tests how the snackbar handles long content and whether it wraps properly on different screen sizes.")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show Long Message
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Snackbar */}
      <CustomerSnackbar
        message={snackbarMessage}
        isOpen={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        isSuccess={isSuccess}
      />
    </CustomerPageLayout>
  );
}
