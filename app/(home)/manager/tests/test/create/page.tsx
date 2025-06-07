'use client'
import { useForm, useFieldArray, Controller, SubmitHandler } from "react-hook-form"
import { CreateQuestionDto, createTest } from "@/services/manager.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Image from "next/image"
import Cookies from "js-cookie"
import { useEffect } from "react"
import NotFound from "@/app/not-found"
export default function CreateTestPage() {
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
    const manager_id = Cookies.get("isManager") // TODO: получить id менеджера из auth/session
    const { control, register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateQuestionDto>({
        defaultValues: {
            manager_id,
            test_name: "",
            questions: [
                {
                    question: "",
                    variants: [
                        { variant: "", status: "" },
                        { variant: "", status: "" }
                    ]
                }
            ]
        }
    })
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: "questions"
    })
    const onSubmit: SubmitHandler<CreateQuestionDto> = async (data) => {
        const res = await createTest(data)
        window.location.href = `/manager/tests/test/${res.id}`
        reset()
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-600">
            <div className="bg-green-400 p-8 rounded-lg w-full max-w-2xl border-2 border-green-800 mt-10">
                <h1 className="text-2xl mb-6 text-center text-green-900 font-bold">Создание теста</h1>
                <div className="flex items-center justify-center">
                    <Image src="/Перчини.png" alt="Logo" width={400} height={900} className="text-center"/>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <Input type="text" placeholder="Название теста" {...register("test_name", { required: true })} className="bg-white" />
                    {questionFields.map((q, qIdx) => (
                        <div key={q.id} className="bg-white rounded p-4 mb-2 border border-green-300">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-green-800">Вопрос {qIdx + 1}</span>
                                <Button type="button" variant="destructive" className="ml-2" onClick={() => removeQuestion(qIdx)} disabled={questionFields.length === 1}>Удалить вопрос</Button>
                            </div>
                            <Input type="text" placeholder="Текст вопроса" {...register(`questions.${qIdx}.question`, { required: true })} className="mb-2" />
                            <VariantsField control={control} register={register} qIdx={qIdx} />
                        </div>
                    ))}
                    <Button type="button" onClick={() => appendQuestion({ question: "", variants: [{ variant: "", status: "" }, { variant: "", status: "" }] })}>Добавить вопрос</Button>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Создание..." : "Создать тест"}</Button>
                </form>
            </div>
        </div>
    )
}

function VariantsField({ control, register, qIdx }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `questions.${qIdx}.variants`
    })
    return (
        <div className="flex flex-col gap-2">
            <span className="text-green-700 font-medium">Варианты ответа:</span>
            {fields.map((v, vIdx) => (
                <div key={v.id} className="flex gap-2 items-center">
                    <Input type="text" placeholder={`Вариант ${vIdx + 1}`} {...register(`questions.${qIdx}.variants.${vIdx}.variant`, { required: true })} />
                    <Input type="text" placeholder="Статус (true/false)" {...register(`questions.${qIdx}.variants.${vIdx}.status`, { required: true })} className="w-28" />
                    <Button type="button" variant="destructive" onClick={() => remove(vIdx)} disabled={fields.length === 2}>-</Button>
                </div>
            ))}
            <Button type="button" onClick={() => append({ variant: "", status: "" })} className="w-fit">Добавить вариант</Button>
        </div>
    )
}