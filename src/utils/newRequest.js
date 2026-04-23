import axios from "axios";

//backend port number
const newRequest=axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
    withCredentials:true,
})

export default newRequest;