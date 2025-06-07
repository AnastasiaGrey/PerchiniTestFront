'use client'

import { useEffect, useState } from 'react';
import { getListNotStartedTests } from '@/services/waiter.service';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, LogOut, AlertCircle, ListChecks } from 'lucide-react'; // Added icons
import Cookies from 'js-cookie';
import NotFound from '@/app/not-found';

interface WaiterTest {
    id: string;
    name: string;
    manager_id: string; // Keep if needed, or remove if not displayed
}

export default function WaiterNotStartedTestsPage() {
    const router = useRouter();
    const [tests, setTests] = useState<WaiterTest[]>([]);
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
        getListNotStartedTests()
            .then((data) => {
                setTests(data || []);
            })
            .catch(err => {
                console.error("Failed to fetch not started tests:", err);
                setError("Не удалось загрузить список тестов. Пожалуйста, попробуйте позже.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("isManager");
        Cookies.remove("waiterId"); // Also remove waiterId on logout
        router.push('/auth');
    };

    if (isNotWaiter) {
        return <NotFound />;
    }

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
                    <ListChecks className="h-8 w-8 text-green-900 mr-3" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-900">
                        Тесты к прохождению
                    </h1>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-12 w-12 text-green-800 animate-spin" />
                        <p className="ml-3 text-green-800 text-lg">Загрузка неначатых тестов...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-100 bg-red-600 p-4 rounded-md flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 mr-2" /> {error}
                    </div>
                ) : tests.length > 0 ? (
                    <div className="space-y-3">
                        {tests.map((test) => (
                            <div 
                                key={test.id} 
                                className="bg-white p-4 rounded-lg shadow border border-green-300 flex justify-between items-center transition-all hover:shadow-md hover:border-green-500"
                            >
                                <span className="text-lg font-medium text-green-800">{test.name}</span>
                                <Link href={`/waiter/tests/${test.id}`} passHref>
                                    <Button 
                                        variant="default"
                                        className="bg-green-700 hover:bg-green-800 text-white flex items-center shrink-0"
                                    >
                                        Начать тест <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-green-800 py-5 text-lg">У вас нет тестов, ожидающих прохождения. Отличная работа!</p>
                )}
            </div>
        </div>
    );
}

