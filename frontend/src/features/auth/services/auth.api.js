import axios from "axios";


const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true
});





export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {

        console.log(err)

    }

}

export async function login({ email, password ,role}) {

    try {

        const response = await api.post("/api/auth/login", {
            email, 
            password,
            role
        })
 
        return response.data

    } catch (err) {
        console.log(err)
    }

}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function getMe() {

    try {

        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        console.log(err)
    }

}



export async function sendEmployeeChatMessage(message) {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const employee_id = storedUser?.id || "";

    try {
        const response = await api.post('/api/auth/chat', {
            message,
            employee_id
        });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
