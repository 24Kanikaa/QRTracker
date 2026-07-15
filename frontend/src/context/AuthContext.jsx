import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState(null);

    useEffect(() => {

        api.get("/auth/me")

            .then(({ data }) => {

                setUser(data.user);
                setUserType(data.user.role);
                // console.log(data.user)

            })

            .catch(() => {

                setUser(null);
                

            })

            .finally(() => {

                setLoading(false);

            });

    }, []);

    const login = (user, token, type) => {

        localStorage.setItem("token", token);

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "userType",
            type
        );

        setUser(user);
        setUserType(type);

    };

    const logout = async () => {
        const redirect =
            userType === "STUDENT"
                ? "/student-login"
                : "/";

        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userType");
        window.location.href = redirect;
    };

    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}