'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, ListChecks, History } from 'lucide-react'; // Updated icons
import Cookies from 'js-cookie';
import NotFound from '@/app/not-found';

export default function WaiterPage() {
    const router = useRouter();
    const [isNotWaiter, setIsNotWaiter] = useState(false);
    const [isLoadingRoleCheck, setIsLoadingRoleCheck] = useState(true);

    useEffect(() => {
        const isManagerCookie = Cookies.get("isManager");
        if (isManagerCookie === "true") {
            setIsNotWaiter(true);
        } else if (isManagerCookie === undefined) {
            // If cookie is undefined, might mean not logged in or an issue.
            // Redirect to auth, or handle as an unauthenticated state.
            // For now, also treating as 'not waiter' for page access purposes.
            setIsNotWaiter(true); 
        }
        setIsLoadingRoleCheck(false);
    }, []);

    const handleLogout = () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("isManager");
        Cookies.remove("waiterId"); // Ensure waiterId is also cleared
        router.push('/auth');
    };

    if (isLoadingRoleCheck) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 p-4">
                 <Image src="/Перчини.png" alt="Logo" width={300} height={80} priority className="mb-8" />
                <p className="text-white text-xl">Проверка доступа...</p> 
                {/* You could add a spinner here too */}
            </div>
        );
    }

    if (isNotWaiter) {
        return <NotFound />;
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-green-600 p-4 pt-10 sm:pt-4">
            <div className="absolute top-4 right-4 z-10">
                <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-red-500 text-white hover:bg-red-600 flex items-center shadow-md"
                >
                    <LogOut className="mr-2 h-5 w-5" /> Выйти
                </Button>
            </div>
            
            <div className="mb-8 mt-6 sm:mt-0">
                <Image src="/Перчини.png" alt="Логотип Перчини" width={300} height={80} priority />
            </div>

            <div className="bg-green-400 p-6 sm:p-8 rounded-lg w-full max-w-md border-2 border-green-800 shadow-xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-900 mb-8">
                    Панель сотрудника
                </h1>
                
                <nav className="flex flex-col gap-4">
                    <Link href="/waiter/tests" passHref legacyBehavior>
                        <Button 
                            variant="default"
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg text-lg text-center transition duration-150 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            <ListChecks className="mr-3 h-6 w-6" /> Новые тесты 
                            <ChevronRight className="ml-auto h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/waiter/results" passHref legacyBehavior>
                        <Button 
                            variant="default"
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg text-lg text-center transition duration-150 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            <History className="mr-3 h-6 w-6" /> Завершенные тесты
                            <ChevronRight className="ml-auto h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/waiter/all-tests" passHref legacyBehavior>
                        <Button 
                            variant="default"
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg text-lg text-center transition duration-150 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            <History className="mr-3 h-6 w-6" /> Все тесты
                            <ChevronRight className="ml-auto h-5 w-5" />
                        </Button>
                    </Link>
                </nav>
            </div>
        </div>
    );
}