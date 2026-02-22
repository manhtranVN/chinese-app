import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { currentUser, logOut } = useAuth();
    const [vocabData, setVocabData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Group từ vựng theo HSK level
    const [hskGroups, setHskGroups] = useState({
        1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    });

    useEffect(() => {
        const fetchVocab = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'vocabulary'));
                const vocabList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setVocabData(vocabList);

                // Gom nhóm theo HSK
                const groups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
                vocabList.forEach(word => {
                    if (word.hsk && groups[word.hsk]) {
                        groups[word.hsk].push(word);
                    }
                });
                setHskGroups(groups);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu từ vựng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVocab();
    }, []);

    const handleLogout = async () => {
        try {
            await logOut();
            navigate('/login');
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
            alert("Lỗi đăng xuất: " + error.message);
        }
    };
    const handleStartFlashcard = (level) => {
        const levelVocab = hskGroups[level];
        navigate('/flashcard', { state: { vocabList: levelVocab, level } });
    };

    // Thêm hàm này:
    const handleStartQuiz = (level) => {
        const levelVocab = hskGroups[level];
        navigate('/quiz', { state: { vocabList: levelVocab, level } });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <BookOpen size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Góc Học Tập Hán Ngữ</h1>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-gray-600 font-medium">Xin chào, {currentUser?.email}</span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Chọn bộ từ vựng</h2>
                    <p className="text-gray-500">Bắt đầu ôn tập các từ vựng theo cấp độ HSK</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((level) => {
                            const count = hskGroups[level].length;
                            const hasWords = count > 0;

                            return (
                                <div
                                    key={level}
                                    // Bỏ onClick ở đây đi
                                    className={`bg-white rounded-2xl p-6 border transition-all duration-300 ${
                                        hasWords
                                            ? 'border-blue-100 shadow-md hover:shadow-xl'
                                            : 'border-gray-200 opacity-60'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-4 rounded-xl ${hasWords ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <Layers size={32} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            hasWords ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                      {count} từ
                    </span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">HSK {level}</h3>
                                    <p className="text-gray-500 text-sm mb-6">Từ vựng chuẩn HSK cấp {level}</p>

                                    {/* Thay thế nút cũ bằng 2 nút này */}
                                    {hasWords ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStartFlashcard(level)}
                                                className="flex-1 py-2.5 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition"
                                            >
                                                Flashcard
                                            </button>
                                            <button
                                                onClick={() => handleStartQuiz(level)}
                                                className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-blue-500/30 transition"
                                            >
                                                Trắc nghiệm
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full text-center py-2.5 bg-gray-100 text-gray-400 font-medium rounded-xl">
                                            Chưa có từ vựng
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;