import React, { useState } from 'react';
import { CustomerSnackbar } from '@/components/CustomerLayout';
import { motion } from 'framer-motion';

export default function SnackbarTest() {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  
  const handleShowSnackbar = (success: boolean = true) => {
    setIsSuccess(success);
    setShowSnackbar(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => handleShowSnackbar(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Show Success Snackbar
        </button>
        
        <button
          onClick={() => handleShowSnackbar(false)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Show Error Snackbar
        </button>
        
        <button
          onClick={() => setShowDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Dialog
        </button>
      </div>
      
      <div className="text-gray-700">
        <p className="mb-4">
          This component tests the snackbar positioning in different scenarios:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Success snackbar</li>
          <li>Error snackbar</li>
          <li>Snackbar with dialog open</li>
        </ul>
      </div>
      
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
              
              <div className="flex gap-4">
                <button
                  onClick={() => handleShowSnackbar(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Show Success Snackbar
                </button>
                
                <button
                  onClick={() => handleShowSnackbar(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Show Error Snackbar
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
        message={isSuccess ? "This is a success message" : "This is an error message"}
        isOpen={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        isSuccess={isSuccess}
      />
    </div>
  );
}
