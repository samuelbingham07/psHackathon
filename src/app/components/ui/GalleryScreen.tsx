import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Home, Trash2, Play, Plus, Edit2, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SavedStory {
  id: string;
  date: string;
  drawings: string[];
  title: string;
}

const PRE_MADE_STORIES: SavedStory[] = [
  {
    id: "pre-made-1",
    date: new Date().toISOString(),
    drawings: ["https://images.unsplash.com/photo-1664188495064-907b29cfd686?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGRyYXdpbmclMjBvZiUyMGElMjBkb2d8ZW58MXx8fHwxNzc0Njk5OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080"],
    title: "My Pet Dog"
  },
  {
    id: "pre-made-2",
    date: new Date().toISOString(),
    drawings: ["https://images.unsplash.com/photo-1743965127375-74ef81ddd9ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGRyYXdpbmclMjBvZiUyMGElMjBob3VzZXxlbnwxfHx8fDE3NzQ2OTk5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    title: "Our New House"
  },
  {
    id: "pre-made-3",
    date: new Date().toISOString(),
    drawings: ["https://images.unsplash.com/photo-1555680510-db867d30dd0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGRyYXdpbmclMjBvZiUyMGElMjBzcGFjZSUyMHNoaXB8ZW58MXx8fHwxNzc0Njk5OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080"],
    title: "Space Adventure"
  },
  {
    id: "pre-made-4",
    date: new Date().toISOString(),
    drawings: ["https://images.unsplash.com/photo-1675917209877-843fb4c351a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGRyYXdpbmclMjBvZiUyMGElMjBjYXR8ZW58MXx8fHwxNzc0Njk5OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080"],
    title: "Kitty Cat"
  },
  {
    id: "pre-made-5",
    date: new Date().toISOString(),
    drawings: ["https://images.unsplash.com/photo-1648514741926-be7a4c21b05e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGRyYXdpbmclMjBvZiUyMGElMjBkaW5vc2F1cnxlbnwxfHx8fDE3NzQ2OTk5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    title: "Dinosaur Roar!"
  }
];

export function GalleryScreen() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('tell-a-sketch-stories');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure we combine pre-made and user stories, keeping user stories first
      const userStories = parsed.filter((s: SavedStory) => !s.id.startsWith('pre-made-'));
      setStories([...userStories, ...PRE_MADE_STORIES]);
    } else {
      setStories(PRE_MADE_STORIES);
    }
  }, []);

  const handleDelete = (id: string) => {
    const newStories = stories.filter(s => s.id !== id);
    setStories(newStories);
    localStorage.setItem('tell-a-sketch-stories', JSON.stringify(newStories));
  };

  const handleContinue = (story: SavedStory) => {
    // Continue from this story - for now just view it
    navigate('/viewing', { state: { savedDrawings: story.drawings, storyId: story.id } });
  };

  const handleSaveTitle = (id: string) => {
    const newStories = stories.map(s => s.id === id ? { ...s, title: editTitle } : s);
    setStories(newStories);
    localStorage.setItem('tell-a-sketch-stories', JSON.stringify(newStories));
    setEditingId(null);
  };

  return (
    <div className="size-full bg-white flex flex-col items-center p-8 overflow-hidden border-[24px] border-[#E63946]">
      {/* Header */}
      <div className="w-full max-w-6xl mb-8 flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Home
        </motion.button>
        
        <h2 className="text-4xl font-bold text-[#FF6B6B] flex-1 text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          My Sketch Gallery 🎨
        </h2>
        
        
      </div>

      {stories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-64 h-64 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400">
            <Plus className="w-32 h-32 opacity-20" />
          </div>
          <p className="text-2xl text-gray-500 font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            No sketches yet. Let's make one!
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/story-choice')}
            className="bg-[#FF6B6B] text-white px-10 py-5 rounded-full text-2xl font-bold shadow-xl"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            Start Drawing!
          </motion.button>
        </div>
      ) : (
        <div className="flex-1 w-full max-w-4xl overflow-y-auto pr-4 custom-scrollbar">
          <div className="flex flex-col gap-10 pb-8 items-center">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-[12px] border-yellow-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col w-full max-w-2xl"
              >
                {/* Preview image (first drawing) */}
                <div className="aspect-[4/3] bg-white relative group cursor-pointer" onClick={() => handleContinue(story)}>
                  <img src={story.drawings[0]} alt="Sketch" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-24 h-24 text-white" fill="white" />
                  </div>
                </div>
                
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    {editingId === story.id ? (
                      <div className="flex items-center gap-4 w-full">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 border-4 border-[#4ECDC4] rounded-xl px-4 py-2 text-2xl font-bold text-gray-800 focus:outline-none"
                          style={{ fontFamily: 'Comic Sans MS, cursive' }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle(story.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button onClick={() => handleSaveTitle(story.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-full">
                          <Check className="w-8 h-8" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                          <X className="w-8 h-8" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-3xl font-bold text-gray-800 truncate pr-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                          {story.title || "My Adventure"}
                        </h3>
                        <button
                          onClick={() => {
                            setEditingId(story.id);
                            setEditTitle(story.title || "My Adventure");
                          }}
                          className="p-3 text-gray-400 hover:text-[#4ECDC4] hover:bg-teal-50 rounded-full transition-colors flex-shrink-0"
                        >
                          <Edit2 className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-xl text-gray-500 font-medium">{new Date(story.date).toLocaleDateString()}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleContinue(story)}
                      className="bg-[#4ECDC4] text-white px-8 py-4 rounded-full text-xl font-bold flex items-center gap-3 shadow-lg"
                    >
                      <Play className="w-6 h-6" />
                      Play Story
                    </motion.button>
                    
                    {!story.id.startsWith('pre-made-') && (
                      <motion.button
                        whileHover={{ scale: 1.05, color: '#FF0000' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(story.id)}
                        className="p-4 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                      >
                        <Trash2 className="w-8 h-8" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFD93D;
          border-radius: 10px;
          border: 3px solid #f1f1f1;
        }
      `}</style>
    </div>
  );
}
