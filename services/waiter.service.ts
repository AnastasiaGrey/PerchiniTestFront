import {axiosAuth} from "@/api/interceptors"
import { toast } from "sonner";
import Cookies from "js-cookie"
export async function getListTestsForWaiter(){
    try {
        const response = await axiosAuth.get<{id: string;
            name: string;
        }[]| []>('tests/list')
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export async function getListNotStartedTests(){
    const waiterId = Cookies.get("waiterId")
    try {
        const response = await axiosAuth.get<{id: string;
            name: string;
            manager_id: string;
        }[]| []>(`tests/list/not-start/${waiterId}`)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export async function getListFinishedTests(){
    const waiterId = Cookies.get("waiterId")
    try {
        const response = await axiosAuth.get<{id: string;
            name: string;
            manager_id: string;
        }[]| []>(`tests/list/finished/${waiterId}`)
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
    question:{
        id: string;
        question: string;
        variants: {
            variant: string;
            id: string;
        }[];
    }[]
}
export interface AnswerPayload {
    question_id: string;
    answer_id: string; // This will be the text of the selected variant
}

export interface CreateResultDto {
    test_id: string;
    start_time: Date;
    end_time: Date;
    employee_id: string;
    answers: AnswerPayload[];
}

export async function submitTestResults(resultData: CreateResultDto) {
    try {
        const response = await axiosAuth.post('/results/create', resultData); // Assuming '/results' is the endpoint
        toast.success('Тест успешно завершен и результаты отправлены!');
        return response.data;
    } catch (error: any) {
        console.error("Failed to submit test results:", error);
        toast.error(error.response?.data?.message || 'Не удалось отправить результаты теста.');
        throw error; // Re-throw to allow component to handle UI changes if needed
    }
}

export async function getTestById(id: string){
    try {
        const response = await axiosAuth.get<QuestionDto>(`questions/${id}`)
        console.log(response.data)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export interface ResultDto {
    id: string;
    test_id: string;
    points_scored: number;
    start_time: Date;
    end_time: Date;
    employee_id: string;
    test: {
        name: string;
    };
}
export async function getTestResultsById(test_id: string){
    const employee_id = Cookies.get("waiterId")
    try {
        const response = await axiosAuth.get<ResultDto[]>(`results/${employee_id}/${test_id}`)
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}
export async function getListTestsAll(){
    try {
        const response = await axiosAuth.get<{id: string;
            name: string;
        }[]| []>('questions/list/all')
        return response.data
    } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message)
    }
}