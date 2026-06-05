import { useState } from "react";
import { AuthContext } from "./AuthContext";



export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectRole, setSelectRole] = useState("Employee")

    


    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading,selectRole,setSelectRole}} >
            {children}
        </AuthContext.Provider>
    )

    
}