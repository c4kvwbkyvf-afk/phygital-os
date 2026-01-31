import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedImage } from '../types';

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const base64Image = await generateImage(prompt);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: base64Image,
        prompt: prompt,
        timestamp: Date.now()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt(''); 
    } catch (error) {
      alert("Failed to generate image. Please try a different prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-slate-100">Creative Studio</h2>
        <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash Image</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Generation Form */}
          <div className="bg-slate-900 rounded-2xl p-1 border border-slate-800 shadow-xl mb-8">
            <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-2 p-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe an image you want to create (e.g., A futuristic city in a glass sphere)..."
                className="flex-1 bg-slate-950 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-slate-800 transition-all"
              />
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                {isGenerating ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>Dreaming...</span>
                   </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span>Generate</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Gallery Grid */}
          {generatedImages.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-medium text-slate-300">Your Canvas is Empty</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">Start by typing a prompt above to generate unique, high-quality images using Gemini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((img) => (
                <div key={img.id} className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg hover:shadow-purple-900/20 transition-all duration-300">
                  <div className="aspect-square w-full relative">
                     <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                       <p className="text-white text-sm line-clamp-2 mb-2">{img.prompt}</p>
                       <a 
                         href={img.url} 
                         download={`lumina-gen-${img.id}.png`}
                         className="inline-flex items-center text-xs font-medium text-purple-300 hover:text-purple-200"
                       >
                         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                         Download PNG
                       </a>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageView;