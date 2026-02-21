import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const vocabList = location.state?.vocabList || [];
    const level = location.state?.level || 1;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isFinished, setIsFinished] = useState(false);

    // Sinh đáp án mỗi khi chuyển câu mới
    useEffect(() => {
        if (vocabList.length > 0 && currentIndex < vocabList.length) {
            generateAnswers();
        } else if (currentIndex >= vocabList.length && vocabList.length > 0) {
            setIsFinished(true);
        }
    }, [currentIndex, vocabList]);

    const generateAnswers = () => {
        const currentWord = vocabList[currentIndex];
        const correctMeaning = currentWord.meaning;

        // Lọc ra các từ khác để lấy nghĩa sai
        let wrongOptions = vocabList
            .filter((w) => w.id !== currentWord.id)
            .sort(() => 0.5 - Math.random()) // Trộn ngẫu nhiên
            .slice(0, 3)
            .map(w => w.meaning);

        // Fallback: Nếu bộ từ ít hơn 4 từ, sinh thêm đáp án giả
        while (wrongOptions.length < 3) {
            wrongOptions.push(`Nghĩa ảo ${wrongOptions.length + 1}`);
        }

        // Gộp đáp án đúng và sai, sau đó trộn ngẫu nhiên lại
        const allOptions = [...wrongOptions, correctMeaning].sort(() => 0.5 - Math.random());
        setAnswers(allOptions);
        setSelectedAnswer(null); // Reset lựa chọn
    };

    const handleSelect = (answer) => {
        if (selectedAnswer) return; // Nếu đã chọn rồi thì không cho bấm liên tục
        setSelectedAnswer(answer);

        const isCorrect = answer === vocabList[currentIndex].meaning;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Delay chuyển câu: Đúng thì qua nhanh (1s), Sai thì để lâu hơn (2s) để học viên nhìn đáp án đúng
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, isCorrect ? 1000 : 2000);
    };

    // Xử lý nếu truy cập không có data
    if (vocabList.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-xl mb-4 text-gray-600">Chưa có dữ liệu từ vựng. Vui lòng quay lại.</p>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Về Trang chủ</button>
            </div>
        );
    }

    // Màn hình kết thúc
    if (isFinished || currentIndex >= vocabList.length) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <h2 className="text-4xl font-bold mb-4 text-green-600">Hoàn thành! 🎉</h2>
                    <p className="text-xl mb-8 text-gray-600">
                        Bạn trả lời đúng: <span className="text-2xl font-bold text-gray-800">{score}</span> / {vocabList.length} câu
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setCurrentIndex(0);
                                setScore(0);
                                setIsFinished(false);
                            }}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                        >
                            Học lại
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentWord = vocabList[currentIndex];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 px-4">
            {/* Header */}
            <div className="w-full max-w-xl flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition bg-white px-4 py-2 rounded-lg shadow-sm"
                >
                    <ArrowLeft size={20} /> Thoát
                </button>
                <div className="bg-white px-6 py-2 rounded-lg shadow-sm font-bold text-gray-500">
                    Câu {currentIndex + 1} / {vocabList.length}
                </div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-xl bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center border border-gray-100">

                {/* Câu hỏi */}
                <div className="mb-10 text-gray-400 font-medium">Chọn nghĩa đúng của từ sau:</div>
                <div className="text-[100px] font-bold text-gray-800 leading-none mb-12">
                    {currentWord.hanzi}
                </div>

                {/* Các đáp án */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {answers.map((ans, idx) => {
                        let btnClass = "p-4 text-lg font-medium rounded-xl border-2 transition-all duration-300 w-full ";

                        if (selectedAnswer) {
                            if (ans === currentWord.meaning) {
                                // Đáp án đúng luôn hiện màu Xanh khi đã chọn (dù chọn đúng hay sai)
                                btnClass += "bg-green-100 text-green-700 border-green-500";
                            } else if (ans === selectedAnswer) {
                                // Đáp án sai mà user click vào -> Đỏ
                                btnClass += "bg-red-100 text-red-700 border-red-500";
                            } else {
                                // Các đáp án sai khác mờ đi
                                btnClass += "bg-gray-50 text-gray-400 border-gray-200 opacity-50";
                            }
                        } else {
                            // Trạng thái bình thường chưa chọn
                            btnClass += "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(ans)}
                                disabled={!!selectedAnswer}
                                className={btnClass}
                            >
                                {ans}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Quiz;