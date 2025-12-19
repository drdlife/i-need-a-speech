import React, { useState } from 'react';
import { SpeechRequest, GeneratedSpeech, GenerationStatus } from './types';
import { generateSpeechText, generateSpeechAudio, reviseSpeech } from './services/geminiService';
import { useTheme } from './contexts/ThemeContext';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import { Mic2, Sun, Moon } from 'lucide-react';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [speech, setSpeech] = useState<GeneratedSpeech | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSpeechRequest = async (request: SpeechRequest) => {
    setStatus('generating_text');
    setErrorMsg(null);
    try {
      const generatedSpeech = await generateSpeechText(request);
      setSpeech(generatedSpeech);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong.");
      setStatus('error');
    }
  };

  const handleRevisionRequest = async (instruction: string) => {
    if (!speech) return;
    setStatus('generating_text'); 
    try {
      const revisedSpeech = await reviseSpeech(speech.content, instruction);
      setSpeech(revisedSpeech);
      setAudioBase64(null);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to revise the speech. Please try again.");
      setStatus('completed');
    }
  };

  const handleAudioGeneration = async () => {
    if (!speech) return;
    setStatus('generating_audio');
    try {
      const audioData = await generateSpeechAudio(speech.content);
      setAudioBase64(audioData);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate audio. Please try again.");
      setStatus('completed');
    }
  };

  const resetApp = () => {
    setStatus('idle');
    setSpeech(null);
    setAudioBase64(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="bg-indigo-600 p-2 rounded-lg"><Mic2 className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">I Need a Speech</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-lg transition-colors">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-start pt-10 pb-20 px-4 sm:px-6">
        {status === 'error' && (
          <div className="w-full max-w-2xl mb-6 bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setStatus('idle')} className="font-semibold underline">Try Again</button>
          </div>
        )}
        {speech ? (
          <OutputDisplay 
            speech={speech} 
            audioBase64={audioBase64}
            isGeneratingAudio={status === 'generating_audio'}
            isRevising={status === 'generating_text' && !!speech}
            onGenerateAudio={handleAudioGeneration}
            onRevise={handleRevisionRequest}
            onReset={resetApp}
          />
        ) : (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Perfect speeches, <br/><span className="text-indigo-600 dark:text-indigo-400">written instantly.</span></h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">Whether it's a wedding toast, a eulogy, or a class presentation, get a personalized speech in seconds.</p>
            </div>
            <InputForm isLoading={status === 'generating_text'} onSubmit={handleSpeechRequest} />
          </div>
        )}
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 dark:text-gray-500 text-sm">&copy; {new Date().getFullYear()} I Need a Speech. All rights reserved.</div>
      </footer>
    </div>
  );
}
export default App;
