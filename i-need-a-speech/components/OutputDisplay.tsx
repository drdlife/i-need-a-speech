import React from 'react';
import { GeneratedSpeech } from '../types';
import { generatePDF } from '../utils/pdfUtils';
import { decodeBase64, bytesToInt16, pcmToWav } from '../utils/audioUtils';
import { Download, FileText, Copy, Play, Pause, Share2, RefreshCw, Volume2, Wand2, Send, X } from 'lucide-react';

interface OutputDisplayProps {
  speech: GeneratedSpeech;
  audioBase64: string | null;
  isGeneratingAudio: boolean;
  isRevising: boolean;
  onGenerateAudio: () => void;
  onRevise: (instruction: string) => void;
  onReset: () => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ speech, audioBase64, isGeneratingAudio, isRevising, onGenerateAudio, onRevise, onReset }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [showRevisionInput, setShowRevisionInput] = React.useState(false);
  const [revisionPrompt, setRevisionPrompt] = React.useState('');

  React.useEffect(() => {
    if (audioBase64) {
      try {
        const rawBytes = decodeBase64(audioBase64);
        const pcmData = bytesToInt16(rawBytes);
        const wavBlob = pcmToWav(pcmData);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) { console.error("Failed to process audio", e); }
    } else {
      setAudioUrl(null);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setIsPlaying(false);
    }
  }, [audioBase64]);

  const handlePlayPause = () => {
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(`${speech.title}\n\n${speech.content}`); alert("Speech copied!"); };
  const shareSpeech = async () => { if (navigator.share) { await navigator.share({ title: speech.title, text: speech.content }); } else { copyToClipboard(); } };
  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([`${speech.title}\n\n${speech.content}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${speech.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); element.click(); document.body.removeChild(element);
  };
  const handleRevisionSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!revisionPrompt.trim()) return; onRevise(revisionPrompt); setRevisionPrompt(''); setShowRevisionInput(false); };
  const applyQuickRevision = (instruction: string) => { onRevise(instruction); setShowRevisionInput(false); }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-10 transition-colors duration-300">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={onReset} className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 flex items-center gap-2 text-sm font-medium"><RefreshCw className="w-4 h-4" /><span className="hidden sm:inline">New</span></button>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
           <button onClick={() => setShowRevisionInput(!showRevisionInput)} className={`flex items-center gap-2 text-sm font-medium ${showRevisionInput ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600'}`}><Wand2 className="w-4 h-4" />Revise with AI</button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {audioUrl ? (
             <div className="flex items-center gap-2 mr-2 bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1.5 rounded-full border border-indigo-100">
               <button onClick={handlePlayPause} className="text-indigo-700 dark:text-indigo-300">{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>
               <a href={audioUrl} download={`${speech.title}.wav`} className="text-indigo-700 dark:text-indigo-300"><Download className="w-5 h-5" /></a>
             </div>
          ) : (
            <button onClick={onGenerateAudio} disabled={isGeneratingAudio || isRevising} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isGeneratingAudio ? 'bg-gray-100' : 'bg-indigo-50 text-indigo-700'}`}>
              {isGeneratingAudio ? (<div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />) : (<Volume2 className="w-4 h-4" />)}
              {isGeneratingAudio ? 'Generating...' : 'Audio'}
            </button>
          )}
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <button onClick={copyToClipboard} className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600"><Copy className="w-5 h-5" /></button>
          <button onClick={() => generatePDF(speech)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600"><FileText className="w-5 h-5" /></button>
          <button onClick={downloadText} className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600"><Download className="w-5 h-5" /></button>
          <button onClick={shareSpeech} className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600"><Share2 className="w-5 h-5" /></button>
        </div>
      </div>
      {showRevisionInput && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-900 animate-in slide-in-from-top-4">
           <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Wand2 className="w-4 h-4 text-indigo-500" />How should we change the speech?</h3>
              <button onClick={() => setShowRevisionInput(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
           </div>
           <form onSubmit={handleRevisionSubmit} className="flex gap-2 mb-3">
             <input type="text" autoFocus value={revisionPrompt} onChange={(e) => setRevisionPrompt(e.target.value)} placeholder="e.g. Make the ending more emotional..." className="flex-grow p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-sm" />
             <button type="submit" disabled={!revisionPrompt.trim() || isRevising} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Send className="w-4 h-4" />Revise</button>
           </form>
           <div className="flex flex-wrap gap-2">
             {['Make it shorter', 'Make it longer', 'More humorous', 'More formal', 'Add a quote', 'Simpler language'].map((opt) => (
               <button key={opt} onClick={() => applyQuickRevision(opt)} disabled={isRevising} className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600">{opt}</button>
             ))}
           </div>
        </div>
      )}
      <div className="bg-paper dark:bg-zinc-800 text-ink dark:text-gray-100 p-8 md:p-16 rounded-sm shadow-2xl min-h-[600px] border border-stone-200 dark:border-zinc-700 relative overflow-hidden transition-all duration-300">
        {isRevising && (<div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center"><div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3"><div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div><span className="font-medium text-gray-800 dark:text-white">Rewriting your speech...</span></div></div>)}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-700 opacity-50"></div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12 leading-tight">{speech.title}</h1>
        <div className="font-serif text-lg md:text-xl leading-relaxed whitespace-pre-wrap">{speech.content}</div>
        <div className="mt-16 text-center text-stone-400 dark:text-zinc-500 text-sm italic font-serif">— Generated by I Need a Speech</div>
      </div>
    </div>
  );
};
export default OutputDisplay;
