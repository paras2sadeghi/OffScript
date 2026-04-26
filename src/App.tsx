/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Sparkles, 
  MapPin, 
  Ghost as GhostIcon, 
  Compass, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCcw,
  Info,
  Trophy
} from 'lucide-react';
import { GameState, Mode, Mood, Mission } from './types';
import { generateContentForMood } from './services/aiService';

export default function App() {
  const [state, setState] = useState<GameState>({
    mode: null,
    mood: null,
    location: null,
    character: null,
    missions: [],
    totalXp: 0,
    earnedBadges: [],
    step: 'welcome'
  });

  const [loadingText, setLoadingText] = useState('Finding your path...');
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  const handleStart = () => setState(prev => ({ ...prev, step: 'city' }));

  const selectCity = (city: string) => {
    setState(prev => ({ ...prev, location: city, step: 'mode' }));
  };

  const selectMode = (mode: Mode) => {
    setState(prev => ({ ...prev, mode, step: mode === 'ghost' ? 'loading' : 'mood' }));
  };

  const selectMood = (mood: Mood) => {
    setState(prev => ({ ...prev, mood, step: 'loading' }));
  };

  const endSession = () => {
    const allCompleted = state.missions.length > 0 && state.missions.every(m => m.completed);
    let newBadges = [...state.earnedBadges];
    
    if (allCompleted && state.character) {
      newBadges.push({
        title: state.character.title,
        date: new Date().toLocaleDateString()
      });
    }

    setState(prev => ({
      ...prev,
      earnedBadges: newBadges,
      mode: null,
      mood: null,
      character: null,
      missions: [],
      totalXp: prev.totalXp,
      step: 'welcome'
    }));
  };

  useEffect(() => {
    if (state.step === 'loading') {
      const initGame = async () => {
        try {
          setLoadingText(state.mode === 'offscript' ? 'Crafting your lens...' : 'Finding nice things for you...');
          const result = await generateContentForMood(state.mode!, state.mood, state.location);
          
          setState(prev => ({
            ...prev,
            character: result.character,
            missions: result.missions,
            step: result.character ? 'reveal' : 'missions'
          }));
        } catch (err) {
          console.error(err);
          setLoadingText('Something went wrong. Let\'s try again.');
          setTimeout(() => setState(prev => ({ ...prev, step: 'welcome' })), 2000);
        }
      };
      initGame();
    }
  }, [state.step, state.mode, state.mood, state.location]);

  const confirmCharacter = () => setState(prev => ({ ...prev, step: 'missions' }));

  const completeMission = (missionId: string) => {
    const mission = state.missions.find(m => m.id === missionId);
    if (mission) setActiveMission(mission);
  };

  const submitReflection = () => {
    if (!activeMission) return;
    setState(prev => ({
      ...prev,
      totalXp: prev.totalXp + activeMission.xp,
      missions: prev.missions.map(m => 
        m.id === activeMission.id ? { ...m, completed: true, reflection: reflectionText } : m
      )
    }));
    setActiveMission(null);
    setReflectionText('');
  };

  const resetGame = () => {
    setState({
      mode: null,
      mood: null,
      location: null,
      character: null,
      missions: [],
      totalXp: state.totalXp, // Keep XP across resets? Or reset? Let's keep for sessions
      step: 'welcome'
    });
  };

  const moods: { type: Mood; emoji: string }[] = [
    { type: 'alive', emoji: '🔥' },
    { type: 'empty', emoji: '☁️' },
    { type: 'adventurous', emoji: '🚀' },
    { type: 'lonely', emoji: '🫂' },
    { type: 'free', emoji: '🦋' },
    { type: 'overwhelmed', emoji: '🌊' },
    { type: 'curious', emoji: '🧐' },
    { type: 'invisible', emoji: '👻' },
  ];

  return (
    <div className="min-h-screen max-w-md mx-auto relative overflow-hidden flex flex-col font-sans selection:bg-amber-500/30 bg-white">
      <div className="fixed inset-0 offscript-gradient pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {state.step === 'welcome' && (
          <Screen key="welcome">
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 px-8">
              <motion.div
                initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center mb-4 rotate-3 shadow-xl"
              >
                <Sparkles className="text-white" size={48} fill="currentColor" />
              </motion.div>
              <h1 className="text-6xl font-heading font-extrabold tracking-tighter text-stone-900">
                Offscript
              </h1>
              <p className="text-stone-600 font-medium text-lg leading-tight max-w-[280px]">
                Ready to break the script? 🌍<br/>
                <span className="text-stone-400 text-sm">Your solo trip just got a lot louder.</span>
              </p>
              <button 
                onClick={handleStart}
                className="mt-12 px-10 py-5 rounded-full bg-stone-900 text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-rose-500 transition-all shadow-xl bouncy-hover flex items-center gap-2"
                id="btn-begin"
              >
                Start Adventure <ChevronRight size={18} />
              </button>

              {state.earnedBadges.length > 0 && (
                <button
                  onClick={() => setState(prev => ({ ...prev, step: 'badges' }))}
                  className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-rose-500 transition-colors"
                >
                  <Trophy size={14} /> My Badges ({state.earnedBadges.length})
                </button>
              )}
            </div>
          </Screen>
        )}

        {state.step === 'badges' && (
          <Screen key="badges">
            <div className="flex flex-col h-full px-8 py-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-heading font-black text-stone-900 uppercase">MY COLLECTION</h2>
                <button 
                  onClick={() => setState(prev => ({ ...prev, step: 'welcome' }))}
                  className="text-stone-400 font-bold text-xs uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                {state.earnedBadges.length > 0 ? (
                  state.earnedBadges.map((badge, idx) => (
                    <div key={idx} className="p-10 rounded-[3rem] bg-rose-50 border-2 border-rose-100 flex flex-col items-center text-center gap-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy size={80} />
                      </div>
                      <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-rose-500 shadow-sm relative z-10">
                        <Trophy size={32} />
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-heading font-black text-rose-950 text-xl italic leading-tight">{badge.title}</h4>
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-2">{badge.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-stone-300">
                    <Trophy size={48} className="mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-[10px]">No badges yet</p>
                  </div>
                )}
              </div>
            </div>
          </Screen>
        )}

        {state.step === 'city' && (
          <Screen key="city">
            <div className="flex flex-col justify-center h-full px-8 py-12">
              <h2 className="text-3xl font-heading font-black text-stone-900 mb-2">WHERE ARE WE?</h2>
              <p className="text-sm text-stone-500 mb-10 font-medium">Select your current city adventure.</p>
              <div className="space-y-4">
                {['Barcelona', 'Amsterdam', 'Rome'].map((city) => (
                  <button
                    key={city}
                    onClick={() => selectCity(city)}
                    className="w-full p-6 rounded-[2rem] border-2 border-stone-100 bg-white text-left font-heading font-black text-2xl text-stone-800 bouncy-hover hover:border-amber-400 flex justify-between items-center shadow-sm"
                  >
                    {city}
                    <ChevronRight className="text-stone-300" />
                  </button>
                ))}
              </div>
            </div>
          </Screen>
        )}

        {state.step === 'mode' && (
          <Screen key="mode">
            <div className="flex flex-col justify-center h-full px-8 py-12">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-heading font-black text-stone-900">{state.location?.toUpperCase()}</h2>
                <div className="text-[10px] font-black bg-stone-100 px-3 py-1 rounded-full text-stone-500 uppercase tracking-widest">
                  {state.totalXp} XP Collected
                </div>
              </div>
              <p className="text-sm text-stone-500 mb-10 font-medium italic">Choose how you want to play today.</p>
              <div className="space-y-4">
                <ModeButton 
                  title="Traveler Lens" 
                  desc="Take on a creative perspective & nice missions."
                  icon={<User size={24} />} 
                  color="bg-amber-50 border-amber-200 text-amber-700"
                  onClick={() => selectMode('offscript')}
                />
                <ModeButton 
                  title="Free Wander" 
                  desc="Direct sensory missions. No role, just vibe."
                  icon={<Compass size={24} />} 
                  color="bg-blue-50 border-blue-200 text-blue-700"
                  onClick={() => selectMode('wanderer')}
                />
                <ModeButton 
                  title="Quiet Time" 
                  desc="One restful, iconic moment for yourself."
                  icon={<GhostIcon size={24} />} 
                  color="bg-rose-50 border-rose-200 text-rose-700"
                  onClick={() => selectMode('ghost')}
                />
              </div>
            </div>
          </Screen>
        )}

        {state.step === 'mood' && (
          <Screen key="mood">
            <div className="flex flex-col justify-center h-full px-8 py-12 text-center">
              <h2 className="text-3xl font-heading font-black text-stone-900 mb-4 tracking-tight">
                HOW ARE YOU FEELING? 🌸
              </h2>
              <p className="text-stone-500 mb-10 font-medium italic">We'll find the perfect experience for you.</p>
              <div className="grid grid-cols-2 gap-4">
                {moods.map((mood) => (
                  <button
                    key={mood.type}
                    onClick={() => selectMood(mood.type)}
                    className="group p-6 rounded-[2rem] border-2 border-stone-100 bg-white shadow-sm bouncy-hover hover:border-rose-400 hover:bg-rose-50 transition-all flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl group-hover:scale-125 transition-transform">{mood.emoji}</span>
                    <span className="capitalize text-stone-600 font-bold text-xs tracking-wider">{mood.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </Screen>
        )}

        {state.step === 'loading' && (
          <Screen key="loading">
            <div className="flex flex-col items-center justify-center h-full px-12 text-center">
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-10 w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center border-4 border-rose-100 border-t-rose-400"
              >
                <RefreshCcw className="text-rose-400" size={32} />
              </motion.div>
              <h3 className="text-xl font-heading font-black text-stone-900 mb-2 italic tracking-widest text-stone-400 uppercase">Crafting Your Trip...</h3>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest animate-pulse">{loadingText}</p>
            </div>
          </Screen>
        )}

        {state.step === 'reveal' && state.character && (
          <Screen key="reveal">
            <div className="flex flex-col h-full px-8 py-10">
              <div className="flex-1 space-y-8">
                <div className="text-center space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-4 py-1 rounded-full inline-block border border-amber-100">YOUR PERSPECTIVE</span>
                  <h2 className="text-4xl font-heading font-black text-stone-900 leading-tight tracking-tighter italic">"{state.character.title}"</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-8 rounded-[2.5rem] bg-stone-900 text-white relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 mb-4 flex items-center gap-2">
                        <Info size={12} /> THE VISION
                      </h3>
                      <p className="text-stone-100 font-medium text-lg leading-snug">{state.character.backstory}</p>
                    </div>
                  </div>
                  
                  <div className="p-8 rounded-[2.5rem] bg-amber-50 border-2 border-amber-100 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-3">YOUR FOCUS</h3>
                    <p className="text-stone-700 font-bold text-lg leading-tight">{state.character.movement}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button 
                  onClick={confirmCharacter}
                  className="w-full py-5 bg-stone-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-xl bouncy-hover"
                >
                  Start Missions! ✨
                </button>
              </div>
            </div>
          </Screen>
        )}

        {state.step === 'missions' && (
          <Screen key="missions">
            <div className="flex flex-col h-full px-6 py-12">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xs font-black tracking-widest text-stone-400 uppercase mb-1">
                    {state.location} Adventure
                  </h2>
                  <div className="flex items-center text-stone-900 text-lg font-heading font-black">
                    <span className="text-amber-500 mr-2">✦</span>
                    <span>{state.totalXp} <span className="text-stone-400 text-sm italic font-medium ml-1">XP total</span></span>
                  </div>
                </div>
                <button 
                  onClick={endSession}
                  className="px-4 py-2 rounded-full bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all bouncy-hover"
                >
                  End Session
                </button>
              </div>

              <div className="flex-1 space-y-4">
                {state.missions.filter(m => !m.skipped).map((mission, idx) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="relative group">
                      <button
                        disabled={mission.completed}
                        onClick={() => completeMission(mission.id)}
                        className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden bouncy-hover
                          ${mission.completed 
                            ? 'bg-stone-50 border-stone-100 opacity-60' 
                            : 'bg-white border-stone-100 shadow-sm hover:border-amber-400'
                          }`}
                      >
                        <div className="flex gap-4 items-center relative z-10">
                          <span className={`flex-shrink-0 w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-black text-[10px] shadow-sm
                            ${mission.completed 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-stone-100 text-stone-500'
                            }`}>
                            {mission.completed ? <CheckCircle2 size={16} /> : <span>+{mission.xp}</span>}
                            <span className="mt-0.5 opacity-40 uppercase text-[6px]">XP</span>
                          </span>
                          <div className="flex-1">
                            <p className={`text-md leading-snug font-bold ${mission.completed ? 'text-stone-400' : 'text-stone-800'}`}>
                              {mission.task}
                            </p>
                            {mission.completed && mission.reflection && (
                              <p className="text-xs font-medium text-rose-500 mt-2 italic px-3 border-l-2 border-rose-100">
                                " {mission.reflection} "
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {!mission.completed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setState(prev => ({
                              ...prev,
                              missions: prev.missions.map(m => m.id === mission.id ? { ...m, skipped: true } : m)
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-stone-100 text-stone-400 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white hover:bg-stone-200 transition-colors z-20 shadow-sm"
                          title="Skip mission"
                        >
                          <span className="text-xs font-bold">×</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {(state.missions.every(m => m.completed || m.skipped) || state.missions.filter(m => !m.skipped).length === 0) && state.missions.length > 0 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-8 p-10 rounded-[3rem] bg-stone-900 text-center shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-rose-400" />
                  <p className="text-white font-heading font-black text-2xl mb-2 italic">Session Complete! 🥂</p>
                  {state.missions.every(m => m.completed) ? (
                    <div className="mb-8">
                      <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">New Badge Earned!</p>
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white mx-auto mb-2 border border-white/20">
                        <Trophy size={32} />
                      </div>
                      <p className="text-white font-bold">{state.character?.title}</p>
                    </div>
                  ) : (
                    <p className="text-stone-400 text-xs font-medium mb-8">You've explored the city with your heart open.</p>
                  )}
                  <button onClick={endSession} className="w-full bg-white text-stone-900 py-4 rounded-full font-black uppercase tracking-widest text-[10px] bouncy-hover shadow-lg">Back to Menu</button>
                </motion.div>
              )}
            </div>
          </Screen>
        )}
      </AnimatePresence>

      {/* Reflection Modal */}
      <AnimatePresence>
        {activeMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 blur-overlay"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-stone-950 w-full max-w-md rounded-t-[32px] p-8 border-t border-stone-800"
            >
              <div className="w-12 h-1 bg-stone-900 rounded-full mx-auto mb-8" />
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-600 mb-4">Reflection</h4>
                  <p className="text-stone-300 font-serif text-lg leading-snug">{activeMission.reflectionPrompt}</p>
                </div>
                
                <div className="relative">
                  <textarea
                    autoFocus
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Write a few words..."
                    className="w-full bg-stone-900/50 border-b border-stone-800 focus:border-amber-800 outline-none p-4 text-stone-300 min-h-[120px] transition-colors resize-none text-sm placeholder:text-stone-700"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveMission(null)}
                    className="flex-1 py-4 text-stone-600 uppercase tracking-[0.2em] text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReflection}
                    disabled={!reflectionText.trim()}
                    className="flex-1 py-4 bg-stone-100 text-stone-950 rounded-full font-medium uppercase tracking-[0.2em] text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Screen({ children }: { children: ReactNode, key?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex-1 flex flex-col h-full"
    >
      {children}
    </motion.main>
  );
}

function ModeButton({ title, desc, icon, color, onClick }: { title: string, desc: string, icon: ReactNode, color: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full group relative p-6 rounded-[2rem] border-2 bouncy-hover text-left flex items-center gap-6 overflow-hidden ${color}`}
    >
      <div className={`p-4 rounded-2xl bg-white shadow-sm flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-heading font-black tracking-tight">{title}</h3>
        <p className="text-stone-600 text-sm leading-snug font-medium opacity-80 mt-1">
          {desc}
        </p>
      </div>
      <ChevronRight className="ml-auto opacity-30" size={24} />
    </button>
  );
}

