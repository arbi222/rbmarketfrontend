import { useRef } from "react";

const UploadImage = ({onUpload, onRemove, uploadbtnText, removeBtnText, uploadBtnStyle, removeBtnStyle}) => {

    const fileInputRef = useRef();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file){
            return;
        }

        try{
            const preview = URL.createObjectURL(file);

            if (onUpload){
                await onUpload(file, preview);
            }
        }
        catch(err){
            console.log(err);
        }
    }

    const handleRemove = () => {
        if (fileInputRef.current){
            fileInputRef.current = "";
        }

        if (onRemove){
            onRemove();
        }
    }

    return (
      <>
        <input type="file" 
               accept="image/*"
               className="hide"
               ref={fileInputRef}
               onChange={handleFileChange}
        />

        <button className={uploadBtnStyle}
              onClick={() => fileInputRef.current.click()}>
          {uploadbtnText}
        </button>

        <button className={removeBtnStyle} onClick={handleRemove}>
            {removeBtnText}
        </button>
      </>
    )
}

export default UploadImage;