'use client';

import { useEffect, useState } from 'react';
import { getListTestsAll } from '@/services/waiter.service';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LogOut, Loader2, AlertCircle, Info, ListChecks, Eye, Goal } from 'lucide-react';
import Cookies from 'js-cookie';
import NotFound from '@/app/not-found';

interface TestInfo {
    id: string;
    name: string;
}

export default function WaiterAllTestsPage() {
    const router = useRouter();
    const [allTests, setAllTests] = useState<TestInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNotWaiter, setIsNotWaiter] = useState(false);
    const [isLoadingRoleCheck, setIsLoadingRoleCheck] = useState(true);

    useEffect(() => {
        const isManagerCookie = Cookies.get('isManager');
        if (isManagerCookie === 'true' || isManagerCookie === undefined) {
            setIsNotWaiter(true);
        }
        setIsLoadingRoleCheck(false);

        if (isManagerCookie === 'false') {
            setLoading(true);
            getListTestsAll()
                .then(data => {
                    console.log(data)
                    setAllTests(data || []);
                })
                .catch(err => {
                    console.error('Failed to fetch all tests:', err);
                    setError('Не удалось загрузить список всех тестов. Пожалуйста, попробуйте позже.');
                })
                .finally(() => setLoading(false));
        }
    }, []);

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
                <p className="text-white text-xl">{isLoadingRoleCheck ? 'Проверка доступа...' : 'Загрузка списка тестов...'}</p>
            </div>
        );
    }

    if (isNotWaiter) return <NotFound />;

    return (
        <div className="flex flex-col items-center min-h-screen bg-green-600 p-4 pt-6 sm:pt-4">
            <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-2 sm:px-0">
                <Button 
                    onClick={() => router.push('/waiter')}
                    variant="outline"
                    className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600 flex items-center shadow-md"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> На главную
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

            <div className="bg-green-400 p-5 sm:p-6 rounded-lg w-full max-w-4xl border-2 border-green-800 shadow-xl">
                <div className="flex items-center justify-center mb-6">
                    <ListChecks className="h-8 w-8 mr-3 text-green-900" />
                    <h1 className="text-xl sm:text-2xl font-bold text-center text-green-900">
                        Все доступные тесты
                    </h1>
                </div>

                {error && (
                    <div className="text-center text-red-100 bg-red-600 p-4 rounded-md flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 mr-2" /> {error}
                    </div>
                )}

                {!loading && !error && allTests.length === 0 && (
                    <div className="text-center text-green-800 bg-green-200 p-6 rounded-md flex flex-col items-center justify-center">
                        <Info className="h-10 w-10 mr-2 text-green-700 mb-3" /> 
                        <p className="text-lg">В системе пока нет доступных тестов.</p>
                    </div>
                )}

                {!loading && !error && allTests.length > 0 && (
                    <div className="space-y-3">
                        {allTests.map((test) => (
                            <div 
                                key={test.id} 
                                className="bg-white p-4 space-y-3 rounded-lg shadow border border-green-300 flex flex-col sm:flex-row justify-between items-center transition-all hover:shadow-md hover:border-green-500"
                            >
                                <span className="text-lg font-medium text-green-800 mb-2 sm:mb-0 sm:mr-4">{test.name}</span>
                                <Link href={`/waiter/results/${test.id}`} passHref>
                                    <Button 
                                        variant="default"
                                        className="bg-green-700 hover:bg-green-800 text-white flex items-center shrink-0 w-full sm:w-auto"
                                    >
                                        <Eye className="mr-2 h-5 w-5" /> Смотреть мои результаты
                                    </Button>
                                </Link>
                                <Link href={`/waiter/tests/${test.id}`} passHref>
                                    <Button 
                                        variant="default"
                                        className="bg-green-700 hover:bg-green-800 text-white flex items-center shrink-0 w-full sm:w-auto"
                                    >
                                        <Goal className="mr-2 h-5 w-5"/> Пройти тест
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}