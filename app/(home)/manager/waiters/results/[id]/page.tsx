'use client'

import { useEffect, useState } from 'react'
import { getListResultsById, ListResultsById } from '@/services/manager.service' // Ensure ListResultsById is imported
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Clock, CheckCircle, HelpCircle } from 'lucide-react' // Added icons
import Cookies from 'js-cookie'
import NotFound from '@/app/not-found'

// Helper function to format date and time
const formatDateTime = (dateTimeString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    try {
        return new Date(dateTimeString).toLocaleString(undefined, options);
    } catch (e) {
        return 'Неверная дата';
    }
};

// Helper function to calculate and format duration
const calculateDuration = (startTimeStr?: string | Date, endTimeStr?: string | Date): string => {
    if (!startTimeStr || !endTimeStr) return 'N/A';
    try {
        const start = new Date(startTimeStr).getTime();
        const end = new Date(endTimeStr).getTime();
        if (isNaN(start) || isNaN(end) || end < start) return 'N/A';

        let diff = Math.abs(end - start) / 1000; // Difference in seconds

        const days = Math.floor(diff / 86400);
        diff -= days * 86400;
        const hours = Math.floor(diff / 3600) % 24;
        diff -= hours * 3600;
        const minutes = Math.floor(diff / 60) % 60;
        diff -= minutes * 60;
        const seconds = Math.floor(diff % 60);

        let durationString = '';
        if (days > 0) durationString += `${days} д. `;
        if (hours > 0) durationString += `${hours} ч. `;
        if (minutes > 0) durationString += `${minutes} мин. `;
        if (seconds > 0 || durationString === '') durationString += `${seconds} сек.`;
        
        return durationString.trim() || '0 сек.';
    } catch {
        return 'Ошибка расчета';
    }
};

export default function EmployeeResultsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [notFound, setNotFound] = useState(false)
    useEffect(() => {
        const isManager = Cookies.get("isManager")
        if (isManager==="false") {
            setNotFound(true)
        }
    }, [])
    if (notFound) {
        return <NotFound/>
    }
    // The service function getListResultsById might return a single object or an array.
    // Based on the interface ListResultsById, it seems like it might be a single object if it's one result,
    // or you might intend for it to be an array if an employee can have multiple results/attempts.
    // For this example, I'll assume it returns an array of results for the employee.
    const [results, setResults] = useState<ListResultsById[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // You might want to fetch employee details too, to display their name, etc.
    // const [employeeName, setEmployeeName] = useState<string>(""); 

    useEffect(() => {
        if (params.id) {
            setLoading(true)
            setError(null)
            getListResultsById(params.id)
                .then((data) => {
                    // Adjust based on actual API response structure
                    // If data is a single object and you want it in an array:
                    // setResults(data ? [data] : []);
                    // If data is already an array:
                    setResults(Array.isArray(data) ? data : (data ? [data] : []));
                    // if (data && data.length > 0) setEmployeeName(data[0].employee_id); // Example: if employee name is part of results
                })
                .catch(err => {
                    console.error("Failed to fetch results:", err)
                    setError("Не удалось загрузить результаты тестирования.")
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [params.id])

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-green-600 p-4 pt-10 sm:pt-4">
            <div className="absolute top-4 left-4 z-10">
                <Button 
                    onClick={() => router.push('/manager/waiters/results')}
                    variant="outline"
                    className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600 flex items-center shadow-md"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> К списку сотрудников
                </Button>
            </div>
            
            <div className="mb-8 mt-12 sm:mt-8">
                <Image src="/Перчини.png" alt="Logo" width={300} height={80} priority />
            </div>

            <div className="bg-green-400 p-6 sm:p-8 rounded-lg w-full max-w-3xl border-2 border-green-800 shadow-xl">
                {/* TODO: Fetch and display employee name here if available */}
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-900 mb-6">
                    Результаты тестирования сотрудника 
                    {/* {employeeName || params.id} */} 
                </h1>
                
                {loading ? (
                    <p className="text-center text-green-800 py-5">Загрузка результатов...</p>
                ) : error ? (
                    <p className="text-center text-red-700 bg-red-100 p-3 rounded-md">{error}</p>
                ) : results.length > 0 ? (
                    <div className="space-y-4">
                        {results.map((result) => (
                            <div key={result.id} className="bg-white p-5 rounded-lg shadow border border-green-300">
                                <h2 className="text-xl font-semibold text-green-800 mb-3">Тест: {result.test?.name || 'Название теста не указано'}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p className="flex items-center text-green-700">
                                        <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                        <strong>Баллы:</strong>&nbsp;{result.points_scored}
                                    </p>
                                    <p className="flex items-center text-gray-700">
                                        <Clock className="mr-2 h-5 w-5 text-indigo-500" />
                                        <strong>Время прохождения:</strong>&nbsp;{calculateDuration(result.start_time, result.end_time)}
                                    </p>
                                    <p className="flex items-center text-gray-700">
                                        <Clock className="mr-2 h-5 w-5 text-blue-500" />
                                        <strong>Начало:</strong>&nbsp;{formatDateTime(result.start_time)}
                                    </p>
                                    <p className="flex items-center text-gray-700">
                                        <Clock className="mr-2 h-5 w-5 text-red-500" />
                                        <strong>Окончание:</strong>&nbsp;{formatDateTime(result.end_time)}
                                    </p>
                                    <p className="flex items-center text-gray-700 md:col-span-2">
                                        <HelpCircle className="mr-2 h-5 w-5 text-purple-500" />
                                        <strong>ID попытки:</strong>&nbsp;{result.id}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-green-800 py-5">Для данного сотрудника нет результатов тестирования.</p>
                )}
            </div>
        </div>
    )
}