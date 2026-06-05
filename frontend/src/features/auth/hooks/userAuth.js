import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../AuthContext";
import { login, register, logout, getMe } from "../services/auth.api";





export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading, selectRole , setSelectRole} = context
    const navigate = useNavigate()

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            
        const response = await login({
            email,
            password,
            role:selectRole
        });

        const {token,user} = response.data

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if(user.role === "Admin"){
            setSelectRole("Admin")
            navigate('/admin/dashboard')
        }else if(user.role === "HR_Manager"){
            setSelectRole("HR_Manager")
            navigate('/hr/dashboard')
        }else{
            setSelectRole("Employee")  
            navigate('/employee/dashboard')
        }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            console.log(data)
            setUser(null)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                setUser(data.user)
            } catch (err) { 
                console.log(err)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    })

    return { user, loading, handleRegister, handleLogin, handleLogout }
}