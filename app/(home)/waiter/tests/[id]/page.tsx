'use client';

import { useEffect, useState } from 'react';
import { getTestById, QuestionDto, submitTestResults, CreateResultDto, AnswerPayload } from '@/services/waiter.service';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut, Loader2, AlertCircle, Send, HelpCircle, CheckCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import NotFound from '@/app/not-found';
import { toast } from 'sonner';

interface SelectedAnswers {
    [questionId: string]: string; // questionId: selectedVariantText
}

export default function WaiterTestPassing({ params }: { params: { id: string } }) {
    const router = useRouter();
    const testId = params.id;

    const [testData, setTestData] = useState<QuestionDto | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNotWaiter, setIsNotWaiter] = useState(false);
    const [isLoadingRoleCheck, setIsLoadingRoleCheck] = useState(true);
    const [startTime, setStartTime] = useState<Date | null>(null);

    useEffect(() => {
        const isManagerCookie = Cookies.get('isManager');
        if (isManagerCookie === 'true' || isManagerCookie === undefined) {
            setIsNotWaiter(true);
        }
        setIsLoadingRoleCheck(false);

        if (isManagerCookie === 'false') {
            setLoading(true);
            getTestById(testId)
                .then(data => {
                    if (data) {
                        setTestData(data);
                        // Initialize answers from localStorage if available (for resuming)
                        const storedAnswers = localStorage.getItem(`testAnswers_${testId}`);
                        if (storedAnswers) {
                            setSelectedAnswers(JSON.parse(storedAnswers));
                        }
                        setStartTime(new Date()); // Record start time
                    } else {
                        setError('Тест не найден или произошла ошибка при загрузке.');
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch test:', err);
                    setError('Не удалось загрузить тест. Пожалуйста, попробуйте позже.');
                })
                .finally(() => setLoading(false));
        }
    }, [testId]);

    // Save answers to localStorage whenever they change
    useEffect(() => {
        if (testData) {
            localStorage.setItem(`testAnswers_${testId}`, JSON.stringify(selectedAnswers));
        }
    }, [selectedAnswers, testId, testData]);

    const handleLogout = () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('isManager');
        Cookies.remove('waiterId');
        localStorage.removeItem(`testAnswers_${testId}`); // Clear stored answers on logout
        router.push('/auth');
    };

    const handleAnswerSelect = (questionId: string, variantText: string) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: variantText }));
    };

    const handleNextQuestion = () => {
        if (testData && currentQuestionIndex < testData.question.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSelectQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const handleFinishTest = async () => {
        if (!testData || !startTime) {
            alert('Ошибка: Данные теста или время начала отсутствуют.');
            return;
        }

        const employeeId = Cookies.get('waiterId');
        if (!employeeId) {
            alert('Ошибка: ID сотрудника не найден. Пожалуйста, войдите снова.');
            router.push('/auth');
            return;
        }

        const answersPayload: AnswerPayload[] = testData.question.map(q => ({
            question_id: q.id,
            answer_id: selectedAnswers[q.id] || "ответ не выбран" // Use selected variant text as answer_id. Handle if not answered.
        }));

        const resultDto: CreateResultDto = {
            test_id: testId,
            start_time: startTime,
            end_time: new Date(),
            employee_id: employeeId,
            answers: answersPayload,
        };

        try {
            setLoading(true); // Show loading indicator during submission
            await submitTestResults(resultDto);
            console.log(resultDto)
            localStorage.removeItem(`testAnswers_${testId}`);
            toast('Тест успешно завершен и результаты отправлены!'); // Toast is shown by service
            router.push(`/waiter/results/${testId}`);
        } catch (submissionError) {
            // Error toast is already shown by the service
            console.error('Submission failed:', submissionError);
            // Optionally, allow user to retry or save answers locally again
            // For now, we just keep them on the page, loading set to false by finally block if any
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };
    
    if (isLoadingRoleCheck || (loading && !isNotWaiter)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 p-4">
                <Image src="/Перчини.png" alt="Логотип Перчини" width={280} height={75} priority className="mb-8" />
                <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
                <p className="text-white text-xl">{isLoadingRoleCheck ? 'Проверка доступа...' : 'Загрузка теста...'}</p>
            </div>
        );
    }

    if (isNotWaiter) return <NotFound />;
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 p-4 text-white">
                <Image src="/Перчини.png" alt="Логотип Перчини" width={280} height={75} priority className="mb-8" />
                <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
                <p className="text-xl mb-2">Ошибка</p>
                <p className="text-center mb-6">{error}</p>
                <Button onClick={() => router.push('/waiter')} className="bg-green-300 text-green-900 hover:bg-white">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Вернуться к панели
                </Button>
            </div>
        );
    }
    if (!testData || testData.question.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 p-4 text-white">
                <Image src="/Перчини.png" alt="Логотип Перчини" width={280} height={75} priority className="mb-8" />
                <HelpCircle className="h-12 w-12 text-yellow-300 mb-4" />
                <p className="text-xl text-center">Тест не содержит вопросов или не может быть загружен.</p>
                <Button onClick={() => router.push('/waiter/tests')} className="mt-6 bg-green-300 text-green-900 hover:bg-white">
                    <ChevronLeft className="mr-2 h-5 w-5" /> К списку тестов
                </Button>
            </div>
        );
    }

    const currentQuestion = testData.question[currentQuestionIndex];
    const totalQuestions = testData.question.length;
    const answeredQuestionsCount = Object.keys(selectedAnswers).length;

    return (
        <div className="flex flex-col items-center min-h-screen bg-green-600 p-4 pt-6 sm:pt-4">
            <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-2 sm:px-0">
                <Image src="/Перчини.png" alt="Логотип Перчини" width={200} height={50} priority />
                <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-red-500 text-white hover:bg-red-600 flex items-center shadow-md text-sm py-1 px-3"
                >
                    <LogOut className="mr-1.5 h-4 w-4" /> Выйти
                </Button>
            </div>

            <div className="bg-green-400 p-5 sm:p-6 rounded-lg w-full max-w-4xl border-2 border-green-800 shadow-xl">
                <h1 className="text-xl sm:text-2xl font-bold text-center text-green-900 mb-2">{testData.name}</h1>
                <p className="text-sm text-center text-green-800 mb-4">Вопрос {currentQuestionIndex + 1} из {totalQuestions} | Отвечено: {answeredQuestionsCount}/{totalQuestions}</p>

                {/* Question Navigation Panel */}
                <div className="mb-6 p-3 bg-green-300 rounded-md overflow-x-auto whitespace-nowrap flex justify-center">
                    {testData.question.map((_, index) => (
                        <Button
                            key={`qnav-${index}`}
                            variant={currentQuestionIndex === index ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSelectQuestion(index)}
                            className={`min-w-[36px] h-9 mx-1 text-sm 
                                ${currentQuestionIndex === index 
                                    ? 'bg-green-700 text-white border-green-800'
                                    : selectedAnswers[testData.question[index].id] 
                                        ? 'bg-green-500 text-white border-green-600' 
                                        : 'bg-white text-green-700 border-green-500 hover:bg-green-100'}`}
                        >
                            {index + 1}
                        </Button>
                    ))}
                </div>

                {/* Current Question Display */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 min-h-[150px]">
                    <h2 className="text-lg sm:text-xl font-semibold text-green-800 mb-4">{currentQuestion.question}</h2>
                    <div className="space-y-2">
                        {currentQuestion.variants.map((variant, vIndex) => (
                            <Button
                                key={vIndex}
                                variant="outline"
                                onClick={() => handleAnswerSelect(currentQuestion.id, variant.id)}
                                className={`w-full justify-start text-left p-3 h-auto text-base 
                                    ${selectedAnswers[currentQuestion.id] === variant.id
                                        ? 'bg-green-200 border-green-600 text-green-900 ring-2 ring-green-600'
                                        : 'bg-gray-50 hover:bg-green-50 border-gray-300 text-gray-700'}`}
                            >
                                {selectedAnswers[currentQuestion.id] === variant.id && <CheckCircle className="mr-2 h-5 w-5 text-green-700 flex-shrink-0" />} 
                                {variant.variant}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Navigation and Finish Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <Button 
                        onClick={handlePreviousQuestion} 
                        disabled={currentQuestionIndex === 0}
                        variant="outline"
                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400"
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" /> Предыдущий вопрос
                    </Button>
                    
                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <Button 
                            onClick={handleFinishTest} 
                            disabled={answeredQuestionsCount < totalQuestions} // Optional: enable only if all answered
                            className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-semibold disabled:bg-red-300 disabled:text-red-700"
                        >
                            <Send className="mr-2 h-5 w-5" /> Завершить тест
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleNextQuestion} 
                            disabled={currentQuestionIndex === totalQuestions - 1}
                            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-green-700 disabled:bg-gray-300"
                        >
                            Следующий вопрос <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

