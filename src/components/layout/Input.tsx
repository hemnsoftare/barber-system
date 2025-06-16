import { Icon } from "@/constants/icons";
import { InputProps } from "@/types";

const Input = ({
  label,
  icon,
  type = "text",
  placeholder = "",
  value,
  onChange,
  isTextArea = false,
  rows = 4,
  cols = 4,
  className = "",
  disabled = false,
  required = false,
  id,
  name,
  autoComplete,
  maxLength,
  minLength,
  readOnly = false,
  error,
  defaultData,
}: InputProps) => {
  const baseInputClasses =
    "w-full px-3 py-2 border-2 focus:outline-none   focus:border-2 transition-colors";
  const iconInputClasses = icon ? "pl-10" : "";
  const errorClasses = error
    ? "border-red-500 focus:ring-red-400"
    : "border-dark-purple focus:bg-dark-purple/5";

  const inputElement = isTextArea ? (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      id={name}
      name={name}
      autoComplete={autoComplete}
      maxLength={maxLength}
      minLength={minLength}
      disabled={disabled}
      cols={cols}
      required={required}
      readOnly={readOnly}
      className={`${baseInputClasses}  ${iconInputClasses} ${errorClasses} resize-vertical ${className}`}
      defaultValue={defaultData && defaultData}
    />
  ) : (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      name={name}
      autoComplete={autoComplete}
      maxLength={maxLength}
      minLength={minLength}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      className={`${baseInputClasses} ${iconInputClasses} ${errorClasses} ${className}`}
      defaultValue={defaultData && defaultData}
    />
  );

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block  font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={icon} className="text-dark-purple" />
          </div>
        )}
        {inputElement}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
