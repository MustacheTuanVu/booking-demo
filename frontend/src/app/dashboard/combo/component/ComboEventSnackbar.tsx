import React from 'react';

interface ComboEventSnackbarProps {
  message: string;
  onClose: () => void;
}

const ComboEventSnackbar: React.FC<ComboEventSnackbarProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-2 rounded shadow-lg flex items-center">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-sm underline"
      >
        Đóng
      </button>
    </div>
  );
};

export default ComboEventSnackbar;