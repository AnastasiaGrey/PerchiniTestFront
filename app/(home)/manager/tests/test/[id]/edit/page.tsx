'use client'
import { useForm, useFieldArray, Controller, SubmitHandler } from "react-hook-form"
import { getTestByIdWithStatuses, UpdateQuestionDto, updateTest } from "@/services/manager.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import Image from "next/image"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import NotFound from "@/app/not-found"

export default function EditTestPage({ params }: { params: { id: string } }) {
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
    const [initialLoading, setInitialLoading] = useState(true)
    const [testName, setTestName] = useState("")

    const { control, register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<UpdateQuestionDto>({
        defaultValues: {
            id: params.id, // Initialize ID
            manager_id: Cookies.get("isManager") || "",
            name: "",
            question: [{ id: "", question: "", test_id: params.id, variants: [{ id: "", variant: "", status: "" }] }]
        }
    })

    useEffect(() => {
        if (params.id) {
            setInitialLoading(true)
            getTestByIdWithStatuses(params.id).then((data) => {
                if (data) {
                    setTestName(data.name)
                    const transformedData: UpdateQuestionDto = {
                        id: data.id,
                        manager_id: data.manager_id || Cookies.get("isManager") || "",
                        name: data.name,
                        question: data.question.map(q => ({
                            id: q.id, // Ensure question ID is mapped
                            question: q.question,
                            test_id: q.test_id || params.id, // Ensure test_id is mapped
                            variants: q.variants.map(v => ({
                                id: v.id, // Ensure variant ID is mapped
                                variant: v.variant,
                                status: v.status
                            }))
                        }))
                    }
                    reset(transformedData)
                }
                setInitialLoading(false)
            }).catch(error => {
                console.error("Failed to fetch test data:", error)
                setInitialLoading(false)
            })
        } else {
            setInitialLoading(false)
        }
    }, [params.id, reset])

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: "question" // Changed from "questions"
    })

    const onSubmit: SubmitHandler<UpdateQuestionDto> = async (data) => {
        try {
            await updateTest(data) // Pass the whole data object as per your service
            router.push(`/manager/tests/test/${params.id}`)
        } catch (error) {
            console.error("Failed to update test:", error)
        }
    }

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-600">
                <p className="text-white text-xl">Загрузка данных теста...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 py-10">
            <div className="bg-green-400 p-8 rounded-lg w-full max-w-2xl border-2 border-green-800">
                <Button
                    onClick={() => router.push(`/manager/test/${params.id}`)}
                    variant="outline"
                    className="mb-6 bg-green-300 text-green-900 hover:bg-white hover:text-green-600 self-start"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Назад к тесту
                </Button>
                <h1 className="text-2xl mb-4 text-center text-green-900 font-bold">Редактирование теста: {testName}</h1>
                <div className="flex items-center justify-center mb-4">
                    <Image src="/Перчини.png" alt="Logo" width={300} height={700} />
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <Input
                        type="text"
                        placeholder="Название теста"
                        {...register("name", { required: "Название теста обязательно" })} // Changed from test_name
                        className="bg-white"
                    />
                    {errors.name && <p className="text-red-700 text-sm">{errors.name.message}</p>}

                    {questionFields.map((item, qIdx) => ( // Changed q to item to avoid conflict with UpdateQuestionDto.question
                        <div key={item.id} className="bg-white rounded p-4 mb-2 border border-green-300">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-green-800">Вопрос {qIdx + 1}</span>
                                <Button type="button" variant="destructive" className="ml-2" onClick={() => removeQuestion(qIdx)} disabled={questionFields.length === 1}>Удалить вопрос</Button>
                            </div>
                            {/* Hidden input for question ID if needed by backend, but usually handled by structure */}
                            <input type="hidden" {...register(`question.${qIdx}.id`)} />
                            <input type="hidden" {...register(`question.${qIdx}.test_id`)} />

                            <Input
                                type="text"
                                placeholder="Текст вопроса"
                                {...register(`question.${qIdx}.question`, { required: "Текст вопроса обязателен" })}
                                className="mb-2"
                            />
                            {errors.question?.[qIdx]?.question && <p className="text-red-700 text-sm">{errors.question[qIdx]?.question?.message}</p>}
                            <VariantsField control={control} register={register} qIdx={qIdx} errors={errors} />
                        </div>
                    ))}
                    <Button type="button" onClick={() => appendQuestion({ id: '', question: "", test_id: params.id, variants: [{ id: '', variant: "", status: "" }, { id: '', variant: "", status: "" }] })}>Добавить вопрос</Button>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Сохранение..." : "Сохранить изменения"}</Button>
                </form>
            </div>
        </div>
    )
}

function VariantsField({ control, register, qIdx, errors }: { control: any, register: any, qIdx: number, errors: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `question.${qIdx}.variants` // Corrected path
    })
    return (
        <div className="flex flex-col gap-2 mt-2">
            <span className="text-green-700 font-medium">Варианты ответа:</span>
            {fields.map((item, vIdx) => ( // Changed v to item
                <div key={item.id} className="flex flex-col gap-1">
                     {/* Hidden input for variant ID if needed by backend */}
                    <input type="hidden" {...register(`question.${qIdx}.variants.${vIdx}.id`)} />
                    <div className="flex gap-2 items-center">
                        <Input
                            type="text"
                            placeholder={`Вариант ${vIdx + 1}`}
                            {...register(`question.${qIdx}.variants.${vIdx}.variant`, { required: "Вариант ответа обязателен" })}
                            className="flex-grow"
                        />
                        <Input
                            type="text"
                            placeholder="Статус"
                            {...register(`question.${qIdx}.variants.${vIdx}.status`, { required: "Статус варианта обязателен" })}
                            className="w-28"
                        />
                        <Button type="button" variant="destructive" onClick={() => remove(vIdx)} disabled={fields.length <= 1}>-</Button>
                    </div>
                    {errors.question?.[qIdx]?.variants?.[vIdx]?.variant && <p className="text-red-700 text-sm">{errors.question[qIdx]?.variants[vIdx]?.variant?.message}</p>}
                    {errors.question?.[qIdx]?.variants?.[vIdx]?.status && <p className="text-red-700 text-sm">{errors.question[qIdx]?.variants[vIdx]?.status?.message}</p>}
                </div>
            ))}
            <Button type="button" onClick={() => append({ id: '', variant: "", status: "" })} className="w-fit self-start mt-1">Добавить вариант</Button>
        </div>
    )
}