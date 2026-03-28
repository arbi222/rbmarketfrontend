import { useEffect, useRef, useState } from "react";
import "./dataCardShowing.css";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HoverMenu from "../../components/HoverMenu/hoverMenu";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { openGeneralPopUp } from "../../redux/features/uiSlice";

const DataCardShowing = ({usage, item, setImageFilePath, setDeleteItemId}) => {

    const settingItems = [
        { 
          _id: 1,
          text: "Edit",
          icon: <EditIcon />
        },
        { 
          _id: 2,
          text: "Delete",
          icon: <DeleteIcon />
        },
    ]

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isBrands = usage === "brands";
    const isCategories = usage === "categories";

    const settingMenuRef = useRef(null);
    const [activeSettingBtn, setActiveSettingBtn] = useState({_id: null, imageFilePath: null});
        
    useEffect(() => {
      if (!activeSettingBtn._id) return;

      const handleClickOutside = (e) => {
        if (settingMenuRef.current && !settingMenuRef.current.contains(e.target)) {
          setActiveSettingBtn(prev => ({...prev, _id: null}));
        }
      };
    
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeSettingBtn._id]);

    const handleSettingClick = (id) => {
        if (isCategories){
            if (id === 1){
                navigate(`/brand-category?categoryPage=true&categoryId=${activeSettingBtn._id}`);
                setActiveSettingBtn(prev => ({...prev, _id: null}));
            }
            else if (id === 2){
                dispatch(openGeneralPopUp("YesNo"));
                setDeleteItemId(activeSettingBtn._id);
                setImageFilePath(activeSettingBtn.imageFilePath);
                setActiveSettingBtn({_id: null, imageFilePath: null});
            }
        }
        else if (isBrands){
            if (id === 1){
                navigate(`/brand-category?brandPage=true&brandId=${activeSettingBtn._id}`);
                setActiveSettingBtn(prev => ({...prev, _id: null}));
            }
            else if (id === 2){
                dispatch(openGeneralPopUp("YesNo"));
                setDeleteItemId(activeSettingBtn._id);
                setImageFilePath(activeSettingBtn.imageFilePath);
                setActiveSettingBtn({_id: null, imageFilePath: null});
            }
        }
    }

    return (
        <div className="dataCard">
            <h3>{item.name}</h3>
            <div ref={settingMenuRef} className="btn-and-menu">
              <button className="btn edit-dataCard-btn" 
                      onClick={(e) => {
                          e.stopPropagation();
                          setActiveSettingBtn({_id: activeSettingBtn._id === item._id ? null : item._id, imageFilePath: item.imageFilePath});
                      }}>
                  <MoreVertIcon style={{marginTop: "3px"}}/>
              </button>

              {activeSettingBtn._id === item._id && 
                <HoverMenu menu="reviewSettings" 
                          items={settingItems} 
                          onClickItem={handleSettingClick}
                />
              }
            </div>
        </div>
    )
}

export default DataCardShowing;