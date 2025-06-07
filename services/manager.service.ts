'use client'
import { axiosAuth } from "@/api/interceptors";
import Cookies from "js-cookie"
import { toast } from "sonner";
export async function signIn(email: string, password: string) {
    try {
        const response = await axiosAuth.post<{acessToken: string, refreshToken: string, user:any}>("/auth/login", { email, password })
        Cookies.set("accessToken", response.data.acessToken)
        Cookies.set("refreshToken", response.data.refreshToken)
        const isManager = response.data.user?.manager?.id ? response.data.user.manager.id : 'false'
        Cookies.set("isManager", isManager)
        if(isManager=='false'){
            Cookies.set('waiterId', response.data.user.employee.id )
        }
        console.log(response.data)
        isManager!="false" ? window.location.href = "/manager":window.location.href = "/waiter"
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export async function getListTests(){
    try {
        const managerId = Cookies.get("isManager")
        const response = await axiosAuth.get<{
            id: string;
            name: string;
            manager_id: string;
        }[]| []>(`/tests/list/${managerId}`)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export interface CreateQuestionDto {
    manager_id: string
    test_name: string
    questions:{
        question:string,
        variants:{
            variant:string,
            status:string,
        }[]
    }[]

}
export async function createTest(data: CreateQuestionDto){
    try {
        const response = await axiosAuth.post("/questions/create", data)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export interface QuestionDto {
    id: string;
    name: string;
    manager_id: string;
    question: {
            id: string;
            question: string;
            test_id: string;
            variants: {
                id: string;
                variant: string;
            }[];
        }[]
    }

export async function getTestById(id: string){
    try {
        const response = await axiosAuth.get<QuestionDto>(`/questions/${id}`)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}

export interface QuestionDtoWithStatus {
    id: string;
    name: string;
    manager_id: string;
    question: {
            id: string;
            question: string;
            test_id: string;
            variants: {
                id: string;
                variant: string;
                status: string;
            }[];
        }[]
    }
export async function getTestByIdWithStatuses(id: string){
    try {
        const response = await axiosAuth.get<QuestionDtoWithStatus>(`/questions/status/${id}`)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export interface UpdateQuestionDto {
    id: string;
    name: string;
    manager_id: string;
    question: {
            id: string;
            question: string;
            test_id: string;
            variants: {
                id: string;
                variant: string;
                status: string;
            }[];
        }[]
    }
export async function updateTest(data:UpdateQuestionDto) {
    try {
        const response = await axiosAuth.patch(`/questions/update`, data)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export async function CreateWaiter(data: {email: string, name: string, role: 'Manager'|'Waiter'}) {
    try {
        const response = await axiosAuth.post("/auth/register", data)
        console.log(response.data)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export interface WaitersList{
    id:string,
    name:string,
    employee:{
        id:string,
        userId:string
    }
}
export async function getListWaiters() {
    try {
        const response = await axiosAuth.get<WaitersList[]>("/results/list/waiter")
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export interface ListResultsById
{
    test: {
        name: string;
    };
    id: string;
    test_id: string;
    points_scored: number;
    start_time: Date;
    end_time: Date;
    employee_id: string;
}
    

export async function getListResultsById(id: string){
    try {
        const response = await axiosAuth.get<ListResultsById[]>(`/results/waiter/${id}`)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}