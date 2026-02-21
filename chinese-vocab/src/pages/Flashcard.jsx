import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const Flashcard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy dữ liệu được truyền từ trang Home
    const vocabList = location.state?.vocabList || [];
    const level = location.state?.level || 1;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Bảo vệ nếu truy cập trực tiếp URL mà không có data
    if (!vocabList || vocabList.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy dữ liệu từ vựng!</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700"
                >
                    Quay lại Trang chủ
                </button>
            </div>
        );
    }

    const currentWord = vocabList[currentIndex];

    const handleNext = () => {
        if (currentIndex < vocabList.length - 1) {
            setIsFlipped(false); // Trả lại mặt trước trước khi sang thẻ mới
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 px-4">
            {/* Header điều hướng */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition bg-white px-4 py-2 rounded-lg shadow-sm"
                >
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h1 className="text-xl font-bold text-gray-800 bg-white px-6 py-2 rounded-lg shadow-sm">
                    Bộ từ vựng HSK {level}
                </h1>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-2xl mb-8">
                <div className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
                    <span>Tiến độ</span>
                    <span>{currentIndex + 1} / {vocabList.length}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${((currentIndex + 1) / vocabList.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Vùng chứa Thẻ 3D */}
            <div
                className="w-full max-w-lg aspect-[4/3] relative cursor-pointer group perspective-1000 mb-12"
                onClick={handleFlip}
            >
                <div className={`w-full h-full absolute transition-all duration-500 transform-style-3d shadow-xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>

                    {/* Mặt trước: Chỉ hiện Chữ Hán */}
                    <div className="absolute w-full h-full bg-white rounded-3xl backface-hidden flex flex-col items-center justify-center p-8 border-2 border-gray-100">
                        <span className="text-gray-400 font-medium mb-6 absolute top-6">Mặt trước (Hanzi)</span>
                        <div className="text-[120px] font-bold text-gray-800 leading-none">
                            {currentWord.hanzi}
                        </div>
                        <div className="absolute bottom-6 text-gray-400 flex items-center gap-2 text-sm">
                            <RotateCcw size={16} /> Nhấp để lật mặt sau
                        </div>
                    </div>

                    {/* Mặt sau: Hiện Pinyin và Nghĩa (Đã xoay 180 độ sẵn) */}
                    <div className="absolute w-full h-full bg-blue-600 text-white rounded-3xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 shadow-inner">
                        <span className="text-blue-200 font-medium mb-4 absolute top-6">Mặt sau (Chi tiết)</span>

                        <div className="flex flex-col items-center space-y-6">
                            <div className="text-6xl font-medium tracking-wide border-b border-blue-400 pb-4 w-full text-center">
                                {currentWord.pinyin}
                            </div>
                            <div className="text-3xl font-bold text-blue-50 text-center px-4">
                                {currentWord.meaning}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Controls: Next / Prev */}
            <div className="flex items-center gap-6">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={`p-4 rounded-full flex items-center justify-center transition shadow-md ${
                        currentIndex === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                >
                    <ChevronLeft size={32} />
                </button>

                <button
                    onClick={handleFlip}
                    className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:border-blue-400 transition"
                >
                    Lật Thẻ
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === vocabList.length - 1}
                    className={`p-4 rounded-full flex items-center justify-center transition shadow-md ${
                        currentIndex === vocabList.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
};

export default Flashcard;