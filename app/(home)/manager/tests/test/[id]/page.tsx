'use client'
import { useEffect, useState } from "react"
import { getTestById, QuestionDto } from "@/services/manager.service"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Pencil } from "lucide-react"
import Cookies from "js-cookie"
import NotFound from "@/app/not-found"
export default function TestPage({ params }: { params: { id: string } }) {
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
    const [test, setTest] = useState<QuestionDto | null>(null)
    useEffect(() => {
        getTestById(params.id).then((data) => {
            if (data) {
                setTest(data)
            }
        })
    }, [params.id])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-600">
            <div className="flex flex-col items-center w-full max-w-3xl bg-green-400 rounded-lg border-2 border-green-800 p-8 mt-8">
                <div className="flex items-center justify-between w-full">
                <Button onClick={() => { window.location.href = "/manager" }} className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600"><ChevronLeft/> Вернуться к списку тестов</Button>
                <Button onClick={() => { window.location.href = `/manager/tests/test/${params.id}/edit` }} className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600"><Pencil/> Редактировать тест</Button>
                </div>

                <Image src="/Перчини.png" alt="Logo" width={220} height={400} className="mb-4" />
                <h1 className="text-3xl font-bold text-green-900 mb-2">Тест {test?.name}</h1>
                <span className="text-lg text-green-900 mb-6">ID: {params.id}</span>
                {test ? (
                    <div className="w-full">
                        <div className="flex flex-col gap-6">
                            {test.question.map((q, idx) => (
                                <div key={q.id} className="bg-white rounded-lg shadow p-5 border border-green-200">
                                    <div className="flex items-center mb-2">
                                        <span className="text-lg font-semibold text-green-800 mr-2">Вопрос {idx + 1}:</span>
                                        <span className="text-green-900">{q.question}</span>
                                    </div>
                                    <ul className="list-disc pl-6 mt-2">
                                        {q.variants.map((v) => (
                                            <li key={v.id} className="text-green-700 text-base mb-1">{v.variant}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-green-900 text-lg">Загрузка...</div>
                )}
            </div>
        </div>
    )
}