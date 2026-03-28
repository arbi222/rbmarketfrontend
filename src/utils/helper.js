import { useEffect, useState } from "react";
import { mergeGuestCart, removeGuest } from "../redux/features/cartSlice";
import deleteFile from "../firebase/deleteFile";
import axiosInstance from "../redux/api/axios";
import upload from "../firebase/upload";
import { createCategory, updateCategory } from "../redux/features/categorySlice";
import { createBrand, updateBrand } from "../redux/features/brandSlice";

export default function useDebounce(value, delay = 400) {

    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);

    }, [value, delay]);

    return debouncedValue;
}

export const capitalizeFirstLetter = (str) =>
    str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();


export const formatedDate = (timestamp) => {
    const date = new Date(timestamp);
    const memberSinceDate = date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    return memberSinceDate;
}

export const timeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);

  if (seconds < 60) return `${seconds} sec ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day(s) ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month(s) ago`;

  const years = Math.floor(months / 12);
  return `${years} year(s) ago`;
};


export const getPageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  let pages = [];

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } 
  else {
    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      startPage = 2;
      endPage = 4;
    }

    if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
      endPage = totalPages - 1;
    }

    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");

    pages.push(totalPages);
  }

  return pages;
};

export const mergeGuestCartIfExists = (dispatch) => {
  const guestCart = JSON.parse(localStorage.getItem("guest_cart"));

  if (guestCart && guestCart.length > 0){
    dispatch(mergeGuestCart(guestCart));
    dispatch(removeGuest());
  }
}

export const redirectAfterLogin = (navigate, location) => {
  const {
    from = "/",
    scrollTo = "",
    cartPopUp = false,
    notificationPopUp = false
  } = location.state || {};
  
    navigate(from, {
        replace: true,
        state: {scrollTo, cartPopUp, notificationPopUp}
    });
}

export const performAccountDeletion = async (userSlug, avatarFilePath) => {
    const res = await axiosInstance.get("/product/", {params: {sellerSlug: userSlug}});
    const products = res.data.products;
    
    if (products.length){
        await Promise.all(
            products.map(async (product) => {
                if (product.imageFilePath){
                    try {
                        await deleteFile(product.imageFilePath);
                    } catch (err) {
                        console.error(err);
                    }
                }
            })
        )
    
        await Promise.all(
            products.map(async (product) => {
                try {
                    await axiosInstance.delete(`/product/${product._id}`);
                    } 
                catch (err) {
                    console.error(err.response.message);
                }
            })
        );
    }
    
    if (avatarFilePath){
        try {
            await deleteFile(avatarFilePath);
        } catch (err) {
            console.error(err);
        }
    }
};

export const brandOrCategoryAddOrUpdate = async (requiredObject, loadingSetter, pageUsage, editing, image, imagePreview, fetchedItem, dispatch, navigate) => {
    let uploadedObject = null;
    loadingSetter(true);

    if (editing){ // editing brand / category
        try{
            if (image){ // this means we are updating the image
                if (fetchedItem.image && fetchedItem.imageFilePath){ // first delete old image if any exists
                await deleteFile(fetchedItem.imageFilePath);
                }
                uploadedObject = await upload(image, pageUsage);
                requiredObject.image = uploadedObject.downloadURL;
                requiredObject.imageFilePath = uploadedObject.filePath;
            }
            
            if (!imagePreview){ // this runs when there is a photo and we are deciding to leave brand / category without a photo
                if (fetchedItem.image && fetchedItem.imageFilePath){
                await deleteFile(fetchedItem.imageFilePath);
                requiredObject.image = "";
                requiredObject.imageFilePath = "";
                }
            }
            if (pageUsage === "categories"){
                requiredObject.categoryId = fetchedItem._id;
                await dispatch(updateCategory(requiredObject)).unwrap();
            }
            else{
                requiredObject.brandId = fetchedItem._id;
                await dispatch(updateBrand(requiredObject)).unwrap();
            }
            navigate(`/admin?tab=${pageUsage}&refetch=true`);
        }
        catch(err){
            console.error(err);
            if (uploadedObject){
            await deleteFile(uploadedObject.filePath);
            }
        }
        finally{
            loadingSetter(false);
        }
    }
    else{ // creating a brand / category
        try{
            if (image){
                uploadedObject = await upload(image, pageUsage);
                requiredObject.image = uploadedObject.downloadURL;
                requiredObject.imageFilePath = uploadedObject.filePath;
            }
            if (pageUsage === "categories"){
                await dispatch(createCategory(requiredObject)).unwrap();
            }
            else{
                await dispatch(createBrand(requiredObject)).unwrap();
            }
            navigate(`/admin?tab=${pageUsage}&refetch=true`);
        }
        catch(err){
            console.error(err);
            if (uploadedObject){
              await deleteFile(uploadedObject.filePath);
            }
        }
        finally{
            loadingSetter(false);
        }
    }
}