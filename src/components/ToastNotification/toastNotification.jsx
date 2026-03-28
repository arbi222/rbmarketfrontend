import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ToastNotification = () => {
  return <ToastContainer position="bottom-right" autoClose={3000} theme="light" />;
};

export default ToastNotification;