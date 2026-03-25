import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Music, Plus, Play, BookOpen, Loader2, Trash2 } from 'lucide-react';
import { speakText } from '../services/ttsService';

export function RhymeExplorer({ useIA }: { useIA: boolean }) {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const rhymes = [
    { word: "Gato", rhyme: "Pato" },
    { word: "Bola", rhyme: "Escola" },
    { word: "Leão", rhyme: "Melão" },
    { word: "Mão", rhyme: "Pão" }
  ];

  const handleSpeak = async (word: string, rhyme: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveWord(word);
    try {
      await speakText(`${word} rima com ${rhyme}`, useIA);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="card bg-brand-primary/5 border-brand-primary/10 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
          <Music size={20} />
        </div>
        <div>
          <h3 className="font-bold text-brand-text text-lg">Explorador de Rimas</h3>
          <p className="text-xs text-brand-text/60 font-medium">Toque para ouvir as rimas!</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rhymes.map((pair) => (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={pair.word}
            onClick={() => handleSpeak(pair.word, pair.rhyme)}
            className={`p-6 rounded-3xl bg-white border-2 transition-all shadow-sm ${
              activeWord === pair.word ? "border-brand-primary shadow-brand-primary/10" : "border-transparent"
            }`}
          >
            <p className="text-xl font-bold text-brand-text">{pair.word}</p>
            <AnimatePresence>
              {activeWord === pair.word && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-brand-primary font-bold mt-2 text-lg"
                >
                  {pair.rhyme}!
                </motion.p>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function SoundBoard({ useIA }: { useIA: boolean }) {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const letters = [
    { char: "A", sound: "Aaaaaa" },
    { char: "M", sound: "Mmmmm" },
    { char: "P", sound: "P!" },
    { char: "B", sound: "B-b-b" }
  ];

  const handleSpeak = async (char: string) => {
    setIsPlaying(char);
    try { await speakText(`O som da letra ${char} é: ${char}`, useIA); }
    finally { setIsPlaying(null); }
  };

  return (
    <div className="card bg-brand-secondary/5 border-brand-secondary/10 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-secondary/20">
          <Volume2 size={20} />
        </div>
        <div>
          <h3 className="font-bold text-brand-text text-lg">Quadro de Sons</h3>
          <p className="text-xs text-brand-text/60 font-medium">Cada letra tem uma voz!</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {letters.map((l) => (
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            key={l.char} 
            onClick={() => handleSpeak(l.char)} 
            className="bg-white p-6 rounded-3xl border border-brand-secondary/10 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-5xl font-bold text-brand-secondary mb-1">{l.char}</div>
            <p className="text-sm font-bold text-brand-text/50 uppercase tracking-widest">{l.sound}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function SyllableBuilder({ useIA }: { useIA: boolean }) {
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const syllables = ['MA', 'TO', 'PA', 'BO', 'LA', 'DA', 'DE', 'DO'];

  const playWord = async () => {
    if (currentWord.length === 0) return;
    setIsLoading(true);
    try {
      const word = currentWord.join('');
      await speakText(word, useIA);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-brand-accent/5 border-brand-accent/10 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-accent/20">
          <Plus size={20} />
        </div>
        <div>
          <h3 className="font-bold text-brand-text text-lg">Construtor de Sílabas</h3>
          <p className="text-xs text-brand-text/60 font-medium">Junte as partes para formar palavras!</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-8 min-h-[80px] p-6 bg-white rounded-[2rem] border-4 border-dashed border-brand-accent/20 justify-center items-center">
        {currentWord.length === 0 ? (
          <span className="text-brand-accent/40 font-medium italic">Toque nas sílabas abaixo...</span>
        ) : (
          currentWord.map((s, i) => (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={i} 
              className="px-6 py-3 bg-brand-accent text-white font-bold rounded-2xl text-xl shadow-md"
            >
              {s}
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {syllables.map((s) => (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={s} 
            onClick={() => setCurrentWord([...currentWord, s])} 
            className="p-4 bg-white border-2 border-brand-accent/10 rounded-2xl font-bold text-brand-accent hover:border-brand-accent/40 hover:bg-brand-accent/5 transition-colors"
          >
            {s}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={playWord} 
          disabled={isLoading || currentWord.length === 0}
          className="flex-1 bg-brand-accent hover:bg-brand-accent/80 text-white p-5 rounded-3xl font-bold text-lg shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
          Ouvir Palavra
        </button>
        <button 
          onClick={() => setCurrentWord([])} 
          className="px-8 py-5 border-2 border-brand-accent/20 text-brand-accent rounded-3xl font-bold hover:bg-brand-accent/5 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

export function StoryReader({ story, useIA }: { story: { title: string; content: string[] }; useIA: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleRead = async () => {
    setIsPlaying(true);
    try {
      await speakText(`${story.title}. ${story.content.join(' ')}`, useIA);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="card bg-brand-success/5 border-brand-success/10 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-success rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-success/20">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-brand-text text-lg">Leitor de Histórias</h3>
            <p className="text-xs text-brand-text/60 font-medium">Acompanhe a leitura!</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRead} 
          disabled={isPlaying}
          className="p-4 bg-brand-success text-white rounded-full shadow-lg shadow-brand-success/20 disabled:opacity-50"
        >
          {isPlaying ? <Loader2 className="animate-spin" /> : <Play size={24} />}
        </motion.button>
      </div>
      <div className="bg-white p-8 rounded-[2rem] border-2 border-brand-success/10 shadow-sm">
        <h4 className="text-2xl font-serif font-bold mb-6 text-brand-text">{story.title}</h4>
        <div className="space-y-4">
          {story.content.map((line, i) => (
            <p key={i} className="text-brand-text/70 text-lg leading-relaxed font-medium italic">
              "{line}"
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
