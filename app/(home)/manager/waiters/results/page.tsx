'use client'

import { useEffect, useState } from 'react'
import { getListWaiters, WaitersList } from '@/services/manager.service'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, FileText } from 'lucide-react' // Added FileText for potential future use
import Cookies from 'js-cookie'
import NotFound from '@/app/not-found'

export default function ResultsPage() {
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
    
    const router = useRouter()
    const [list, setList] = useState<WaitersList[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getListWaiters()
            .then((data) => {
                console.log(data)
                if (data) {
                    setList(data)
                }
            })
            .catch(error => {
                console.error("Failed to fetch waiters list:", error)
                // Optionally, set an error state here to display to the user
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-green-600 p-4 pt-10 sm:pt-4">
            <div className="absolute top-4 left-4 z-10">
                <Button 
                    onClick={() => router.push('/manager')}
                    variant="outline"
                    className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600 flex items-center shadow-md"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Назад
                </Button>
            </div>
            
            <div className="mb-8 mt-12 sm:mt-8">
                <Image src="/Перчини.png" alt="Logo" width={300} height={80} priority />
            </div>

            <div className="bg-green-400 p-6 sm:p-8 rounded-lg w-full max-w-2xl border-2 border-green-800 shadow-xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-900 mb-6">Результаты тестирования сотрудников</h1>
                
                {loading ? (
                    <p className="text-center text-green-800">Загрузка списка сотрудников...</p>
                ) : list.length > 0 ? (
                    <ul className="space-y-3">
                        {list.map((waiter) => (
                            <li 
                                key={waiter.id} 
                                className="bg-white p-4 rounded-md shadow border border-green-300 flex justify-between items-center transition-all hover:shadow-lg hover:border-green-500"
                            >
                                <span className="text-lg text-green-900 font-medium">{waiter.name}</span>
                                {/* Placeholder for future action, e.g., view results button */}
                                <Button 
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white border-green-700"
                                    onClick={() => router.push(`/manager/waiters/results/${waiter.id}`)} // Example navigation
                                >
                                    <FileText className="mr-2 h-4 w-4" /> Посмотреть
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-green-800">Список сотрудников пуст или не удалось загрузить данные.</p>
                )}
            </div>
        </div>
    )
}