'use client'

import { useEffect, useState } from 'react';
import { getListFinishedTests } from '@/services/waiter.service'; // Assuming this service fetches {id, name, points_scored, total_questions, date_completed}
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link'; // For future navigation to detailed result
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, LogOut, AlertCircle, CheckSquare } from 'lucide-react'; 
import Cookies from 'js-cookie';
import NotFound from '@/app/not-found';

// Define an interface for the finished test structure
// Adjust this based on what getListFinishedTests actually returns
interface FinishedTest {
    id: string; // This would likely be the test attempt ID or result ID
    name: string; // Name of the test
    points_scored?: number; // Optional: if you want to show score directly on this page
    total_questions?: number; // Optional
    date_completed?: string | Date; // Optional: formatted date of completion
    // Add any other relevant properties from your API response
}

export default function WaiterResultsPage() {
    const router = useRouter();
    const [results, setResults] = useState<FinishedTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNotWaiter, setIsNotWaiter] = useState(false);

    useEffect(() => {
        const isManagerCookie = Cookies.get("isManager");
        if (isManagerCookie === "true") {
            setIsNotWaiter(true);
            return; 
        }

        setLoading(true);
        getListFinishedTests()
            .then((data) => {
                // Ensure data is an array, even if API might sometimes not return one on empty
                setResults(Array.isArray(data) ? data : []); 
            })
            .catch(err => {
                console.error("Failed to fetch finished tests:", err);
                setError("Не удалось загрузить список пройденных тестов. Пожалуйста, попробуйте позже.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("isManager");
        Cookies.remove("waiterId");
        router.push('/auth');
    };

    if (isNotWaiter) {
        return <NotFound />;
    }

    // Helper to format date if available
    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return 'Дата не указана';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Неверная дата';
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-green-600 p-4 pt-6 sm:pt-4">
            <div className="w-full max-w-3xl flex justify-between items-center mb-6 px-2 sm:px-0">
                <Button 
                    onClick={() => router.push('/waiter')}
                    variant="outline"
                    className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600 flex items-center shadow-md"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Назад к тестам
                </Button>
                <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-red-500 text-white hover:bg-red-600 flex items-center shadow-md"
                >
                    <LogOut className="mr-2 h-5 w-5" /> Выйти
                </Button>
            </div>
            
            <div className="mb-8">
                <Image src="/Перчини.png" alt="Логотип Перчини" width={280} height={75} priority />
            </div>

            <div className="bg-green-400 p-6 sm:p-8 rounded-lg w-full max-w-3xl border-2 border-green-800 shadow-xl">
                <div className="flex items-center justify-center mb-6">
                    <CheckSquare className="h-8 w-8 text-green-900 mr-3" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-900">
                        Результаты пройденных тестов
                    </h1>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-12 w-12 text-green-800 animate-spin" />
                        <p className="ml-3 text-green-800 text-lg">Загрузка результатов...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-100 bg-red-600 p-4 rounded-md flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 mr-2" /> {error}
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-3">
                        {results.map((result) => (
                            <div 
                                key={result.id} 
                                className="bg-white p-4 rounded-lg shadow border border-green-300 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all hover:shadow-md hover:border-green-500"
                            >
                                <div className='mb-2 sm:mb-0'>
                                    <span className="text-lg font-medium text-green-800 block">{result.name}</span>
                                    {result.date_completed && (
                                        <span className="text-xs text-gray-500">Пройден: {formatDate(result.date_completed)}</span>
                                    )}
                                    {/* You could display score here too if available: */}
                                    {/* result.points_scored !== undefined && result.total_questions !== undefined && (
                                        <span className="text-sm text-green-700 block">Результат: {result.points_scored}/{result.total_questions}</span>
                                    )*/}
                                </div>
                                {/* Update Link href when detailed result page is ready */}
                                <Link href={`/waiter/results/${result.id}`} passHref>
                                    <Button 
                                        variant="outline"
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white border-green-700 w-full sm:w-auto"
                                    >
                                        Посмотреть результат <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-green-800 py-5 text-lg">Вы еще не завершили ни одного теста.</p>
                )}
            </div>
        </div>
    );
}