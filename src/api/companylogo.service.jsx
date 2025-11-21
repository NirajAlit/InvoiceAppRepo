import api from "../utils/axiosintance";

export const GetCompanyLogoUrl = (companyID) => {
    return api.get(`/Auth/GetCompanyLogoUrl/${companyID}`);
};

export const GetCompanyLogoThumbnailUrl = (companyID) => {
    return api.get(`/Auth/GetCompanyLogoThumbnailUrl/${companyID}`);
};