import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import "./inputAuthField.css";
import { useState } from 'react';

const InputAuthField = ({id, className = "", label, type = "text", value, onChange, onKeyDown, 
                          autofocus = false, required = false, disabled = false, maxLength, minLength}) => {

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className={`input-fields ${className}`}>
        <input type={inputType}
                id={id}
                required={required}
                autoFocus={autofocus}
                placeholder=''
                maxLength={maxLength}
                minLength={minLength}
                disabled={disabled}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}        
        />
        <label htmlFor={id}>{label}</label>

        {isPassword && value.length > 0 && 
            <button type='button'
                    tabIndex="-1"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label='Toggle password visibility'
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </button>
        }
      </div>
    )
}

export default InputAuthField;