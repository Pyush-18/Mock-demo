import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Choose an option...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-3">
          {label}
        </label>
      )}
      <button
        type="button"
        className={`w-full flex justify-between items-center px-5 py-4 bg-[#0f0f0f] rounded-xl text-white transition-all shadow-xl 
                    ${
                      isOpen
                        ? "border border-emerald-500 ring-2 ring-emerald-500/50"
                        : "border border-emerald-900/40 hover:bg-[#151515] hover:border-emerald-700/50"
                    }
                `}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? "font-medium" : "text-gray-500 italic"}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-emerald-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-xl bg-[#1a1a1a] border border-emerald-500 shadow-2xl `}>
          <ul className="p-1" role="listbox">
            <li
              className="text-gray-500 italic px-4 py-3 cursor-pointer select-none hover:bg-emerald-900/20 rounded-lg transition-colors text-sm"
              onClick={() => handleSelect(null)}
              role="option"
            >
              {placeholder}
            </li>
            {options.map((option) => (
              <li
                key={option.value}
                className={`flex justify-between items-center px-4 py-3 cursor-pointer select-none rounded-lg transition-colors text-white 
            ${
              option.value === value
                ? "bg-emerald-800/50 font-semibold"
                : "hover:bg-emerald-900/20"
            }
        `}
                onClick={() => handleSelect(option.value)}
                role="option"
              >
                {option.label}
                {option.value === value && (
                  <Check
                    className="h-4 w-4 text-emerald-400"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;