import api from "../utils/axiosintance";

export const UpdateItemPicture = (formData) => {
    return api.post("/Item/UpdateItemPicture", formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        });
};

export const PictureThumbnail = (itemID) => {
    return api.get(`/Item/PictureThumbnail/${itemID}`);
};

export const Picture = (itemID) => {
    return api.get(`/Item/Picture/${itemID}`);
};

export const CheckDuplicateItemName = (ItemName, excludeID) => {
    return api.get(`/Item/CheckDuplicateItemName?ItemName=${ItemName}&excludeID=${excludeID}`);
};

