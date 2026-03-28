import { CircularProgress } from "@mui/material";
import "./editableForm.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from "react";

const EditableForm = ({mainLabel, values, editBtn, setEditBtn, onSubmit, onCancel, submitBtnText = "Save", 
                        fields, loading, disableEditBtns, extraContent, conditionalExtra}) => {

    const [editValues, setEditValues] = useState({...values});
    const [showPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const startEdit = () => {
        setEditValues({...values});
        setEditBtn(true);
    };

    const cancelEdit = () => {
        setEditBtn(false);
        setEditValues({...values});
        if (onCancel) onCancel(); 
    };

    const handleSave = async (e) => {
        e.preventDefault();
        await onSubmit(editValues); 
    };

    return (
      <>
          <hr className="settings-hr"/>
          <div className="setting-holder-flex">
              {mainLabel && <p className="setting-holder-label">{mainLabel}</p>}
              {editBtn ? <>
                  <form className="setting-form" onSubmit={handleSave}>
                    {fields?.map((field, i) => {
                        const isPassword = field.type === "password";
                        const inputType = isPassword && showPassword[field.name] ? "text" : field.type;

                        return (
                            <div key={i} className="input-fields-div">
                                <input 
                                    type={inputType}
                                    minLength={field?.minLength}
                                    required={field.required}
                                    value={editValues[field.name]}  
                                    placeholder={field.placeholder}
                                    className={loading ? "disabled-btn" : ""}
                                    disabled={loading}
                                    onChange={(e) => setEditValues(prev => ({...prev, [field.name]: e.target.value}))}   
                                />
                                {isPassword && editValues[field.name].length > 0 && 
                                    <button type='button'
                                            tabIndex="-1"
                                            className="show-pass-btns"
                                            onClick={() => setShowPassword((prev) => ({
                                              ...prev,
                                              [field.name]: !prev[field.name]
                                            }))}
                                            aria-label='Toggle password visibility'
                                    >
                                        {showPassword[field.name] ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                    </button>
                                }
                            </div>
                        )
                    })}
                    {extraContent && <div>{extraContent(editValues, setEditValues)}</div>}
                    <div className="settings-btns">
                        <button className={`btn cancel-settings ${loading ? "disabled-btn" : ""}`} 
                                type="button"
                                disabled={loading} 
                                onClick={cancelEdit}>
                            Cancel
                        </button>
                        <button className={`btn save-settings ${loading ? "disabled-btn" : ""}`} 
                                type="submit" 
                                disabled={loading}>
                            {loading ? <CircularProgress size="20px" className="save-btn-loader"/> : submitBtnText}
                        </button>
                    </div>
                  </form>
                  <span></span>
                  </>
              : 
                <>
                    <div className="setting-middle-info">
                      {conditionalExtra && conditionalExtra(editValues)}
                    </div>
                    <div className="setting-right-side">
                        <button className={`setting-holder-btn ${disableEditBtns ? "disabled-btn disabled-edit" : ""}`}
                                disabled={disableEditBtns} 
                                onClick={startEdit}>
                                  Edit
                        </button>
                    </div>
                  </>
                  
              }
          </div>
      </>
    )
}

export default EditableForm;