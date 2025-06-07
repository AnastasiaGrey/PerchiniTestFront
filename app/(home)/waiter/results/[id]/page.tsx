'use client';

import { useEffect, useState } from 'react';
import { getTestResultsById, ResultDto } from '@/services/waiter.service';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LogOut, Loader2, AlertCircle, Info, Clock, Award, CalendarDays } from 'lucide-react';
import Cookies from 'js-cookie';
import NotFound from '@/app/not-found';

// Helper function to format date and time
const formatDateTime = (dateString?: string | Date): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('ru-RU', {
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
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

export default function WaiterTestResultsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const testId = params.id;

    const [results, setResults] = useState<ResultDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNotWaiter, setIsNotWaiter] = useState(false);
    const [isLoadingRoleCheck, setIsLoadingRoleCheck] = useState(true);
    // const [testName, setTestName] = useState<string>(''); // For future enhancement to show test name

    useEffect(() => {
        const isManagerCookie = Cookies.get('isManager');
        if (isManagerCookie === 'true' || isManagerCookie === undefined) {
            setIsNotWaiter(true);
        }
        setIsLoadingRoleCheck(false);

        if (isManagerCookie === 'false') {
            setLoading(true);
            // Future: Fetch test name using getTestById(testId) if QuestionDto also has name
            // getTestById(testId).then(testDetails => setTestName(testDetails?.name || ''));
            
            getTestResultsById(testId)
                .then(data => {
                    setResults(data || []);
                })
                .catch(err => {
                    console.error('Failed to fetch test results:', err);
                    setError('Не удалось загрузить результаты теста. Пожалуйста, попробуйте позже.');
                })
                .finally(() => setLoading(false));
        }
    }, [testId]);

    const handleLogout = () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('isManager');
        Cookies.remove('waiterId');
        router.push('/auth');
    };

    if (isLoadingRoleCheck || (loading && !isNotWaiter)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 p-4">
                <Image src="/Перчини.png" alt="Логотип Перчини" width={280} height={75} priority className="mb-8" />
                <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
                <p className="text-white text-xl">{isLoadingRoleCheck ? 'Проверка доступа...' : 'Загрузка результатов...'}</p>
            </div>
        );
    }

    if (isNotWaiter) return <NotFound />;

    return (
        <div className="flex flex-col items-center min-h-screen bg-green-600 p-4 pt-6 sm:pt-4">
            <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-2 sm:px-0">
                <Button 
                    onClick={() => router.push('/waiter/results')}
                    variant="outline"
                    className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600 flex items-center shadow-md"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> К списку пройденных тестов
                </Button>
                <Image src="/Перчини.png" alt="Логотип Перчини" width={200} height={50} priority className="hidden sm:block"/>
                <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-red-500 text-white hover:bg-red-600 flex items-center shadow-md"
                >
                    <LogOut className="mr-1.5 h-4 w-4" /> Выйти
                </Button>
            </div>
            <Image src="/Перчини.png" alt="Логотип Перчини" width={280} height={75} priority className="sm:hidden mb-4"/>
            {results.length > 0 ? (
                <div className="bg-green-400 p-5 sm:p-6 rounded-lg w-full max-w-4xl border-2 border-green-800 shadow-xl">
                {/* Placeholder for test name, can be fetched if needed */}
                <h1 className="text-xl sm:text-2xl font-bold text-center text-green-900 mb-6">
                    Результаты по Тесту {results[0].test.name}
                    {/* {testName ? `Результаты теста: ${testName}` : `Результаты по Тесту ID: ${testId}`} */}
                </h1>

                {error && (
                    <div className="text-center text-red-100 bg-red-600 p-4 rounded-md flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 mr-2" /> {error}
                    </div>
                )}

                {!loading && !error && results.length === 0 && (
                    <div className="text-center text-green-800 bg-green-200 p-6 rounded-md flex flex-col items-center justify-center">
                        <Info className="h-10 w-10 mr-2 text-green-700 mb-3" /> 
                        <p className="text-lg">По этому тесту еще нет результатов.</p>
                    </div>
                )}

                {!loading && !error && results.length > 0 && (
                    <div className="space-y-4">
                        {results.map((result, index) => (
                            <div key={result.id} className="bg-white p-4 rounded-lg shadow border border-green-300">
                                <h2 className="text-lg font-semibold text-green-800 mb-3 border-b pb-2 border-green-200">Попытка №{index + 1}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                                    <p className="flex items-center"><Award className="h-5 w-5 mr-2 text-green-600" /><strong>Баллы:</strong> {result.points_scored}</p>
                                    <p className="flex items-center"><Clock className="h-5 w-5 mr-2 text-green-600" /><strong>Время прохождения:</strong> {calculateDuration(result.start_time, result.end_time)}</p>
                                    <p className="flex items-center"><CalendarDays className="h-5 w-5 mr-2 text-green-600" /><strong>Начало:</strong> {formatDateTime(result.start_time)}</p>
                                    <p className="flex items-center"><CalendarDays className="h-5 w-5 mr-2 text-green-600" /><strong>Завершение:</strong> {formatDateTime(result.end_time)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            ) : (
                <div className="text-center text-green-800 bg-green-200 p-6 rounded-md flex flex-col items-center justify-center">
                    <Info className="h-10 w-10 mr-2 text-green-700 mb-3" /> 
                    <p className="text-lg">По этому тесту еще нет результатов.</p>
                </div>
            )}
            
        </div>
    );
}