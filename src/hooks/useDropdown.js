import { useEffect, useRef, useState } from "react";
import { useDispatch } from 'react-redux';
import { closeGeneralPopUp } from "../redux/features/uiSlice";

export default function useDropdown() {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape"){
        setIsOpen(false);
        dispatch(closeGeneralPopUp());
      } 
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  return { isOpen, setIsOpen, ref };
}
