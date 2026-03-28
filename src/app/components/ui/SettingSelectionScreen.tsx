import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { StoryGuide } from './StoryGuide';
import { Mic, Keyboard, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const PREMADE_SETTINGS = [
  { id: 'ocean', label: 'The Deep Ocean', icon: '🌊', color: '#4ECDC4' },
  { id: 'space', label: 'Outer Space', icon: '🚀', color: '#6A4C93' },
  { id: 'forest', label: 'Enchanted Forest', icon: '🌲', color: '#88D49E' },
  { id: 'dino', label: 'Dino Island', icon: '🦖', color: '#FFB067' },
  { id: 'castle', label: 'Magic Castle', icon: '🏰', color: '#B588D4' },
  { id: 'farm', label: 'Sunny Farm', icon: '🚜', color: '#F4D03F' },
  { id: 'city', label: 'Busy City', icon: '🏙️', color: '#85929E' },
  { id: 'cave', label: 'Secret Cave', icon: '🦇', color: '#5D6D7E' },
];

export function SettingSelectionScreen() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text' | null>(null);

  const handleVoiceInput = () => {
    setIsListening(true);
    setInputMode('voice');
    
    // Mock voice input
    setTimeout(() => {
      setIsListening(false);
      handleConfirmSetting("A magical candy castle");
    }, 2500);
  };

  const handlePremadeSelect = (setting: typeof PREMADE_SETTINGS[0]) => {
    handleConfirmSetting(setting.label, true, setting.id);
  };

  const handleTextSubmit = () => {
    if (customInput.trim()) {
      handleConfirmSetting(customInput.trim());
    }
  };

  const handleConfirmSetting = (setting: string, isPremade: boolean = false, settingId: string = 'custom') => {
    setSelectedSetting(setting);
    setShowConfirmation(true);
    
    // Auto-advance after showing confirmation
    setTimeout(() => {
      navigate('/drawing', { state: { setting, settingId } });
    }, 4500); // giving more time to read the new prompt
  };

  return (
    <div className="size-full bg-white flex flex-col items-center p-8 overflow-hidden relative">
      {/* Main content */}
      <div className="flex flex-col items-center w-full max-w-6xl flex-1 justify-center z-10">
        <AnimatePresence mode="wait">
          {!showConfirmation ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center w-full h-full justify-between pt-4 pb-4"
            >
              {/* Top Group: Header, Simon, and Press Speak */}
              <div className="flex flex-col items-center w-full gap-6 shrink-0 relative pt-4">
                <div className="w-full relative flex items-center justify-center h-32">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="absolute left-0 bg-white text-gray-700 px-6 py-3 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border-4 border-gray-300 z-10"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    <ArrowLeft className="w-6 h-6" />
                    Back
                  </motion.button>
                  
                  <StoryGuide
                    message="Where should our adventure take place?"
                    isAnimating={true}
                  />
                </div>

                {inputMode === 'text' ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md px-8"
                  >
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Type your setting!
                    </h3>
                    <textarea 
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="w-full h-32 p-4 rounded-xl border-4 border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-500 text-xl resize-none shadow-inner bg-white"
                      placeholder="A magical candy castle..."
                      autoFocus
                    />
                    <div className="flex justify-end mt-4 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setInputMode(null)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-bold shadow-md hover:bg-gray-300"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTextSubmit}
                        disabled={!customInput.trim()}
                        className="bg-[#FFD700] text-gray-800 px-8 py-2 rounded-full font-bold shadow-md hover:bg-[#F2C800] border-b-4 border-[#D4A000] active:border-b-0 active:translate-y-1 disabled:opacity-50"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        Done!
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center relative w-full justify-center">
                    <motion.h2 
                      className="text-2xl font-extrabold text-gray-800 mb-6 text-center" 
                      style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
                    >
                      Press speak when ready!
                    </motion.h2>
                    <motion.button
                      onClick={handleVoiceInput}
                      disabled={isListening}
                      animate={isListening ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(255, 215, 0, 0)",
                          "0 0 0 20px rgba(255, 215, 0, 0.4)",
                          "0 0 0 0 rgba(255, 215, 0, 0)"
                        ]
                      } : { scale: 1 }}
                      transition={isListening ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                      whileHover={!isListening ? { scale: 1.05 } : {}}
                      whileTap={!isListening ? { scale: 0.95 } : {}}
                      className="relative flex flex-col items-center justify-center w-40 h-40 rounded-full border-8 border-white bg-[#FFD700] shadow-2xl z-20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-full pointer-events-none" />
                      <Mic className={`w-12 h-12 mb-1 z-10 ${isListening ? 'text-white animate-pulse' : 'text-white'}`} />
                      <span className="text-xl font-extrabold text-white tracking-wider z-10" style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
                        {isListening ? 'Listening...' : 'Press Speak'}
                      </span>
                    </motion.button>

                    <motion.button 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => setInputMode('text')}
                      className="absolute bottom-0 right-[20%] text-gray-500 font-bold hover:text-gray-800 flex items-center gap-2 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl shadow-sm border-2 border-transparent hover:border-gray-300 z-20"
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      <Keyboard className="w-5 h-5" />
                      or press to type
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Bottom Group: Explore Our Worlds (Pre-made options) */}
              <div className="w-full flex flex-col gap-4 mt-8 pb-4 shrink-0">
                <h3 className="text-2xl font-bold text-gray-600 text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Or explore our worlds!
                </h3>
                
                <div className="relative w-full max-w-5xl mx-auto">
                  {/* Left scroll fade */}
                  <div className="absolute left-0 top-0 bottom-8 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 px-8 justify-start hide-scrollbar w-full touch-pan-x snap-x snap-mandatory scroll-pl-8">
                    {PREMADE_SETTINGS.map((setting, index) => (
                      <motion.button
                        key={setting.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + Math.min(index * 0.1, 0.5) }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePremadeSelect(setting)}
                        className="flex flex-col items-center justify-center p-4 rounded-3xl border-8 shadow-xl min-w-[160px] aspect-[4/3] shrink-0 gap-2 hover:brightness-110 transition-all snap-start relative overflow-hidden"
                        style={{ 
                          backgroundColor: setting.color,
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        <span className="text-4xl bg-white/20 p-3 rounded-full shadow-inner">{setting.icon}</span>
                        <span className="text-white text-lg font-bold text-center tracking-wide leading-tight" style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '1px 1px 0px rgba(0,0,0,0.2)' }}>
                          {setting.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Right scroll fade */}
                  <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center gap-3 text-gray-400"
                >
                  <ArrowLeft className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Swipe to see more
                  </span>
                  <ArrowLeft className="w-4 h-4 rotate-180 animate-pulse" />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full w-full"
            >
              <StoryGuide
                message={`Great choice! Now, let's draw who lives in ${selectedSetting}. Who is the hero of our story? 🎨`}
                isAnimating={true}
              />
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.5, ease: 'easeInOut', duration: 1.5, repeat: Infinity }}
                className="mt-12"
              >
                <span className="text-6xl">🚀</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* CSS for hiding scrollbar but allowing scroll */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}