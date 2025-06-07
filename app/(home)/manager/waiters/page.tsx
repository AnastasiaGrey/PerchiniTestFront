'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'
import { CreateWaiter } from '@/services/manager.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import NotFound from '@/app/not-found'

type FormValues = {
    email: string
    name: string
}

type Role = 'Manager' | 'Waiter'

export default function CreateWaiterPage() {
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
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>()
    const [role, setRole] = useState<Role>('Manager') // Default role

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
            await CreateWaiter({ ...data, role })
            reset() 
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 p-4">
            <div className="absolute top-4 left-4 z-10">
                <Button 
                    onClick={() => router.push('/manager')}
                    variant="outline"
                    className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600 flex items-center shadow-md"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Назад
                </Button>
            </div>
            <div className="mb-8 mt-16 sm:mt-8">
                <Image src="/Перчини.png" alt="Logo" width={300} height={80} priority />
            </div>
            <div className="bg-green-400 p-8 rounded-lg w-full max-w-md border-2 border-green-800 shadow-xl">
                <h1 className="text-2xl font-bold text-center text-green-900 mb-6">Создание нового сотрудника</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-green-800 mb-1">Почта</label>
                        <Input 
                            id="email"
                            type="email" 
                            placeholder="example@example.com" 
                            {...register('email', { 
                                required: 'Почта обязательна',
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: 'Неверный формат почты'
                                }
                            })} 
                            className="bg-white border-green-700 focus:ring-green-500 focus:border-green-500 w-full"
                        />
                        {errors.email && <p className="text-red-700 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-green-800 mb-1">Имя</label>
                        <Input 
                            id="name"
                            type="text" 
                            placeholder="Имя" 
                            {...register('name', { 
                                required: 'Имя обязательно',
                            })} 
                            className="bg-white border-green-700 focus:ring-green-500 focus:border-green-500 w-full"
                        />
                        {errors.name && <p className="text-red-700 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <span className="block text-sm font-medium text-green-800 mb-2">Роль</span>
                        <div className="flex gap-3">
                            <div 
                                onClick={() => setRole('Manager')} 
                                className={`cursor-pointer flex-1 py-2 px-4 rounded-md text-center font-medium border-2 transition-all duration-150 ease-in-out 
                                            ${role === 'Manager' ? 'bg-green-700 text-white border-green-900 ring-2 ring-green-300 shadow-inner' : 'bg-white text-green-800 border-green-500 hover:bg-green-100'}`}
                            >
                                Менеджер
                            </div>
                            <div 
                                onClick={() => setRole('Waiter')} 
                                className={`cursor-pointer flex-1 py-2 px-4 rounded-md text-center font-medium border-2 transition-all duration-150 ease-in-out 
                                            ${role === 'Waiter' ? 'bg-green-700 text-white border-green-900 ring-2 ring-green-300 shadow-inner' : 'bg-white text-green-800 border-green-500 hover:bg-green-100'}`}
                            >
                                Сотрудник
                            </div>
                        </div>
                    </div>
                    

                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Создание...' : 'Создать сотрудника'}
                    </Button>
                </form>
            </div>
        </div>
    )
}