import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Home as HomeIcon, 
  Star, 
  Award, 
  Menu,
  X,
  PlayCircle,
  Clock,
  Package,
  Heart,
  Sparkles,
  AlertCircle,
  Loader2,
  Zap,
  Volume2,
  BookMarked,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  Trophy,
  Info,
  Download
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BOOK_CONTENT } from './data/bookContent';
import { Phase, Activity } from './types';
import { RhymeExplorer, SoundBoard, SyllableBuilder, StoryReader } from './components/InteractiveTools';
import { speakText } from './services/ttsService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'home' | 'phase' | 'wordLists' | 'stories' | 'chapters' | 'faq' | 'glossary' | 'science' | 'milestones' | 'specialSounds' | 'extraActivities' | 'finalWord';

function WordButton({ word, useIA, className, iconOnly = false }: { word: string; useIA: boolean; className?: string; iconOnly?: boolean; }) {
  const [isLoading, setIsLoading] = useState(false);
  const handleSpeak = async () => {
    setIsLoading(true);
    try { await speakText(word, useIA); } 
    finally { setIsLoading(false); }
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSpeak}
      disabled={isLoading}
      className={cn(
        "p-5 bg-white rounded-3xl border-2 border-brand-primary/10 font-bold text-brand-text transition-all flex items-center justify-center shadow-sm hover:border-brand-primary hover:shadow-md",
          className
        )}
      >
        {isLoading ? <Loader2 size={20} className="animate-spin text-brand-primary" /> : (iconOnly ? <PlayCircle size={24} className="text-brand-primary" /> : <span className="text-lg">{word}</span>)}
      </motion.button>
    );
  }

function SectionAudioButton({ text, useIA }: { text: string; useIA: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const handleSpeak = async () => {
    setIsLoading(true);
    try { await speakText(text, useIA); } 
    finally { setIsLoading(false); }
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleSpeak}
      disabled={isLoading}
      className="p-3 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/20 disabled:opacity-50"
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
    </motion.button>
  );
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [currentPhaseId, setCurrentPhaseId] = useState(1);
  const [currentChapterId, setCurrentChapterId] = useState('c0');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [useIA, setUseIA] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('completedDays');
    if (saved) setCompletedDays(JSON.parse(saved));
  }, []);

  const handlePrint = () => {
    const printContent = document.getElementById('print-view');
    if (!printContent) {
      // Fallback to simple print if element not found
      window.focus();
      window.print();
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita janelas pop-up para exportar o PDF.');
      return;
    }
    
    // Get all styles from the current document to preserve look
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          return '';
        }
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${BOOK_CONTENT.title}</title>
          <style>
            ${styles}
            @media print {
              .break-before-page { page-break-before: always; }
            }
            body { background: white !important; }
          </style>
        </head>
        <body class="p-12">
          <div class="max-w-4xl mx-auto">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.focus();
                window.print();
                // We don't close immediately to let user see if it worked
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleDay = (day: number) => {
    const isAdding = !completedDays.includes(day);
    const newCompleted = isAdding ? [...completedDays, day] : completedDays.filter(d => d !== day);
    setCompletedDays(newCompleted);
    localStorage.setItem('completedDays', JSON.stringify(newCompleted));

    if (isAdding) {
      confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 },
        colors: ['#D4B483', '#C05A44', '#94A684', '#6BCB77']
      });
    }
  };

  const currentPhase = BOOK_CONTENT.phases.find(p => p.id === currentPhaseId) || BOOK_CONTENT.phases[0];
  const currentChapter = BOOK_CONTENT.chapters.find(c => c.id === currentChapterId) || BOOK_CONTENT.chapters[0];

  const getThemeColor = (phaseId: number) => {
    switch (phaseId) {
      case 1: return 'brand-primary';
      case 2: return 'brand-secondary';
      case 3: return 'brand-accent';
      case 4: return 'brand-success';
      default: return 'brand-primary';
    }
  };

  const themeColor = getThemeColor(currentPhaseId);

  const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={() => { onClick(); setSidebarOpen(false); }} 
      className={cn(
        "w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold transition-all",
        active 
          ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
          : "text-brand-text/70 hover:bg-brand-primary/10 hover:text-brand-primary"
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg selection:bg-brand-primary/20 selection:text-brand-text">
      {/* Print View - Always in DOM but hidden, visible only during print */}
      <div id="print-view" className="hidden print:block bg-white p-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <header className="text-center border-b-8 border-brand-secondary pb-12">
            <h1 className="text-6xl font-black text-brand-text mb-4 tracking-tighter font-serif">{BOOK_CONTENT.title}</h1>
            <p className="text-2xl text-brand-text/60 italic font-serif">{BOOK_CONTENT.subtitle}</p>
          </header>

          <section className="prose prose-stone max-w-none">
            <h2 className="text-4xl font-bold border-b-2 border-brand-primary/10 pb-4">Introdução</h2>
            <Markdown remarkPlugins={[remarkGfm]}>{BOOK_CONTENT.introduction.content}</Markdown>
          </section>

          {BOOK_CONTENT.chapters.map(chapter => (
            <section key={chapter.id} className="prose prose-stone max-w-none break-before-page pt-12">
              <h2 className="text-4xl font-bold border-b-2 border-brand-primary/10 pb-4 font-serif text-brand-text">Capítulo {chapter.id}: {chapter.title}</h2>
              {chapter.sections.map((section, idx) => (
                <div key={idx} className="mt-8">
                  <h3 className="text-2xl font-bold text-brand-secondary font-serif">{section.title}</h3>
                  <Markdown remarkPlugins={[remarkGfm]}>{section.content}</Markdown>
                </div>
              ))}
            </section>
          ))}

          <section className="break-before-page pt-12">
            <h2 className="text-4xl font-bold border-b-2 border-brand-primary/10 pb-4 font-serif text-brand-text">As 4 Fases do Método</h2>
            {BOOK_CONTENT.phases.map(phase => (
              <div key={phase.id} className="mt-12 space-y-8">
                <h3 className="text-3xl font-bold text-brand-accent font-serif">Fase {phase.id}: {phase.title}</h3>
                <p className="text-xl text-brand-text/70 italic">{phase.description}</p>
                
                {phase.weeks.map(week => (
                  <div key={week.number} className="mt-8 space-y-6">
                    <h4 className="text-2xl font-bold border-l-4 border-brand-accent pl-4 font-serif">Semana {week.number}: {week.title}</h4>
                    <div className="grid grid-cols-1 gap-6">
                      {week.activities.map(day => (
                        <div key={day.id} className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                          <h5 className="text-lg font-bold text-brand-text mb-2">Dia {day.day}: {day.title}</h5>
                          <Markdown remarkPlugins={[remarkGfm]}>{day.description}</Markdown>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>

          <section className="break-before-page pt-12">
            <h2 className="text-4xl font-bold border-b-2 border-brand-primary/10 pb-4 font-serif text-brand-text">Recursos Adicionais</h2>
            
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-brand-secondary font-serif">Marcos de Desenvolvimento</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-brand-primary/5">
                    <th className="border p-2 text-left">Período</th>
                    <th className="border p-2 text-left">O que esperar</th>
                    <th className="border p-2 text-left">Como saber se está indo bem</th>
                  </tr>
                </thead>
                <tbody>
                  {BOOK_CONTENT.milestones.map((m, idx) => (
                    <tr key={idx}>
                      <td className="border p-2 font-bold">{m.period}</td>
                      <td className="border p-2">{m.expectation}</td>
                      <td className="border p-2">{m.successIndicator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 p-4 bg-brand-accent/10 rounded-xl border border-brand-accent/20">
                <p className="font-bold text-brand-accent">Dica da Metodologia:</p>
                <p className="text-brand-accent/80">{BOOK_CONTENT.milestonesTip}</p>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-brand-secondary font-serif">Sons Especiais (Dígrafos)</h3>
              <div className="grid grid-cols-1 gap-4 mt-4">
                {BOOK_CONTENT.specialSounds.map((s, idx) => (
                  <div key={idx} className="p-4 border rounded-xl">
                    <p className="text-xl font-bold text-brand-secondary">{s.digraph}</p>
                    <p><strong>Som:</strong> {s.sound}</p>
                    <p><strong>Exemplos:</strong> {s.examples}</p>
                    <p className="italic text-brand-text/70"><strong>Como Ensinar:</strong> {s.howToTeach}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-brand-secondary font-serif">Atividades Extras</h3>
              {BOOK_CONTENT.extraActivities.map((phase, idx) => (
                <div key={idx} className="mt-6">
                  <h4 className="text-xl font-bold text-brand-accent">Fase {phase.phase}</h4>
                  <div className="space-y-4 mt-2">
                    {phase.activities.map((act, aIdx) => (
                      <div key={aIdx} className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                        <p className="font-bold">{act.title}</p>
                        <p className="text-sm text-brand-text/70">{act.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-brand-secondary font-serif">Listas de Palavras</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-bold">Fase 2</h4>
                  <p>{BOOK_CONTENT.wordLists.phase2.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-bold">Fase 3</h4>
                  <p>{BOOK_CONTENT.wordLists.phase3.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-bold">Palavras de Alta Frequência</h4>
                  <p>{BOOK_CONTENT.wordLists.highFrequency.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-bold">Frases para Fluidez</h4>
                  <p>{BOOK_CONTENT.wordLists.fluencyPhrases.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-brand-secondary font-serif">Histórias para Prática</h3>
              {BOOK_CONTENT.stories.map((story, idx) => (
                <div key={idx} className="mt-6 p-6 bg-brand-primary/5 rounded-2xl">
                  <h4 className="text-xl font-bold">{story.title}</h4>
                  <div className="mt-2 space-y-2">
                    {story.content.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 break-before-page">
              <h3 className="text-2xl font-bold text-brand-secondary font-serif">Dúvidas Frequentes (FAQ)</h3>
              <div className="space-y-6 mt-4">
                {BOOK_CONTENT.faq.map((item, idx) => (
                  <div key={idx}>
                    <p className="font-bold text-lg text-brand-text">{item.question}</p>
                    <p className="text-brand-text/70">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-brand-secondary font-serif">Glossário</h3>
              <dl className="space-y-4 mt-4">
                {BOOK_CONTENT.glossary.map((item, idx) => (
                  <div key={idx}>
                    <dt className="font-bold text-brand-accent">{item.term}</dt>
                    <dd className="text-brand-text/70">{item.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-12 break-before-page">
              <h3 className="text-2xl font-bold text-brand-secondary">Base Científica</h3>
              <div className="prose prose-stone max-w-none mt-4">
                <Markdown remarkPlugins={[remarkGfm]}>{BOOK_CONTENT.scientificBasis.content}</Markdown>
                <h4 className="mt-8 font-bold">Referências:</h4>
                <ul className="list-disc pl-5">
                  {BOOK_CONTENT.scientificBasis.references.map((ref, idx) => (
                    <li key={idx} className="text-sm text-brand-text/50">{ref}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="break-before-page pt-12 text-center">
            <h2 className="text-4xl font-bold text-brand-secondary mb-4">{BOOK_CONTENT.finalWord.title}</h2>
            <Markdown remarkPlugins={[remarkGfm]}>{BOOK_CONTENT.finalWord.content}</Markdown>
          </section>
        </div>
      </div>

      {/* Main App UI */}
      <div className="flex-1 flex flex-col md:flex-row print:hidden">
          {/* Sidebar Mobile Toggle */}
      <div className="md:hidden p-6 bg-white border-b-4 border-brand-bg flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3 font-bold text-brand-secondary text-xl">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-md">
            <BookOpen size={24}/>
          </div>
          <span>Do Zero à Leitura</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-brand-primary/10 rounded-xl transition-colors"
        >
          <Menu size={28} className="text-brand-secondary" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r-8 border-brand-bg flex flex-col transition-transform duration-500 ease-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-10 flex justify-between items-center">
          <div className="flex items-center gap-3 font-bold text-2xl text-brand-secondary">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/10">
              <BookOpen size={28}/>
            </div>
            <span>Do Zero à Leitura</span>
          </div>
          <button className="md:hidden p-2 hover:bg-brand-primary/10 rounded-xl" onClick={() => setSidebarOpen(false)}><X size={24}/></button>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto pb-10">
          <NavItem icon={HomeIcon} label="Início" active={view === 'home'} onClick={() => setView('home')} />
          
          <div className="pt-8 pb-3 text-[11px] font-black uppercase text-brand-text/90 tracking-[0.2em] px-4">O Caminho</div>
          {BOOK_CONTENT.phases.map(p => {
            const pColor = getThemeColor(p.id);
            return (
              <button 
                key={p.id} 
                onClick={() => { setView('phase'); setCurrentPhaseId(p.id); setSidebarOpen(false); }} 
                className={cn(
                  "w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold transition-all text-sm",
                  view === 'phase' && currentPhaseId === p.id
                    ? `bg-${pColor} text-white shadow-lg shadow-${pColor}/20`
                    : `text-brand-text/70 hover:bg-${pColor}/10 hover:text-${pColor}`
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs",
                  view === 'phase' && currentPhaseId === p.id ? "bg-white/20" : `bg-${pColor}/10 text-${pColor}`
                )}>
                  {p.id}
                </div>
                <span>{p.title}</span>
              </button>
            );
          })}

          <div className="pt-8 pb-3 text-[11px] font-black uppercase text-brand-text/90 tracking-[0.2em] px-4">Capítulos</div>
          {BOOK_CONTENT.chapters.map(c => (
            <button 
              key={c.id} 
              onClick={() => { setView('chapters'); setCurrentChapterId(c.id); setSidebarOpen(false); }} 
              className={cn(
                "w-full text-left p-4 rounded-2xl flex items-center gap-3 font-bold transition-all text-sm",
                view === 'chapters' && currentChapterId === c.id
                  ? "bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20"
                  : "text-brand-text/70 hover:bg-brand-secondary/10 hover:text-brand-secondary"
              )}
            >
              <BookMarked size={18} />
              <span>{c.title}</span>
            </button>
          ))}

          <div className="pt-8 pb-3 text-[11px] font-black uppercase text-brand-text/90 tracking-[0.2em] px-4">Recursos</div>
          <NavItem icon={Package} label="Listas de Palavras" active={view === 'wordLists'} onClick={() => setView('wordLists')} />
          <NavItem icon={Sparkles} label="Atividades Extra" active={view === 'extraActivities'} onClick={() => setView('extraActivities')} />
          <NavItem icon={MessageCircle} label="Histórias" active={view === 'stories'} onClick={() => setView('stories')} />
          <NavItem icon={Zap} label="Sons Especiais" active={view === 'specialSounds'} onClick={() => setView('specialSounds')} />
          <NavItem icon={Trophy} label="Marcos" active={view === 'milestones'} onClick={() => setView('milestones')} />
          
          <div className="pt-8 pb-3 text-[11px] font-black uppercase text-brand-text/90 tracking-[0.2em] px-4">Suporte</div>
          <NavItem icon={HelpCircle} label="Dúvidas (FAQ)" active={view === 'faq'} onClick={() => setView('faq')} />
          <NavItem icon={Info} label="Glossário" active={view === 'glossary'} onClick={() => setView('glossary')} />
          <NavItem icon={Lightbulb} label="Base Científica" active={view === 'science'} onClick={() => setView('science')} />
          <NavItem icon={Heart} label="Palavra Final" active={view === 'finalWord'} onClick={() => setView('finalWord')} />
        </nav>

        <div className="p-8 border-t-4 border-brand-bg">
          <div className="bg-brand-bg p-6 rounded-[2rem] border-2 border-white shadow-inner">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-brand-secondary mb-3">
              <span>Progresso</span>
              <span>{completedDays.length}/90 Dias</span>
            </div>
            <div className="h-4 bg-white rounded-full overflow-hidden p-1 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedDays.length / 90) * 100}%` }}
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full" 
              />
            </div>
          </div>
          <button 
            onClick={handlePrint}
            className="mt-6 w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-brand-text text-white font-bold hover:bg-brand-text/90 transition-all shadow-lg shadow-brand-text/10"
          >
            <Download size={20} />
            <span>Exportar Guia (PDF)</span>
          </button>
          <p className="mt-3 text-[10px] text-center text-brand-text/40 font-medium leading-tight">
            Se o download não iniciar, abra o app em uma nova aba.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-16 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Book Header */}
          <div className="mb-12 text-center">
            <p className="text-[10px] font-black uppercase text-brand-primary tracking-[0.3em] mb-2">Do Zero à Leitura em 90 Dias</p>
            <p className="text-[10px] font-bold text-brand-text/40">Guia do Método Crianças de 5 a 8 anos</p>
          </div>

          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-6xl font-bold text-brand-text leading-tight tracking-tight font-serif">
                    {BOOK_CONTENT.introduction.title}
                  </h1>
                  <SectionAudioButton text={`${BOOK_CONTENT.introduction.title}. ${BOOK_CONTENT.introduction.content}`} useIA={useIA} />
                </div>
                
                <div className="card prose prose-stone max-w-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Heart size={120} className="text-brand-secondary" />
                  </div>
                  <Markdown remarkPlugins={[remarkGfm]}>{BOOK_CONTENT.introduction.content}</Markdown>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <motion.button 
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setView('phase')} 
                    className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white px-10 py-6 rounded-[2rem] font-bold text-xl shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
                  >
                    <Sparkles />
                    Começar Jornada de 90 Dias
                  </motion.button>
                </div>
              </motion.div>
            )}

            {view === 'phase' && (
              <motion.div 
                key={`phase-${currentPhaseId}`}
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 bg-${themeColor} text-white rounded-[2rem] flex items-center justify-center text-3xl font-bold shadow-xl shadow-${themeColor}/20`}>
                      {currentPhase.id}
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-brand-text font-serif">{currentPhase.title}</h2>
                      <p className="text-brand-secondary font-bold tracking-widest uppercase text-sm mt-1">{currentPhase.subtitle}</p>
                    </div>
                  </div>
                  <SectionAudioButton text={`${currentPhase.title}. ${currentPhase.description}`} useIA={useIA} />
                </div>

                <div className={`card bg-${themeColor}/5 border-${themeColor}/10`}>
                  <p className="text-lg text-brand-text/80 leading-relaxed font-medium">
                    {currentPhase.description}
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentPhase.learningGoals.map((goal, i) => (
                      <div key={i} className={`bg-white p-4 rounded-2xl border border-${themeColor}/10 flex items-center gap-3`}>
                        <Star size={16} className="text-brand-secondary fill-brand-secondary" />
                        <span className="text-sm font-bold text-brand-text/70">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Herramientas Interactivas según fase */}
                <div className="relative">
                  {currentPhase.id === 1 && <RhymeExplorer useIA={useIA} />}
                  {currentPhase.id === 2 && <SoundBoard useIA={useIA} />}
                  {currentPhase.id === 3 && <SyllableBuilder useIA={useIA} />}
                </div>

                <div className="space-y-8 pt-10">
                  {currentPhase.weeks.map(week => (
                    <div key={week.number} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-1 w-12 bg-brand-accent/20 rounded-full" />
                        <h3 className="text-2xl font-bold text-brand-text font-serif">Semana {week.number}: {week.title}</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {week.activities.map(act => (
                          <motion.div 
                            key={act.id} 
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "card p-6 flex items-center gap-6 border-4 transition-all",
                              completedDays.includes(act.day) 
                                ? "bg-brand-accent/10 border-brand-accent/40 shadow-brand-accent/10" 
                                : "bg-white border-white hover:border-brand-accent/10"
                            )}
                          >
                            <div 
                              onClick={() => toggleDay(act.day)}
                              className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner cursor-pointer",
                                completedDays.includes(act.day) 
                                  ? "bg-brand-accent text-white" 
                                  : "bg-brand-primary/5 text-brand-text/30"
                              )}
                            >
                              {completedDays.includes(act.day) ? <CheckCircle2 size={32} /> : act.day}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-xl text-brand-text">{act.title}</h4>
                                <span className="text-[10px] font-black uppercase bg-brand-primary/5 px-2 py-1 rounded-md text-brand-text/50">
                                  {act.duration}
                                </span>
                              </div>
                              <p className="text-brand-text/60 font-medium">{act.description}</p>
                            </div>
                            <SectionAudioButton text={`${act.title}. ${act.description}`} useIA={useIA} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Atividades Extra da Fase */}
                {BOOK_CONTENT.extraActivities.find(ea => ea.phase === currentPhaseId) && (
                  <div className="pt-16 space-y-8">
                    <div className="flex items-center gap-4">
                      <Sparkles className="text-brand-secondary" />
                      <h3 className="text-3xl font-bold text-brand-text font-serif">Atividades Extra — Fase {currentPhaseId}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {BOOK_CONTENT.extraActivities.find(ea => ea.phase === currentPhaseId)?.activities.map((act, i) => (
                        <div key={i} className={`card bg-${themeColor}/5 border-${themeColor}/10 flex flex-col gap-4`}>
                          <div className="flex items-center justify-between">
                            <h4 className={`font-bold text-xl text-${themeColor}`}>{act.title}</h4>
                            <SectionAudioButton text={`${act.title}. ${act.content}`} useIA={useIA} />
                          </div>
                          <div className="prose prose-stone max-w-none text-brand-text/70 text-sm">
                            <Markdown remarkPlugins={[remarkGfm]}>{act.content}</Markdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'chapters' && (
              <motion.div 
                key={`chapter-${currentChapterId}`}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-10"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-bold text-brand-text font-serif">{currentChapter.title}</h2>
                  <SectionAudioButton text={`${currentChapter.title}. ${currentChapter.content}`} useIA={useIA} />
                </div>
                <div className="card space-y-10">
                  <p className={`text-xl text-brand-text/80 font-medium italic border-l-8 border-${themeColor} pl-6 py-2`}>
                    {currentChapter.content}
                  </p>
                  {currentChapter.sections.map((sec, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-brand-secondary font-serif">{sec.title}</h3>
                        <SectionAudioButton text={`${sec.title}. ${sec.content}`} useIA={useIA} />
                      </div>
                      <div className="prose prose-stone max-w-none text-lg text-brand-text/70 leading-relaxed">
                        <Markdown remarkPlugins={[remarkGfm]}>{sec.content}</Markdown>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'wordLists' && (
              <motion.div 
                key="wordLists"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-bold text-brand-text font-serif">Listas de Palavras</h2>
                  <p className="text-brand-text/50 text-lg font-medium">Pratique a leitura com estas listas selecionadas.</p>
                </div>

                <div className="space-y-12">
                  <section className="card bg-brand-primary/5 border-brand-primary/10">
                    <h3 className="font-bold text-2xl text-brand-secondary mb-8 flex items-center gap-3 font-serif">
                      <Star className="fill-brand-secondary text-brand-secondary" />
                      Fase 2: Palavras Simples
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {BOOK_CONTENT.wordLists.phase2.map(w => <WordButton key={w} word={w} useIA={useIA} />)}
                    </div>
                  </section>

                  <section className="card bg-brand-accent/5 border-brand-accent/10">
                    <h3 className="font-bold text-2xl text-brand-secondary mb-8 flex items-center gap-3 font-serif">
                      <Star className="fill-brand-secondary text-brand-secondary" />
                      Fase 3: Novos Desafios
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {BOOK_CONTENT.wordLists.phase3.map(w => <WordButton key={w} word={w} useIA={useIA} />)}
                    </div>
                  </section>

                  <section className="card bg-brand-secondary/5 border-brand-secondary/10">
                    <h3 className="font-bold text-2xl text-brand-secondary mb-8 flex items-center gap-3 font-serif">
                      <Zap className="fill-brand-secondary text-brand-secondary" />
                      Palavras de Alta Frequência
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {BOOK_CONTENT.wordLists.highFrequency.map(w => <WordButton key={w} word={w} useIA={useIA} className="p-3 text-base" />)}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {view === 'stories' && (
              <motion.div 
                key="stories"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-bold text-brand-text font-serif">Histórias para Ler</h2>
                  <p className="text-brand-text/50 text-lg font-medium">Pequenos textos para desenvolver a fluência.</p>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {BOOK_CONTENT.stories.map((s, i) => <StoryReader key={i} story={s} useIA={useIA} />)}
                </div>
              </motion.div>
            )}

            {view === 'extraActivities' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-bold text-brand-text font-serif">Atividades Extra</h2>
                  <p className="text-brand-text/50 text-lg font-medium">Atividades adicionais para reforçar o aprendizado em cada fase.</p>
                </div>
                <div className="space-y-12">
                  {BOOK_CONTENT.extraActivities.map((phaseGroup, i) => {
                    const pColor = getThemeColor(phaseGroup.phase);
                    return (
                      <div key={i} className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-1 w-12 bg-${pColor}/20 rounded-full`} />
                          <h3 className="text-2xl font-bold text-brand-text font-serif">Fase {phaseGroup.phase}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {phaseGroup.activities.map((act, j) => (
                            <div key={j} className={`card bg-white border-${pColor}/10 flex flex-col gap-4`}>
                              <div className="flex items-center justify-between">
                                <h4 className={`font-bold text-xl text-${pColor}`}>{act.title}</h4>
                                <SectionAudioButton text={`${act.title}. ${act.content}`} useIA={useIA} />
                              </div>
                              <div className="prose prose-stone max-w-none text-brand-text/70">
                                <Markdown remarkPlugins={[remarkGfm]}>{act.content}</Markdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {view === 'faq' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <h2 className="text-4xl font-bold text-brand-text font-serif">Perguntas Frequentes</h2>
                <div className="grid gap-6">
                  {BOOK_CONTENT.faq.map((item, i) => (
                    <div key={i} className="card bg-white border-brand-primary/10 flex items-start gap-6">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-xl text-brand-secondary">? {item.question}</h4>
                        <p className="text-brand-text/70 text-lg">{item.answer}</p>
                      </div>
                      <SectionAudioButton text={`${item.question}. ${item.answer}`} useIA={useIA} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'glossary' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <h2 className="text-4xl font-bold text-brand-text font-serif">Glossário</h2>
                <div className="grid gap-6">
                  {BOOK_CONTENT.glossary.map((item, i) => (
                    <div key={i} className="card bg-white border-brand-accent/10 flex items-start gap-6">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-xl text-brand-secondary">{item.term}</h4>
                        <p className="text-brand-text/70 text-lg">{item.definition}</p>
                      </div>
                      <SectionAudioButton text={`${item.term}. ${item.definition}`} useIA={useIA} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'science' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-bold text-brand-text font-serif">{BOOK_CONTENT.scientificBasis.title}</h2>
                  <SectionAudioButton text={`${BOOK_CONTENT.scientificBasis.title}. ${BOOK_CONTENT.scientificBasis.content}`} useIA={useIA} />
                </div>
                <div className="card space-y-6">
                  <p className="text-lg text-brand-text/70">{BOOK_CONTENT.scientificBasis.content}</p>
                  <div className="space-y-4">
                    <h4 className="font-bold text-brand-secondary uppercase tracking-widest text-sm">Referências</h4>
                    <ul className="space-y-3">
                      {BOOK_CONTENT.scientificBasis.references.map((ref, i) => (
                        <li key={i} className="flex items-center gap-3 text-brand-text/50 italic">
                          <div className="w-2 h-2 bg-brand-secondary/30 rounded-full" />
                          {ref}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'milestones' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-bold text-brand-text font-serif">Marcos do Desenvolvimento</h2>
                  <SectionAudioButton text={`Marcos do Desenvolvimento. ${BOOK_CONTENT.milestonesTip}`} useIA={useIA} />
                </div>
                
                <div className="card bg-white border-brand-primary/10 overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-brand-primary/5 border-b border-brand-primary/10">
                          <th className="p-6 font-bold text-brand-text">PERÍODO</th>
                          <th className="p-6 font-bold text-brand-text">O QUE ESPERAR</th>
                          <th className="p-6 font-bold text-brand-text">COMO SABER SE ESTÁ INDO BEM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {BOOK_CONTENT.milestones.map((m, i) => (
                          <tr key={i} className="border-b border-brand-primary/5 hover:bg-brand-primary/5 transition-colors">
                            <td className="p-6 font-bold text-brand-text bg-brand-primary/5">{m.period}</td>
                            <td className="p-6 text-brand-text/70">{m.expectation}</td>
                            <td className="p-6 text-brand-text/70 italic">{m.successIndicator}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card bg-brand-secondary/5 border-brand-secondary/10 flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-brand-secondary uppercase tracking-widest text-xs">Dica da Metodologia</h4>
                    <p className="text-brand-secondary italic leading-relaxed">
                      {BOOK_CONTENT.milestonesTip}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'specialSounds' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <h2 className="text-4xl font-bold text-brand-text font-serif">Sons Especiais (Dígrafos)</h2>
                <div className="grid gap-8">
                  {BOOK_CONTENT.specialSounds.map((s, i) => (
                    <div key={i} className="card bg-white border-brand-primary/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Zap size={120} className="text-brand-primary" />
                      </div>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                          <div className="text-5xl font-black text-brand-secondary">{s.digraph}</div>
                          <div className="h-1 w-24 bg-brand-primary/20 rounded-full" />
                          <div className="text-2xl font-bold text-brand-text/60">/{s.sound}/</div>
                        </div>
                        <SectionAudioButton text={`O som de ${s.digraph} é ${s.sound}. Exemplos: ${s.examples}. Dica: ${s.howToTeach}`} useIA={useIA} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-brand-secondary tracking-widest">Exemplos</p>
                          <p className="text-xl font-bold text-brand-text">{s.examples}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-brand-secondary tracking-widest">Como Ensinar</p>
                          <p className="text-lg text-brand-text/70 font-medium italic">{s.howToTeach}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'finalWord' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-brand-secondary text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-secondary/20">
                    <Trophy size={48} />
                  </div>
                  <h2 className="text-5xl font-bold text-brand-text font-serif">{BOOK_CONTENT.finalWord.title}</h2>
                  <SectionAudioButton text={`${BOOK_CONTENT.finalWord.title}. ${BOOK_CONTENT.finalWord.content}`} useIA={useIA} />
                </div>
                <div className="card bg-white border-brand-secondary/10 max-w-2xl mx-auto">
                  <p className="text-2xl text-brand-text/70 leading-relaxed font-serif italic">
                    "{BOOK_CONTENT.finalWord.content}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Settings Button */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setUseIA(!useIA)}
          className={cn(
            "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all border-4 border-white",
            useIA ? "bg-brand-primary text-white" : "bg-brand-primary/10"
          )}
          title={useIA ? "Usando Voz IA (Gemini)" : "Usando Voz do Sistema"}
        >
          {useIA ? <Zap size={28} /> : <Volume2 size={28} />}
        </motion.button>
      </div>
      </div>
    </div>
  );
}
