import React, { useEffect, useState } from 'react';
import { SavedSpeech } from '../types';
import { getSavedSpeeches, deleteSpeechFromDb } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, FileText, Calendar, ArrowRight } from 'lucide-react';

interface SavedListProps {
  onSelectSpeech: (speech: SavedSpeech) => void;
  onCreateNew: () => void;
}

const SavedList: React.FC<SavedListProps> = ({ onSelectSpeech, onCreateNew }) => {
  const { user } = useAuth();
  const [speeches, setSpeeches] = useState<SavedSpeech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeeches = async () => {
      if (user) {
        try {
          const list = await getSavedSpeeches(user.uid);
          setSpeeches(list);
        } catch (e) {
          console.error("Failed to fetch speeches", e);
        }
      }
      setLoading(false);
    };
    fetchSpeeches();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this speech?")) {
      try {
        await deleteSpeechFromDb(id);
        setSpeeches(speeches.filter(s => s.id !== id));
      } catch (err) {
        alert("Failed to delete speech");
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (speeches.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No saved speeches yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Create your first speech and save it to your account to access it anytime.</p>
        <button 
          onClick={onCreateNew}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30"
        >
          Create New Speech
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Speeches</h2>
        <button 
          onClick={onCreateNew}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg transition-colors"
        >
          + Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {speeches.map((speech) => (
          <div 
            key={speech.id} 
            onClick={() => onSelectSpeech(speech)}
            className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <button 
                onClick={(e) => handleDelete(e, speech.id)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{speech.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
              {speech.content}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(speech.createdAt).toLocaleDateString()}
              </div>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedList;