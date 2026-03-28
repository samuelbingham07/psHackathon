import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { StoryGuide } from './StoryGuide';
import { Mic, Type, Check, ChevronRight, ArrowLeft, Keyboard } from 'lucide-react';
import { useState } from 'react';

const storyPrompts = [
  "Who is the brave hero of our story? 🦸",
  "What amazing adventure will they go on? 🗺️",
  "How does our wonderful story end? 🌟"
];

export function ListeningScreen() {
  const navigate = useNavigate();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'voice' | 'text' | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [storyDetails, setStoryDetails] = useState<string[]>([]);

  const currentPrompt = storyPrompts[currentPromptIndex];

  const handleVoiceInput = () => {
    setInputMode('voice');
    setIsListening(true);
    
    // Mock voice input - in a real app, this would use Web Speech API
    setTimeout(() => {
      const mockInputs = [
        "A brave little bunny named Fluffy",
        "They will find a hidden treasure",
        "Everyone celebrates with a big party"
      ];
      setUserInput(mockInputs[currentPromptIndex]);
      setIsListening(false);
      setShowConfirmation(true);
    }, 2000);
  };

  const handleTextSubmit = () => {
    if (userInput.trim()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    const newStoryDetails = [...storyDetails, userInput];
    setStoryDetails(newStoryDetails);
    
    if (currentPromptIndex < storyPrompts.length - 1) {
      // Move to next prompt
      setCurrentPromptIndex(currentPromptIndex + 1);
      setUserInput('');
      setInputMode(null);
      setShowConfirmation(false);
    } else {
      // All prompts completed, go to drawing
      navigate('/drawing', { state: { storyDetails: newStoryDetails } });
    }
  };

  const handleTryAgain = () => {
    setUserInput('');
    setShowConfirmation(false);
    setInputMode(null);
  };

  return (
    <div className="size-full bg-white flex flex-col items-center justify-between p-8 overflow-hidden">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/story-choice')}
        className="absolute top-8 left-8 bg-white text-gray-700 px-6 py-3 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border-4 border-gray-300 z-10"
        style={{ fontFamily: 'Comic Sans MS, cursive' }}
      >
        <ArrowLeft className="w-6 h-6" />
        Back
      </motion.button>

      {/* Progress indicator */}
      <div className="w-full max-w-4xl">
        <div className="flex gap-2 justify-center">
          {storyPrompts.map((_, index) => (
            <motion.div
              key={index}
              className={`h-3 rounded-full ${
                index <= currentPromptIndex ? 'bg-[#FF6B6B]' : 'bg-gray-300'
              }`}
              initial={{ width: 0 }}
              animate={{ width: index <= currentPromptIndex ? 80 : 60 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <p className="text-center text-gray-700 mt-2 text-lg">
          Question {currentPromptIndex + 1} of {storyPrompts.length}
        </p>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-8 w-full max-w-3xl flex-1 justify-center relative">
        {/* Story guide with current prompt */}
        <StoryGuide
          message={currentPrompt}
          isAnimating={true}
        />

        {/* Input section */}
        <div className="w-full relative h-[350px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!showConfirmation ? (
              inputMode === 'text' ? (
                <motion.div 
                  key="typing"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md px-8"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Type your story!
                  </h3>
                  <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full h-32 p-4 rounded-xl border-4 border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-500 text-lg resize-none shadow-inner bg-white"
                    placeholder="Once upon a time..."
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
                      disabled={!userInput.trim()}
                      className="bg-green-500 text-white px-8 py-2 rounded-full font-bold shadow-md hover:bg-green-600 border-b-4 border-green-700 active:border-b-0 active:translate-y-1 disabled:opacity-50"
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      Done!
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="speaking"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center w-full relative h-full justify-center"
                >
                  <motion.h2 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl font-extrabold text-gray-800 mb-8" 
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
                    className="relative flex flex-col items-center justify-center w-48 h-48 rounded-full border-8 border-white bg-[#FFD700] shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-full pointer-events-none" />
                    <Mic className={`w-16 h-16 mb-2 z-10 ${isListening ? 'text-white animate-pulse' : 'text-white'}`} />
                    <span className="text-2xl font-extrabold text-white tracking-wider z-10" style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
                      {isListening ? 'Listening...' : 'Press Speak'}
                    </span>
                  </motion.button>

                  <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => setInputMode('text')}
                    className="absolute bottom-0 right-0 text-gray-500 font-bold hover:text-gray-800 flex items-center gap-2 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl shadow-sm border-2 border-transparent hover:border-gray-300"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    <Keyboard className="w-5 h-5" />
                    or press to type
                  </motion.button>
                </motion.div>
              )
            ) : (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col gap-6 items-center"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl max-w-2xl border-4 border-[#FFD700]">
                  <p className="text-2xl text-gray-700 mb-4 text-center font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    You said:
                  </p>
                  <p className="text-3xl text-gray-800 font-bold text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    "{userInput}"
                  </p>
                </div>
                <div className="flex gap-4 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTryAgain}
                    className="bg-gray-200 text-gray-700 px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-gray-300 transition-colors"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    Try Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirm}
                    className="bg-[#FFD700] text-gray-800 px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-[#F2C800] transition-colors flex items-center gap-2 border-4 border-white"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    <Check className="w-6 h-6" />
                    {currentPromptIndex < storyPrompts.length - 1 ? 'Next Question' : 'Start Drawing!'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="h-8" /> {/* Spacer */}
    </div>
  );
}