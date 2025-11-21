import api, { publicApi } from "../utils/axiosintance";

export const signupAPI = (formData) => {
    return publicApi.post("/Auth/Signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};