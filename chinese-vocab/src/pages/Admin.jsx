// src/pages/Admin.jsx
import { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, writeBatch, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Papa from "papaparse";
import { Trash2, Edit, Upload, Plus, LogOut, Home, BookOpen, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Admin() {
    const [vocabList, setVocabList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // State cho Form
    const [formData, setFormData] = useState({ hanzi: "", pinyin: "", meaning: "", hsk: "1" });
    const [editingId, setEditingId] = useState(null);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onSnapshot(collection(db, "vocabulary"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => a.hsk - b.hsk); // Sắp xếp
            setVocabList(data);
            setLoading(false);
        }, (error) => {
            console.error("Lỗi Realtime Firestore:", error);
            setLoading(false);
        });

        // Cleanup function để ngắt kết nối khi rời trang Admin
        return () => unsubscribe();
    }, []);

    // Xử lý Thêm / Sửa một từ thủ công
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSave = {
                hanzi: formData.hanzi.trim(),
                pinyin: formData.pinyin.trim(),
                meaning: formData.meaning.trim(),
                hsk: parseInt(formData.hsk),
            };

            if (editingId) {
                // Cập nhật
                const docRef = doc(db, "vocabulary", editingId);
                await updateDoc(docRef, dataToSave);
            } else {
                // Thêm mới
                await addDoc(collection(db, "vocabulary"), {
                    ...dataToSave,
                    createdAt: Date.now()
                });
            }

            setFormData({ hanzi: "", pinyin: "", meaning: "", hsk: "1" });
            setEditingId(null);
             // Load lại bảng
        } catch (error) {
            alert("Có lỗi xảy ra: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa từ này không?")) return;
        try {
            await deleteDoc(doc(db, "vocabulary", id));
            setVocabList(vocabList.filter(item => item.id !== id));
        } catch (error) {
            alert("Lỗi khi xóa: " + error.message);
        }
    };

    // Nạp từ vào form để sửa
    const handleEdit = (item) => {
        setFormData({ hanzi: item.hanzi, pinyin: item.pinyin, meaning: item.meaning, hsk: item.hsk.toString() });
        setEditingId(item.id);
    };

    // Xử lý Import CSV siêu tốc với PapaParse & Batch Write
    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        Papa.parse(file, {
            header: true, // Ép PapaParse đọc dòng đầu tiên làm key (hanzi, pinyin, meaning, hsk)
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rawData = results.data;

                    // Firestore giới hạn 500 hành động mỗi Batch. Ta chia nhỏ mảng ra (chunking).
                    const chunks = [];
                    for (let i = 0; i < rawData.length; i += 490) {
                        chunks.push(rawData.slice(i, i + 490));
                    }

                    for (const chunk of chunks) {
                        const batch = writeBatch(db);
                        chunk.forEach((word) => {
                            if (word.hanzi && word.meaning) { // Validate nhẹ
                                const docRef = doc(collection(db, "vocabulary"));
                                batch.set(docRef, {
                                    hanzi: word.hanzi.trim(),
                                    pinyin: word.pinyin ? word.pinyin.trim() : "",
                                    meaning: word.meaning.trim(),
                                    hsk: parseInt(word.hsk) || 1,
                                    createdAt: Date.now()
                                });
                            }
                        });
                        await batch.commit(); // Đẩy 490 từ lên Firestore cùng lúc
                    }

                    alert(`🎉 Đã import thành công ${rawData.length} từ vựng!`);
                } catch (error) {
                    console.error("Lỗi import:", error);
                    alert("Có lỗi khi lưu vào Firebase.");
                } finally {
                    setUploading(false);
                    fileInputRef.current.value = ""; // Reset file input
                }
            }
        });
    };

    const handleLogout = () => {
        signOut(auth);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-6">
            {/* Navbar Admin */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <div className="flex gap-4">
                    <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                        <Home className="w-4 h-4" /> Trang chủ học
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Cột trái: Form Thêm/Sửa & Nút Import */}
                <div className="space-y-6">
                    {/* Box Import CSV */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Import hàng loạt (CSV)</h2>
                        <p className="text-sm text-gray-500 mb-4">File CSV phải có dòng tiêu đề: <code className="bg-gray-100 px-1 rounded text-red-500">hanzi, pinyin, meaning, hsk</code></p>

                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleImportCSV}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-lg cursor-pointer transition ${uploading ? 'bg-gray-50 border-gray-300' : 'border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            <span className="font-medium">{uploading ? "Đang xử lý..." : "Chọn file CSV"}</span>
                        </label>
                    </div>

                    {/* Box Thêm/Sửa thủ công */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                            {editingId ? "Sửa từ vựng" : "Thêm từ mới"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chữ Hán (Hanzi)</label>
                                <input required type="text" value={formData.hanzi} onChange={(e) => setFormData({...formData, hanzi: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ví dụ: 我" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phiên âm (Pinyin)</label>
                                <input required type="text" value={formData.pinyin} onChange={(e) => setFormData({...formData, pinyin: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ví dụ: wǒ" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nghĩa tiếng Việt</label>
                                <input required type="text" value={formData.meaning} onChange={(e) => setFormData({...formData, meaning: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ví dụ: Tôi, tao, tớ" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ HSK</label>
                                <select value={formData.hsk} onChange={(e) => setFormData({...formData, hsk: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                    {[1,2,3,4,5,6].map(level => (
                                        <option key={level} value={level}>HSK {level}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? <Edit className="w-4 h-4"/> : <Plus className="w-4 h-4"/>)}
                                    {editingId ? "Cập nhật" : "Thêm vào kho"}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={() => { setEditingId(null); setFormData({hanzi: "", pinyin: "", meaning: "", hsk: "1"}); }} className="px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Cột phải: Bảng danh sách từ vựng */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-semibold">Kho từ vựng ({vocabList.length} từ)</h2>
                    </div>

                    <div className="overflow-x-auto h-[600px] overflow-y-auto pr-2">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white shadow-sm ring-1 ring-gray-100">
                            <tr className="text-sm text-gray-500 bg-gray-50">
                                <th className="py-3 px-4 font-medium rounded-tl-lg">Hanzi</th>
                                <th className="py-3 px-4 font-medium">Pinyin</th>
                                <th className="py-3 px-4 font-medium">Nghĩa</th>
                                <th className="py-3 px-4 font-medium">HSK</th>
                                <th className="py-3 px-4 font-medium text-right rounded-tr-lg">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {vocabList.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-400">Chưa có từ vựng nào. Hãy thêm hoặc Import CSV nhé!</td></tr>
                            ) : (
                                vocabList.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-xl font-medium text-gray-800">{item.hanzi}</td>
                                        <td className="py-3 px-4 text-blue-600">{item.pinyin}</td>
                                        <td className="py-3 px-4 text-gray-600">{item.meaning}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">HSK {item.hsk}</span>
                                        </td>
                                        <td className="py-3 px-4 flex justify-end gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}