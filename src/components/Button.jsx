import React from 'react';
import './Button.css';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {() => void} [props.onClick]
 * @param {'primary' | 'secondary' | 'danger' | 'outline'} [props.variant]
 * @param {'button' | 'submit' | 'reset'} [props.type]
 * @param {string} [props.className]
 */
const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '' }) => {
  return (
    <button 
      type={type} 
      className={`btn btn-${variant} ${className}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
