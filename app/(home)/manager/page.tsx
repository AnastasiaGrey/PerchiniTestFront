'use client'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import NotFound from "@/app/not-found"

export default function ManagerPage() {
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
    const logOut = () => {
        Cookies.remove("accessToken")
        Cookies.remove("refreshToken")
        Cookies.remove("isManager")
        window.location.href = "/auth"
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 p-4">
            <div className="mb-8">
                <Image src="/Перчини.png" alt="Logo" width={350} height={100} priority />
            </div>
            <div className="bg-green-400 p-8 rounded-lg w-full max-w-md border-2 border-green-800 shadow-xl">
                <h1 className="text-3xl font-bold text-center text-green-900 mb-8">Панель Менеджера</h1>
                <nav className="flex flex-col gap-4">
                    <Link href="/manager/tests" className="block w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-150 ease-in-out shadow-md hover:shadow-lg">
                        Управление тестами
                    </Link>
                    <Link href="/manager/waiters" className="block w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-150 ease-in-out shadow-md hover:shadow-lg">
                        Управление сотрудниками
                    </Link>
                    <Link href="/manager/waiters/results" className="block w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-150 ease-in-out shadow-md hover:shadow-lg">
                        Результаты тестирования
                    </Link>
                    <Button onClick={logOut} className="block w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-150 ease-in-out shadow-md hover:shadow-lg">Выйти</Button>
                </nav>
            </div>
        </div>
    )
}