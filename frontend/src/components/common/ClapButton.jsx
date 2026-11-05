import React, { useState, useRef } from 'react';
import { postService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ClapButton = ({ postId, initialClaps = 0, initialUserClaps = 0 }) => {
  const { isAuthenticated } = useAuth();
  const [totalClaps, setTotalClaps] = useState(initialClaps);
  const [userClaps, setUserClaps] = useState(initialUserClaps);
  const [floatingParticles, setFloatingParticles] = useState([]);
  const [isPressing, setIsPressing] = useState(false);
  const pressTimer = useRef(null);
  const uncommittedClaps = useRef(0);
  const debounceSync = useRef(null);

  const triggerFloatingBadge = (amount) => {
    const id = Date.now() + Math.random();
    setFloatingParticles((prev) => [...prev, { id, amount }]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== id));
    }, 850);
  };

  const handleClap = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to clap for this story');
      return;
    }

    if (userClaps >= 50) {
      toast('You reached the maximum 50 claps for this story!', { icon: '👏' });
      return;
    }

    // Optimistic UI updates
    setUserClaps((prev) => Math.min(50, prev + 1));
    setTotalClaps((prev) => prev + 1);
    uncommittedClaps.current += 1;
    triggerFloatingBadge('+1');

    // Debounce server call to batch rapid clicks
    if (debounceSync.current) clearTimeout(debounceSync.current);
    debounceSync.current = setTimeout(async () => {
      const countToSend = uncommittedClaps.current;
      uncommittedClaps.current = 0;
      try {
        const res = await postService.clapPost(postId, countToSend);
        if (res.data.success) {
          setTotalClaps(res.data.clapsCount);
          setUserClaps(res.data.userClaps);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not sync claps');
      }
    }, 400);
  };

  // Hold-to-clap support
  const handleMouseDown = () => {
    if (!isAuthenticated || userClaps >= 50) return;
    setIsPressing(true);
    handleClap();
    pressTimer.current = setInterval(() => {
      handleClap();
    }, 180);
  };

  const handleMouseUp = () => {
    setIsPressing(false);
    if (pressTimer.current) {
      clearInterval(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Floating particles */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
        {floatingParticles.map((particle) => (
          <span
            key={particle.id}
            className="animate-float-up px-2 py-0.5 rounded-full text-xs font-extrabold bg-brand-600 text-white shadow-lg shadow-brand-500/40"
          >
            {particle.amount}
          </span>
        ))}
      </div>

      {/* Main Clap Button */}
      <button
        onClick={handleClap}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        title={`Clap for this story (Max 50). You gave ${userClaps} claps.`}
        className={`group relative flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-200 select-none ${
          userClaps > 0
            ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700/60 text-brand-600 dark:text-brand-300 shadow-sm'
            : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-brand-300 hover:bg-brand-50/50'
        } ${isPressing ? 'scale-95' : 'hover:scale-[1.03]'}`}
      >
        <span className="text-xl group-hover:rotate-12 transition-transform duration-150">
          👏
        </span>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold leading-none">{totalClaps}</span>
          <span className="text-[10px] text-slate-400 leading-tight">
            {userClaps > 0 ? `${userClaps} from you` : 'Claps'}
          </span>
        </div>
      </button>
    </div>
  );
};

export default ClapButton;
