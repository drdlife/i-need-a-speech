import React from 'react';
import { SpeechRequest, SpeechTone, SpeechLength } from '../types';
import { Mic, Sparkles } from 'lucide-react';

interface InputFormProps {
  isLoading: boolean;
  onSubmit: (request: SpeechRequest) => void;
}

const InputForm: React.FC<InputFormProps> = ({ isLoading, onSubmit }) => {
  const [topic, setTopic] = React.useState('');
  const [tone, setTone] = React.useState<SpeechTone>(SpeechTone.HEARTFELT);
  const [length, setLength] = React.useState<SpeechLength>(SpeechLength.MEDIUM);
  const [speakerName, setSpeakerName] = React.useState('');
  const [audience, setAudience] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit({ topic, tone, length, speakerName, audience });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Create Your Speech
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Tell us about the occasion, and AI will do the rest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">What is this speech for?</label>
          <textarea required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., A best man speech for my brother who loves fishing..." className="w-full h-32 p-4 text-base text-black bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value as SpeechTone)} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              {Object.values(SpeechTone).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Length</label>
            <select value={length} onChange={(e) => setLength(e.target.value as SpeechLength)} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              {Object.values(SpeechLength).map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
           <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Name (Optional)</label>
            <input type="text" value={speakerName} onChange={(e) => setSpeakerName(e.target.value)} placeholder="e.g., John Doe" className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
           <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Audience (Optional)</label>
            <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., Friends, Family" className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <button type="submit" disabled={isLoading} className={`w-full py-4 px-6 rounded-xl text-white font-medium text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${isLoading ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-lg'}`}>
          {isLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>Writing...</>) : (<><Sparkles className="w-5 h-5" />Generate Speech</>)}
        </button>
      </form>
    </div>
  );
};
export default InputForm;
