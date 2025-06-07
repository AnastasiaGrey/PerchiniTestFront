'use client'
import axios, { CreateAxiosDefaults } from "axios"
import Cookies from "js-cookie"
const url = "http://localhost:4200"
const options: CreateAxiosDefaults = {
    baseURL: url, //'https://staging.openhere.space/',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false
}
const authOptions: CreateAxiosDefaults = {
    baseURL: url,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false
}
const axiosAuth = axios.create(authOptions)
const axiosClassic = axios.create(options)
axiosAuth.interceptors.request.use((config) => {
    const token = Cookies.get("accessToken")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})    
export { axiosAuth, axiosClassic }