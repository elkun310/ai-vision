// frontend/src/App.js
import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Loader2, Download, Zap, Eye, Search, FileText, Rocket } from 'lucide-react';

function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('general');
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const analysisModes = [
    { id: 'general', name: 'Phân tích tổng quan', icon: Eye, prompt: 'Describe this image in detail in Vietnamese, including: main objects, colors, context, emotions, and notable details.' },
    { id: 'objects', name: 'Nhận diện vật thể', icon: Search, prompt: 'List ALL objects in this image in Vietnamese. Count the quantity and describe the position of each type.' },
    { id: 'text', name: 'Đọc chữ (OCR)', icon: FileText, prompt: 'Extract ALL text from this image. Include text on signs, labels, posters, documents. Write in Vietnamese.' },
    { id: 'people', name: 'Phân tích con người', icon: Camera, prompt: 'Analyze people in the image in Vietnamese: count, estimated gender, estimated age, clothing, actions, emotions, interactions.' },
    { id: 'scene', name: 'Nhận diện cảnh', icon: Sparkles, prompt: 'Analyze the scene in Vietnamese: location (indoor/outdoor), time (day/night), weather, lighting, overall atmosphere.' },
    { id: 'quality', name: 'Đánh giá chất lượng', icon: Zap, prompt: 'Evaluate image quality in Vietnamese: resolution, sharpness, color balance, composition, shooting angle, lighting. Rate 1-10 and suggest improvements.' },
    { id: 'custom', name: 'Tùy chỉnh', icon: FileText, prompt: '' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn ảnh dưới 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      alert('Vui lòng chọn ảnh!');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      const selectedMode = analysisModes.find(m => m.id === analysisMode);
      const prompt = analysisMode === 'custom' && customPrompt 
        ? customPrompt 
        : selectedMode.prompt;

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Data,
          prompt: prompt
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }

      const analysis = data.choices[0].message.content;

      setResult({
        mode: selectedMode.name,
        analysis: analysis,
        timestamp: new Date().toLocaleString('vi-VN'),
        model: 'Llama 3.2 90B Vision (Groq)'
      });

    } catch (error) {
      setResult({
        mode: 'Lỗi',
        analysis: `❌ Lỗi: ${error.message}\n\nKiểm tra:\n1. Backend server có chạy không? (http://localhost:5000)\n2. Groq API key đúng chưa?\n3. Có kết nối internet không?`,
        timestamp: new Date().toLocaleString('vi-VN')
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    
    const report = `=== BÁO CÁO PHÂN TÍCH HÌNH ẢNH ===
Chế độ: ${result.mode}
Model: ${result.model}
Thời gian: ${result.timestamp}
File: ${image.name}

=== KẾT QUẢ PHÂN TÍCH ===
${result.analysis}

---
Powered by Groq AI
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `groq_analysis_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="w-12 h-12 text-orange-600 mr-3 animate-bounce" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              AI Vision × Groq
            </h1>
            <Zap className="w-12 h-12 text-yellow-500 ml-3" />
          </div>
          <p className="text-gray-600 text-lg">⚡ Siêu nhanh • 🆓 Miễn phí • 🔥 Powered by Llama 3.2 Vision</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-2 text-orange-600" />
              Upload Hình Ảnh
            </h2>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-orange-300 rounded-xl p-8 text-center hover:bg-orange-50 transition cursor-pointer mb-4"
            >
              <Camera className="w-16 h-16 mx-auto text-orange-600 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Click để chọn ảnh</p>
              <p className="text-sm text-gray-500">JPG, PNG, WebP (Tối đa 5MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {imagePreview && (
              <div className="mb-4">
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-auto max-h-96 object-contain bg-gray-100"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                    {image.name}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-3">Chọn chế độ phân tích:</h3>
              <div className="grid grid-cols-2 gap-2">
                {analysisModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setAnalysisMode(mode.id)}
                      className={`p-3 rounded-lg border-2 transition text-left ${
                        analysisMode === mode.id
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${
                        analysisMode === mode.id ? 'text-orange-600' : 'text-gray-600'
                      }`} />
                      <p className="text-sm font-medium text-gray-800">{mode.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {analysisMode === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập yêu cầu phân tích:
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ví dụ: Hãy mô tả chi tiết về màu sắc và phong cách..."
                  className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:border-orange-600 focus:outline-none"
                  rows={3}
                />
              </div>
            )}

            <button
              onClick={analyzeImage}
              disabled={!image || analyzing || (analysisMode === 'custom' && !customPrompt)}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang phân tích siêu tốc...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Phân tích với Groq ⚡
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-red-600" />
              Kết Quả Phân Tích
            </h2>

            {!result && !analyzing && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <FileText className="w-24 h-24 mb-4" />
                <p className="text-lg">Chưa có kết quả phân tích</p>
                <p className="text-sm">Upload ảnh và nhấn phân tích</p>
              </div>
            )}

            {analyzing && (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-4" />
                  <Zap className="w-6 h-6 text-yellow-500 absolute top-0 right-0 animate-pulse" />
                </div>
                <p className="text-lg font-medium text-gray-700">Groq đang xử lý siêu tốc...</p>
                <p className="text-sm text-gray-500 mt-2">⚡ Nhanh hơn gấp 10-20 lần</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-orange-800">{result.mode}</span>
                      <p className="text-xs text-gray-600 mt-1">🚀 {result.model}</p>
                    </div>
                    <button
                      onClick={downloadReport}
                      className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Tải báo cáo
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{result.timestamp}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {result.analysis.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-3 text-gray-800 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                      setResult(null);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
                  >
                    Phân tích ảnh mới
                  </button>
                  <button
                    onClick={analyzeImage}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition"
                  >
                    Phân tích lại
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Ưu điểm Groq AI:</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl mb-2">🆓</div>
              <h4 className="font-bold text-gray-800 mb-1">Miễn phí</h4>
              <p className="text-sm text-gray-600">Không giới hạn requests trong beta</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-bold text-gray-800 mb-1">Siêu nhanh</h4>
              <p className="text-sm text-gray-600">LPU architecture, nhanh hơn GPU 10-20x</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-bold text-gray-800 mb-1">Llama 3.2 Vision</h4>
              <p className="text-sm text-gray-600">Model vision mạnh mẽ từ Meta</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl mb-2">🔓</div>
              <h4 className="font-bold text-gray-800 mb-1">Open Source</h4>
              <p className="text-sm text-gray-600">Không vendor lock-in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;