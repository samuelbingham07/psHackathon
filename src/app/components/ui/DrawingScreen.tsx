import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router';
import { StoryGuide } from './StoryGuide';
import { Home, Trash2, Eraser as EraserIcon, Undo as UndoIcon, PaintBucket, Pencil, Mic, Star, Keyboard } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const playSparkleSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const playNote = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.stop(startTime + 0.3);
    };
    const now = ctx.currentTime;
    playNote(880, now);
    playNote(1108.73, now + 0.1);
    playNote(1318.51, now + 0.2);
    playNote(1760, now + 0.3);
  } catch (e) { console.warn("Audio not supported"); }
};

const playPopSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) { console.warn("Audio not supported"); }
};

const colors = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#FDE047', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#8B4513', // Brown
  '#1F2937', // Dark gray (almost black)
  '#FFFFFF', // White
];

const hexToRgba = (hex: string) => {
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
};

const floodFill = (ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;
  
  const startXInt = Math.floor(startX);
  const startYInt = Math.floor(startY);
  
  if (startXInt < 0 || startXInt >= width || startYInt < 0 || startYInt >= height) return;
  
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  
  const startPos = (startYInt * width + startXInt) * 4;
  const targetR = d[startPos];
  const targetG = d[startPos + 1];
  const targetB = d[startPos + 2];
  const targetA = d[startPos + 3];
  
  const fillRgba = hexToRgba(fillColor);
  
  // If exactly the same color, skip
  if (targetR === fillRgba[0] && targetG === fillRgba[1] && targetB === fillRgba[2] && targetA === fillRgba[3]) {
    return;
  }
  
  const tolerance = 50; 
  const visited = new Uint8Array(width * height);
  
  const matchColor = (pos: number) => {
    return Math.abs(d[pos] - targetR) <= tolerance &&
           Math.abs(d[pos + 1] - targetG) <= tolerance &&
           Math.abs(d[pos + 2] - targetB) <= tolerance &&
           Math.abs(d[pos + 3] - targetA) <= tolerance;
  };
  
  const colorPixel = (pos: number) => {
    d[pos] = fillRgba[0];
    d[pos + 1] = fillRgba[1];
    d[pos + 2] = fillRgba[2];
    d[pos + 3] = fillRgba[3];
  };
  
  const stack = [startXInt, startYInt];
  
  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    
    const currentIdx = y * width + x;
    if (visited[currentIdx]) continue;
    
    const pos = currentIdx * 4;
    if (!matchColor(pos)) continue;
    
    let xLeft = x;
    let pLeft = pos;
    let idxLeft = currentIdx;
    while (xLeft >= 0 && !visited[idxLeft] && matchColor(pLeft)) {
      xLeft--;
      pLeft -= 4;
      idxLeft--;
    }
    xLeft++;
    
    let xRight = x + 1;
    let pRight = pos + 4;
    let idxRight = currentIdx + 1;
    while (xRight < width && !visited[idxRight] && matchColor(pRight)) {
      xRight++;
      pRight += 4;
      idxRight++;
    }
    xRight--;
    
    for (let i = xLeft; i <= xRight; i++) {
      const idx = y * width + i;
      const p = idx * 4;
      
      visited[idx] = 1;
      colorPixel(p);
      
      if (y > 0) {
        const aboveIdx = idx - width;
        if (!visited[aboveIdx] && matchColor(aboveIdx * 4)) {
          stack.push(i, y - 1);
        }
      }
      if (y < height - 1) {
        const belowIdx = idx + width;
        if (!visited[belowIdx] && matchColor(belowIdx * 4)) {
          stack.push(i, y + 1);
        }
      }
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
};

export function DrawingScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const storyDetails = location.state?.storyDetails || [];
  const isExtraSlide = location.state?.isExtraSlide || false;
  const previousDrawings = location.state?.previousDrawings || [];
  const settingId = location.state?.settingId || 'custom';
  const settingName = location.state?.setting || 'your setting';
  
  const flowType = location.state?.flowType || 'setting-flow';
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [lineWidth, setLineWidth] = useState(5);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [savedDrawings, setSavedDrawings] = useState<string[]>(isExtraSlide ? previousDrawings : []);
  const [isShaking, setIsShaking] = useState(false);
  const [activeTool, setActiveTool] = useState<'draw' | 'fill' | 'eraser'>('draw');

  const isPreDrawing = false; // Flow has been refactored so we start immediately

  // New Post-Drawing Interview States
  const [isPostDrawing, setIsPostDrawing] = useState(false);
  const [interviewStage, setInterviewStage] = useState<'name' | 'hobby' | 'random' | 'make-my-own' | 'done'>('name');
  const [characterName, setCharacterName] = useState('');
  const [characterHobby, setCharacterHobby] = useState('');
  const [randomQuestionIndex, setRandomQuestionIndex] = useState(0);
  const [postDrawInputMode, setPostDrawInputMode] = useState<'voice' | 'text' | null>(null);
  const [postDrawCustomInput, setPostDrawCustomInput] = useState('');
  const [isPostListening, setIsPostListening] = useState(false);

  const getCanvasBgColor = () => {
    if (flowType === 'make-my-own') return '#FFFFFF';
    
    const settingColors: Record<string, string> = {
      ocean: '#E0F7FA', // light blue
      space: '#EDE7F6', // light purple
      forest: '#E8F5E9', // light green
      dino: '#FFF3E0',  // light orange
    };
    return settingColors[settingId] || '#FFFFFF';
  };

  // Define the drawing stages
  const stages = isExtraSlide ? [
    { label: 'New Scene', instruction: 'Draw One More Scene' }
  ] : flowType === 'make-my-own' ? [
    { label: 'Hero', instruction: 'Draw the Hero' },
    { label: 'Adventure', instruction: 'Draw the Adventure' },
    { label: 'Ending', instruction: 'Draw the Ending' }
  ] : [
    { label: 'Hero', instruction: 'Draw Your Hero' }
  ];

  const currentStageInfo = stages[currentStage] || stages[0];
  const isLastStage = currentStage >= stages.length - 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      if (ctx) {
        // Match the aspect ratio to the new container size precisely
        canvas.width = 752;
        canvas.height = 384;
        
        // Set background
        ctx.fillStyle = getCanvasBgColor();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set drawing properties for smooth lines
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        setContext(ctx);
        
        // Save initial state
        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      }
    }
  }, [currentStage, settingId]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context || isShaking) return;
    
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);

    if (activeTool === 'fill') {
      floodFill(context, x, y, currentColor);
      if (canvasRef.current) {
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHistory([...history, imageData]);
      }
      return;
    }
    
    setIsDrawing(true);
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y);
    context.strokeStyle = activeTool === 'eraser' ? '#FFFFFF' : currentColor;
    context.lineWidth = lineWidth;
    context.stroke();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || isShaking || activeTool === 'fill') return;
    
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    
    context.strokeStyle = activeTool === 'eraser' ? '#FFFFFF' : currentColor;
    context.lineWidth = lineWidth;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && context && canvasRef.current && !isShaking) {
      setIsDrawing(false);
      context.closePath();
      
      // Save to history
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory([...history, imageData]);
    }
  };

  const handleUndo = () => {
    if (history.length > 1 && context && canvasRef.current && !isShaking) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      context.putImageData(newHistory[newHistory.length - 1], 0, 0);
    }
  };

  const resetCanvas = () => {
    if (context && canvasRef.current) {
      context.fillStyle = getCanvasBgColor();
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory([context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)]);
    }
  };

  const handleClear = () => {
    if (!context || !canvasRef.current || isShaking) return;
    setIsShaking(true);
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const ctx = context;
    let frame = 0;
    const maxFrames = 120; // Approximately 2 seconds for a slower fall

    const animateSand = () => {
      // End animation after max frames or if it's done naturally
      if (frame > maxFrames) {
        resetCanvas();
        setIsShaking(false);
        return;
      }

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const newImgData = ctx.createImageData(canvas.width, canvas.height);
      const newData = newImgData.data;

      const canvasBg = hexToRgba(getCanvasBgColor());

      // Pre-fill the new image data with the background color
      for (let i = 0; i < newData.length; i += 4) {
        newData[i] = canvasBg[0];     // R
        newData[i + 1] = canvasBg[1]; // G
        newData[i + 2] = canvasBg[2]; // B
        newData[i + 3] = 255;         // A
      }

      let hasSand = false;

      // Scan from bottom to top to calculate falling pixels
      for (let y = canvas.height - 1; y >= 0; y--) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          // Check if pixel is not the background color
          const isBackground = Math.abs(data[idx] - canvasBg[0]) < 5 && 
                               Math.abs(data[idx + 1] - canvasBg[1]) < 5 && 
                               Math.abs(data[idx + 2] - canvasBg[2]) < 5;
                               
          if (!isBackground) {
            hasSand = true;
            
            // Slower downward fall speed
            const fallSpeed = Math.floor(Math.random() * 6) + 2 + Math.floor(frame * 0.4);
            
            // Tighter horizontal drift for a smoother look
            const shiftX = Math.floor(Math.random() * 5) - 2; // -2 to 2
            
            const newY = y + fallSpeed;
            let newX = x + shiftX;

            // If the sand particle hasn't fallen off the bottom
            if (newY < canvas.height) {
              // Constrain horizontal bounds
              newX = Math.max(0, Math.min(canvas.width - 1, newX));
              const newIdx = (newY * canvas.width + newX) * 4;
              
              // Move the color data to the new pixel location
              newData[newIdx] = data[idx];
              newData[newIdx + 1] = data[idx + 1];
              newData[newIdx + 2] = data[idx + 2];
              newData[newIdx + 3] = data[idx + 3];
            }
          }
        }
      }

      // Apply the newly calculated frame
      ctx.putImageData(newImgData, 0, 0);

      // Continue the loop if there's still sand visible
      if (hasSand) {
        frame++;
        requestAnimationFrame(animateSand);
      } else {
        resetCanvas();
        setIsShaking(false);
      }
    };

    // Start the sand falling loop
    requestAnimationFrame(animateSand);
  };

  const handleBack = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
      setSavedDrawings(savedDrawings.slice(0, -1));
      resetCanvas();
    } else {
      navigate(-1);
    }
  };

  const handleNext = () => {
    if (context && canvasRef.current) {
      const drawingData = canvasRef.current.toDataURL('image/png');
      const newSavedDrawings = [...savedDrawings, drawingData];
      setSavedDrawings(newSavedDrawings);
      
      // Capture and save to gallery immediately
      try {
        const saved = localStorage.getItem('tell-a-sketch-stories');
        let stories = [];
        if (saved) {
          try {
            stories = JSON.parse(saved);
          } catch (e) {}
        }
        
        const storyId = location.state?.storyId || Date.now().toString();
        const existingIndex = stories.findIndex((s: any) => s.id === storyId);
        if (existingIndex >= 0) {
          stories[existingIndex].drawings = newSavedDrawings;
        } else {
          stories.unshift({
            id: storyId,
            date: new Date().toISOString(),
            drawings: newSavedDrawings,
            title: "My Sketch"
          });
        }
        localStorage.setItem('tell-a-sketch-stories', JSON.stringify(stories));
      } catch (e) {
        console.error("Failed to save drawing to gallery", e);
      }
      
      setIsPostDrawing(true);
      if (flowType === 'make-my-own' || isExtraSlide) {
        setInterviewStage('make-my-own');
      } else {
        setInterviewStage('name');
        setRandomQuestionIndex(Math.floor(Math.random() * 10)); // Pick from 10 random questions
      }
    }
  };

  const handlePostDrawSpeak = () => {
    setIsPostListening(true);
    setPostDrawInputMode('voice');
    
    // Mock listening
    setTimeout(() => {
      setIsPostListening(false);
      handlePostDrawSubmit(
        interviewStage === 'name' ? 'Fluffy' : 
        interviewStage === 'hobby' ? 'eating carrots' : 
        'a giant monster'
      );
    }, 2500);
  };

  const handlePostDrawTextSubmit = () => {
    if (postDrawCustomInput.trim()) {
      handlePostDrawSubmit(postDrawCustomInput.trim());
      setPostDrawCustomInput('');
    }
  };

  const handlePostDrawSubmit = (answer: string) => {
    if (flowType === 'make-my-own' || isExtraSlide) {
      if (isLastStage) {
        let finalStoryId = Date.now().toString();
        navigate('/viewing', { 
          state: { 
            savedDrawings, 
            storyDetails: [...storyDetails, answer], 
            storyId: finalStoryId 
          } 
        });
      } else {
        // Move to next stage for drawing
        storyDetails.push(answer);
        setCurrentStage(currentStage + 1);
        setIsPostDrawing(false);
        setPostDrawInputMode(null);
        resetCanvas();
      }
      return;
    }

    if (interviewStage === 'name') {
      setCharacterName(answer);
      setInterviewStage('hobby');
    } else if (interviewStage === 'hobby') {
      setCharacterHobby(answer);
      setInterviewStage('random');
    } else if (interviewStage === 'random') {
      // Transition to next screen (Story Theatre / ViewingScreen)
      let finalStoryId = Date.now().toString();
      navigate('/viewing', { 
        state: { 
          savedDrawings, 
          storyDetails: [settingName, characterName, characterHobby, answer], 
          storyId: finalStoryId 
        } 
      });
    }
    setPostDrawInputMode(null);
  };

  const getInterviewPrompt = () => {
    if (flowType === 'make-my-own' || isExtraSlide) {
      if (isExtraSlide) return "What happens next in your wonderful story? 🌟";
      if (currentStage === 0) return "Who is the brave hero of our story? 🦸";
      if (currentStage === 1) return "What amazing adventure will they go on? 🗺️";
      if (currentStage === 2) return "How does our wonderful story end? 🌟";
    }

    if (interviewStage === 'name') return "They look amazing! What is your character's name?";
    if (interviewStage === 'hobby') return `And what does ${characterName} love to do most?`;
    
    const randomQuestions = [
      `What is ${characterName} a little afraid of? 😟`,
      `What is ${characterName}'s favorite color? 🎨`,
      `What is ${characterName}'s special talent or superpower? ⚡`,
      `What is ${characterName}'s biggest wish or dream? 🌟`,
      `Who is ${characterName}'s best friend? 🤝`,
      `What is ${characterName}'s favorite food to eat? 🍎`,
      `Where does ${characterName} like to sleep? 🛏️`,
      `What makes ${characterName} laugh the most? 😂`,
      `What is a secret that ${characterName} has? 🤫`,
      `What does ${characterName} do when it's raining outside? 🌧️`
    ];
    return randomQuestions[randomQuestionIndex] || randomQuestions[0];
  };

  return (
    <div className="size-full bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Post-Drawing Interview Overlay */}
      <AnimatePresence>
        {isPostDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center w-full max-w-4xl p-8">
              {/* Simon and Speech Bubble */}
              <motion.div
                initial={{ scale: 0.8, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                className="flex flex-col items-center mb-12"
              >
                <div className="relative mb-8">
                  <StoryGuide isAnimating={true} hideMessage={true} />
                  <motion.div
                    key={interviewStage}
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="absolute left-[120%] top-1/2 -translate-y-1/2 w-[350px] bg-white rounded-3xl px-8 py-6 shadow-2xl border-4 border-[#FFD700]"
                  >
                    <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-0 h-0 border-t-[16px] border-b-[16px] border-r-[16px] border-t-transparent border-b-transparent border-r-[#FFD700]" />
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[14px] border-b-[14px] border-r-[14px] border-t-transparent border-b-transparent border-r-white z-10" />
                    <p className="text-2xl text-gray-800 font-bold leading-relaxed" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {getInterviewPrompt()}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Interaction Controls */}
              <div className="flex-1 flex flex-col items-center justify-center w-full relative h-[250px]">
                {postDrawInputMode === 'text' ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md px-8"
                  >
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      Type your answer!
                    </h3>
                    <textarea 
                      value={postDrawCustomInput}
                      onChange={(e) => setPostDrawCustomInput(e.target.value)}
                      className="w-full h-32 p-4 rounded-xl border-4 border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-500 text-xl resize-none shadow-inner bg-white"
                      placeholder="Type here..."
                      autoFocus
                    />
                    <div className="flex justify-end mt-4 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPostDrawInputMode(null)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-bold shadow-md hover:bg-gray-300"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePostDrawTextSubmit}
                        disabled={!postDrawCustomInput.trim()}
                        className="bg-[#FFD700] text-gray-800 px-8 py-2 rounded-full font-bold shadow-md hover:bg-[#F2C800] border-b-4 border-[#D4A000] active:border-b-0 active:translate-y-1 disabled:opacity-50"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        Done!
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center relative w-full h-full justify-center">
                    <motion.button
                      onClick={handlePostDrawSpeak}
                      disabled={isPostListening}
                      animate={isPostListening ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(255, 215, 0, 0)",
                          "0 0 0 20px rgba(255, 215, 0, 0.4)",
                          "0 0 0 0 rgba(255, 215, 0, 0)"
                        ]
                      } : { scale: 1 }}
                      transition={isPostListening ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                      whileHover={!isPostListening ? { scale: 1.05 } : {}}
                      whileTap={!isPostListening ? { scale: 0.95 } : {}}
                      className="relative flex flex-col items-center justify-center w-48 h-48 rounded-full border-8 border-white bg-[#FFD700] shadow-2xl z-20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-full pointer-events-none" />
                      <Mic className={`w-16 h-16 mb-2 z-10 ${isPostListening ? 'text-white animate-pulse' : 'text-white'}`} />
                      <span className="text-2xl font-extrabold text-white tracking-wider z-10" style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
                        {isPostListening ? 'Listening...' : 'Press Speak'}
                      </span>
                    </motion.button>

                    <motion.button 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => setPostDrawInputMode('text')}
                      className="absolute bottom-0 right-0 text-gray-500 font-bold hover:text-gray-800 flex items-center gap-2 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl shadow-sm border-2 border-transparent hover:border-gray-300 z-20"
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      <Keyboard className="w-5 h-5" />
                      or press to type
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Etch-A-Sketch container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={isShaking ? {
          scale: 1,
          opacity: 1,
          x: [0, -20, 20, -20, 20, -15, 15, -10, 10, -5, 5, -5, 5, -2, 2, 0],
          y: [0, 15, -15, 15, -15, 10, -10, 5, -5, 2, -2, 2, -2, 1, -1, 0],
          rotate: [0, -3, 3, -3, 3, -2, 2, -1, 1, -0.5, 0.5, -0.5, 0.5, -0.2, 0.2, 0]
        } : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }}
        transition={isShaking ? { duration: 2.0, ease: "easeInOut" } : { duration: 0.3 }}
        className="relative bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-3xl shadow-2xl p-[24px] mt-[100px]"
        style={{ width: '880px', height: '620px' }}
      >
        {/* Simon hovering above instruction */}
        <motion.div 
          className="absolute left-1/2 transform -translate-x-1/2 z-40 drop-shadow-xl"
          initial={false}
          animate={{
            top: isPreDrawing ? '-80px' : '-100px',
            scale: isPreDrawing ? 1.1 : 1,
            y: isPreDrawing ? [0, -5, 0] : 0
          }}
          transition={isPreDrawing ? {
            y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.5, type: "spring" },
            top: { duration: 0.5, type: "spring" }
          } : { duration: 0.5 }}
        >
          <div className="relative flex items-center justify-center pointer-events-none">
            <StoryGuide
              isAnimating={true}
              hideMessage={true}
            />
            <AnimatePresence>
              {isPreDrawing && (
                <motion.div
                  key="speech-bubble"
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="absolute left-[80%] top-1/2 -translate-y-1/2 w-[280px] bg-white rounded-3xl px-6 py-4 shadow-xl border-4 border-[#FFD700] z-50 pointer-events-auto"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {/* Speech bubble arrow */}
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-r-[12px] border-t-transparent border-b-transparent border-r-[#FFD700]" />
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-b-[10px] border-r-[10px] border-t-transparent border-b-transparent border-r-white z-10" />
                  
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={talkState === 'success' ? 'success' : 'initial'}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="text-[17px] text-gray-800 font-bold leading-relaxed"
                    >
                      {talkState === 'success' 
                        ? "Ooooh, that sounds SO fun! Let's get our colors and start drawing! 🎨"
                        : "Great choice! Now, let's draw who lives there. Who is the hero of our story? 🎨"}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Home button moved onto the top left of the red frame */}
        <motion.div 
          className="absolute top-5 left-6 z-30"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm border-2 border-gray-300"
          >
            <Home className="w-4 h-4" />
            Home
          </motion.button>
        </motion.div>

        {/* Stage indicator moved slightly to fit with Home button balance */}
        <motion.div 
          className="absolute top-5 right-6 bg-yellow-400 px-4 py-2 rounded-full shadow-md z-30 border-2 border-yellow-500"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-bold text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Step {currentStage + 1} of {stages.length}
          </p>
        </motion.div>

        {/* Drawing instruction centered at top */}
        <motion.div 
          className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 w-full text-center"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p 
            className="text-2xl text-yellow-300 font-bold"
            style={{ 
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {currentStageInfo.instruction}!
          </p>
        </motion.div>

        {/* Main canvas area */}
        <div className="absolute top-20 left-16 right-16 bottom-36 bg-white border-8 border-red-800 rounded-lg shadow-inner overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`w-full h-full touch-none absolute inset-0 ${isShaking ? 'cursor-not-allowed' : activeTool === 'fill' ? 'cursor-copy' : 'cursor-crosshair'}`}
            style={{ imageRendering: 'auto' }}
          />
        </div>

        {/* Bottom control panel */}
        <motion.div 
          className="absolute bottom-6 left-16 right-16 flex items-center justify-center gap-8 h-28"
          initial={false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        >
          {/* Back knob */}
          <div className="relative shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              disabled={isShaking}
              className={`bg-white rounded-full w-20 h-20 shadow-lg flex items-center justify-center border-4 border-gray-300 ${isShaking ? 'opacity-50' : ''}`}
            >
              <span className="text-lg font-bold text-gray-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Back
              </span>
            </motion.button>
          </div>

          {/* Color palette and controls */}
          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Color palette */}
            <div className="flex items-center justify-center gap-2">
              {colors.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setCurrentColor(color);
                    if (activeTool === 'eraser') setActiveTool('draw');
                  }}
                  disabled={isShaking}
                  className={`w-10 h-10 rounded-full shadow-md transition-all ${currentColor === color && activeTool !== 'eraser' ? 'ring-4 ring-white scale-110' : ''} ${isShaking ? 'opacity-50' : ''}`}
                  style={{ 
                    backgroundColor: color,
                    border: color === '#FFFFFF' ? '3px solid #666' : '2px solid #333'
                  }}
                />
              ))}
            </div>

            {/* Size and tool controls */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Size
                </span>
                {[3, 5, 8].map((size, idx) => (
                  <motion.button
                    key={size}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLineWidth(size)}
                    disabled={isShaking}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      lineWidth === size ? 'bg-yellow-400 scale-110' : 'bg-white'
                    } ${isShaking ? 'opacity-50' : ''}`}
                  >
                    <div 
                      className="rounded-full bg-gray-700"
                      style={{ 
                        width: idx === 0 ? '6px' : idx === 1 ? '10px' : '14px',
                        height: idx === 0 ? '6px' : idx === 1 ? '10px' : '14px'
                      }}
                    />
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTool('draw')}
                  disabled={isShaking}
                  className={`px-3 py-1.5 rounded-full ${activeTool === 'draw' ? 'bg-yellow-400' : 'bg-gray-200'} text-gray-800 text-sm font-bold shadow-md flex items-center gap-1.5 ${isShaking ? 'opacity-50' : ''}`}
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <Pencil className="w-4 h-4" />
                  Draw
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTool('fill')}
                  disabled={isShaking}
                  className={`px-3 py-1.5 rounded-full ${activeTool === 'fill' ? 'bg-yellow-400' : 'bg-gray-200'} text-gray-800 text-sm font-bold shadow-md flex items-center gap-1.5 ${isShaking ? 'opacity-50' : ''}`}
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <PaintBucket className="w-4 h-4" />
                  Fill
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTool('eraser')}
                  disabled={isShaking}
                  className={`px-3 py-1.5 rounded-full ${activeTool === 'eraser' ? 'bg-yellow-400' : 'bg-gray-200'} text-gray-800 text-sm font-bold shadow-md flex items-center gap-1.5 ${isShaking ? 'opacity-50' : ''}`}
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <EraserIcon className="w-4 h-4" />
                  Eraser
                </motion.button>

                <motion.button
                  whileHover={history.length > 1 && !isShaking ? { scale: 1.05 } : {}}
                  whileTap={history.length > 1 && !isShaking ? { scale: 0.95 } : {}}
                  onClick={handleUndo}
                  disabled={isShaking || history.length <= 1}
                  className={`px-3 py-1.5 rounded-full bg-gray-200 text-gray-800 text-sm font-bold shadow-md flex items-center gap-1.5 ${(isShaking || history.length <= 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <UndoIcon className="w-4 h-4" />
                  Undo
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  disabled={isShaking}
                  className={`px-3 py-1.5 rounded-full bg-gray-200 text-gray-800 text-sm font-bold shadow-md flex items-center gap-1.5 ${isShaking ? 'opacity-50' : ''}`}
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Clear
                </motion.button>
              </div>
            </div>
          </div>

          {/* Next knob */}
          <div className="relative shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={isShaking}
              className={`bg-white rounded-full w-20 h-20 shadow-lg flex items-center justify-center border-4 border-gray-300 ${isShaking ? 'opacity-50' : ''}`}
            >
              <span className="text-lg font-bold text-gray-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Done
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
