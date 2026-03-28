import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router';
import { StoryGuide } from './StoryGuide';
import { Home, PlayCircle, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ViewingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const savedDrawings = location.state?.savedDrawings || [];
  const storyDetails = location.state?.storyDetails || [];
  const storyId = location.state?.storyId;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying && !isFinished) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev < savedDrawings.length - 1) {
            return prev + 1;
          } else {
            setIsFinished(true);
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3000); // 3 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, isFinished, savedDrawings.length]);

  const handleStartMovie = () => {
    setIsPlaying(true);
    setIsFinished(false);
    setCurrentSlide(0);
  };

  const handleRestart = () => {
    setIsFinished(false);
    setCurrentSlide(0);
    setIsPlaying(true);
  };

  return (
    <div className="size-full bg-white flex flex-col items-center justify-between py-2 px-4 overflow-hidden border-[24px] border-[#E63946]">
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Home
        </motion.button>
        
        <h2 className="text-3xl font-bold text-[#FF6B6B]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Story Theatre! 🎬
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/gallery')}
          className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <ImageIcon className="w-5 h-5" />
          Gallery
        </motion.button>
      </div>

      {/* Story guide */}
      <div className="z-10 -mt-2">
        <StoryGuide
          message={isFinished ? "What a wonderful story! Want to make another one?" : "Lights, camera, action! Your story is ready to watch!"}
          isAnimating={true}
        />
      </div>

      {/* Theatre Frame */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 0.85, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative -mt-10"
      >
        {/* Curtains and Frame (omitted for brevity in thinking, but I'll include them in the full edit) */}
        {/* ... (Curtains code remains similar) ... */}

        {/* Main theatre frame */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] -mt-4 border-[6px] border-red-950">
          {/* Inner gold border */}
          <div className="absolute inset-3 border-[6px] border-[#FFD700] rounded-2xl pointer-events-none z-30" 
               style={{
                 boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.5)',
                 background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.05) 40%, transparent 60%)'
               }}
          />

          {/* Screen area */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-inner" style={{ width: '640px', height: '360px' }}>
            
            {/* Curtains */}
            <motion.div 
              className="absolute top-0 left-0 w-1/2 h-full z-10 bg-gradient-to-r from-red-900 via-red-700 to-red-800 border-r-4 border-red-950 shadow-[5px_0_15px_rgba(0,0,0,0.5)] flex pointer-events-none"
              initial={false}
              animate={{ x: isPlaying && !isFinished ? '-100%' : '0%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              {/* Curtain folds */}
              <div className="w-1/4 h-full border-r border-red-900/50 bg-black/10 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.2)]"></div>
              <div className="w-1/4 h-full border-r border-red-900/50 bg-white/5 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.1)]"></div>
              <div className="w-1/4 h-full border-r border-red-900/50 bg-black/10 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.2)]"></div>
              <div className="w-1/4 h-full border-r border-red-900/50 bg-white/5 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.1)]"></div>
            </motion.div>
            <motion.div 
              className="absolute top-0 right-0 w-1/2 h-full z-10 bg-gradient-to-l from-red-900 via-red-700 to-red-800 border-l-4 border-red-950 shadow-[-5px_0_15px_rgba(0,0,0,0.5)] flex pointer-events-none"
              initial={false}
              animate={{ x: isPlaying && !isFinished ? '100%' : '0%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              {/* Curtain folds */}
              <div className="w-1/4 h-full border-l border-red-900/50 bg-white/5 shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)]"></div>
              <div className="w-1/4 h-full border-l border-red-900/50 bg-black/10 shadow-[inset_5px_0_15px_rgba(0,0,0,0.2)]"></div>
              <div className="w-1/4 h-full border-l border-red-900/50 bg-white/5 shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)]"></div>
              <div className="w-1/4 h-full border-l border-red-900/50 bg-black/10 shadow-[inset_5px_0_15px_rgba(0,0,0,0.2)]"></div>
            </motion.div>

            {!isPlaying && !isFinished ? (
              /* Start Screen */
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-20"
                whileHover={{ scale: 1.02 }}
                onClick={handleStartMovie}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-4 cursor-pointer bg-black/40 px-10 py-8 rounded-3xl backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                >
                  <PlayCircle className="w-24 h-24 text-[#FFD93D] drop-shadow-[0_0_15px_rgba(255,217,61,0.8)]" fill="#FFD93D" />
                  <p className="text-white text-2xl font-bold tracking-wider drop-shadow-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Click to Play Your Story! 🎥
                  </p>
                </motion.div>
              </motion.div>
            ) : isFinished ? (
              /* Finish Screen */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-8 bg-black/50 backdrop-blur-sm"
              >
                <p className="text-[#FFD93D] text-5xl font-extrabold drop-shadow-[0_0_20px_rgba(255,217,61,0.6)]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  THE END
                </p>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRestart}
                      className="bg-gradient-to-b from-[#FFD93D] to-[#F4C10F] text-gray-900 px-8 py-4 rounded-full text-xl font-bold shadow-[0_5px_15px_rgba(255,217,61,0.4)] flex items-center gap-3 border-2 border-yellow-200"
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      <RotateCcw className="w-6 h-6" />
                      Watch Again
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/story-choice')}
                      className="bg-gradient-to-b from-[#FF6B6B] to-[#E63946] text-white px-8 py-4 rounded-full text-xl font-bold shadow-[0_5px_15px_rgba(255,107,107,0.4)] flex items-center gap-3 border-2 border-red-300"
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      <PlayCircle className="w-6 h-6" />
                      Create New!
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Movie Playing */
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-white z-0"
              >
                <img 
                  src={savedDrawings[currentSlide]} 
                  alt={`Slide ${currentSlide}`} 
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Progress bar */}
                <div className="absolute bottom-4 left-8 right-8 h-3 bg-gray-900/80 rounded-full overflow-hidden border border-gray-700/50 backdrop-blur-sm z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / savedDrawings.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Theatre lights */}
          <div className="absolute -top-4 left-[25%] w-8 h-8 rounded-full bg-gradient-to-b from-yellow-100 to-yellow-300 shadow-[0_0_20px_8px_rgba(253,224,71,0.6)] border border-yellow-400 -translate-x-1/2 z-40" />
          <div className="absolute -top-4 left-[50%] w-8 h-8 rounded-full bg-gradient-to-b from-yellow-100 to-yellow-300 shadow-[0_0_20px_8px_rgba(253,224,71,0.6)] border border-yellow-400 -translate-x-1/2 z-40" />
          <div className="absolute -top-4 left-[75%] w-8 h-8 rounded-full bg-gradient-to-b from-yellow-100 to-yellow-300 shadow-[0_0_20px_8px_rgba(253,224,71,0.6)] border border-yellow-400 -translate-x-1/2 z-40" />
        </div>

        {/* Bottom stage */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-t from-[#654321] to-[#8B4513] rounded-b-2xl shadow-2xl"
        >
          {/* Stage trim */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700]" />
        </motion.div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-6 z-20 pb-2 -mt-4">
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/drawing', { state: { isExtraSlide: true, previousDrawings: savedDrawings, storyDetails, storyId } })}
          className="bg-[#4ECDC4] text-white px-8 py-4 rounded-full text-xl font-bold shadow-xl hover:bg-[#3EBCB4] transition-colors flex items-center gap-2"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
        >
          Draw More! ✏️
        </motion.button>

      </div>
    </div>
  );
}
