import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { Home } from 'lucide-react'; // Optional: for an icon on the button

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-600 text-white p-4">
            <div className="max-w-md w-full space-y-8 text-center bg-green-500 p-8 sm:p-10 rounded-xl shadow-2xl border-2 border-green-700">
                <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                        <Image src="/Перчини.png" alt="Логотип Перчини" width={280} height={75} priority />
                    </div>
                    <h2 className="mt-4 text-7xl font-extrabold text-green-900">
                        404
                    </h2>
                    <h1 className="mt-2 text-3xl font-bold text-green-900">
                        Страница не найдена
                    </h1>
                    <p className="mt-3 text-md text-green-800">
                        Упс! Кажется, вы забрели не туда. Запрашиваемая страница не существует или была перемещена.
                    </p>
                </div>
                
                <div className="mt-10">
                    <Link href="/auth" passHref legacyBehavior>
                        <Button 
                            variant="default"
                            className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center justify-center"
                        >
                            <Home className="mr-2 h-5 w-5" /> Вернуться на страницу входа
                        </Button>
                    </Link>
                </div>
            </div>
            <footer className="mt-12 text-center text-sm text-green-200">
                <p>&copy; {new Date().getFullYear()} Перчини. Все права защищены.</p>
            </footer>
        </div>
    );
}