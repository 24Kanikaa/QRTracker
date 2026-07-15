import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let isRedirecting = false;

api.interceptors.response.use(

    (response) => response,

    (error) => {

        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest.url.includes("/auth/login") &&
            !originalRequest.url.includes("/auth/me") &&
            !isRedirecting
        ) {

            isRedirecting = true;

            const userType = localStorage.getItem("userType");

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userType");

            window.location.replace(
                userType === "admin"
                    ? "/"
                    : "/student-login"
            );
        }

        return Promise.reject(error);
    }

);

export default api;