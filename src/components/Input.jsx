import React from 'react';
import './Input.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, name, required = false, textArea = false }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label" htmlFor={name}>{label}</label>}
      
      {textArea ? (
        <textarea
          id={name}
          name={name}
          className="input-field textarea-field"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          className="input-field"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

export default Input;
