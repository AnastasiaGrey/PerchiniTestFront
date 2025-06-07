'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "@/services/manager.service"
import Image from "next/image"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

export default function AuthPage() {
    const { register, handleSubmit } = useForm<{ email: string, password: string }>()
    const [loading, setLoading] = useState(false)
    const onSubmit: SubmitHandler<{ email: string, password: string }> = async (data) => {
        setLoading(true)
        await signIn(data.email, data.password)
        setLoading(false)
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-green-600">
            <Image src="/Перчини.png" alt="Logo" width={400} height={900} />
            <h1 className="text-3xl my-4">Добро пожаловать!</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-green-400 p-4 rounded-lg w-[60%] border-2 border-green-800">
                <Input type="text" placeholder="Почта" {...register("email")} />
                <Input type="password" placeholder="Пароль" {...register("password")} />
                <Button type="submit">{loading ? "Загрузка..." : "Войти"}</Button>
            </form>
        </div>
    )
}