import React from "react";
import "./Input.css";

/**
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.type]
 * @param {any} props.value
 * @param {(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {string} props.name
 * @param {boolean} [props.required]
 * @param {boolean} [props.textArea]
 * @param {string | number} [props.step]
 */
const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  required = false,
  textArea = false,
  step,
}) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
        </label>
      )}

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
          step={step}
        />
      )}
    </div>
  );
};

export default Input;
