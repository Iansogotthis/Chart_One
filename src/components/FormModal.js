import React from 'react';
import FormPage from './form_page.jsx';

const FormModal = ({ isOpen, onClose, mode, squareData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        {mode === 'include' ? (
          <FormPage squareData={squareData} />
        ) : (
          <form>
            <h2>Exclude Data</h2>
            <label htmlFor="data">Data:</label>
            <input type="text" id="data" name="data" required /><br /><br />
            <button type="submit">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FormModal;