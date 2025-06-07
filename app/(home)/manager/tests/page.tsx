'use client'
import { useEffect, useState } from "react"
import { getListTests } from "@/services/manager.service"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import NotFound from "@/app/not-found"
const getList = async () => {
    const list = await getListTests()
    return list
}
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
    const router = useRouter()
    const [list, setList] = useState<{id: string; name: string; manager_id: string;}[]|[]>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {

        getList()
        .then((data) => {
            if(data){
                setList(data)
            }
        })
        .finally(() => {
            setLoading(false)
        })
    }, [])
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-green-600">
           <div className="absolute top-4 left-4 z-10">
                <Button 
                    onClick={() => router.push('/manager')}
                    variant="outline"
                    className="bg-green-300 text-green-900 hover:bg-white hover:text-green-600 flex items-center shadow-md"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Назад
                </Button>
            </div>
            <img src="/Перчини.png" alt="Logo" width={300} height={700} />
            <h1 className="text-3xl my-4 text-white">Мои тесты</h1>
            <div className="flex flex-col gap-4 bg-green-400 p-6 rounded-lg w-[60%] border-2 border-green-800 items-center">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5 text-green-900" />
                    </div>
                ) : list.length > 0 ? (
                    list.map((test) => (
                        <div key={test.id} className="bg-white rounded p-3 w-full flex items-center justify-between shadow">
                            
                            <Link href={`/manager/tests/test/${test.id}`} className="text-green-900"><span className="text-lg text-green-900">{test.name}</span></Link>
                        </div>
                    ))
                ) : (
                    <h2 className="text-xl text-green-900">Нет тестов</h2>
                )}
                <Button className="w-full mt-4 bg-green-300 text-green-900 hover:bg-white hover:text-green-600" onClick={() => { window.location.href = "/manager/tests/test/create" }}>
                    Добавить тест
                </Button>
            </div>
        </div>
    )
}