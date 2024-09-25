import React from 'react';

interface ModalProps {
  title: string;
  message: string;
  buttonLabel: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, message, buttonLabel, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl mb-4">{title}</h2>
        <p>{message}</p>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4"
          onClick={onClose}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default Modal;
