import api from "../utils/axiosintance";


export const GetTopItems = (topN) => {
    return api.get(`/Invoice/TopItems`,
        {
            params: { topN: topN }
        }
    );
}

export const GetTrend = (asOf) => {
    return api.get(`/Invoice/GetTrend12m`,
        {
            params: { asOf: asOf }
        }
    );
}

export const GetMetrics = (fromDate, toDate) => {
    return api.get(`/Invoice/GetMetrices`,
        {
            params: { fromDate: fromDate, toDate: toDate }
        }
    );
}

