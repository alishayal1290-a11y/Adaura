import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Gift, Gamepad2, Users, LayoutDashboard, 
  Settings, LogOut, Coins, CreditCard, RotateCw, 
  Sparkles, CheckCircle, XCircle, PlayCircle, Star, MessageSquare
} from 'lucide-react';
// Fix: Import REFERRAL_BONUS_POINTS from types.ts
import { User, AppView, DAILY_REWARDS, POINTS_TO_PKR_RATE, MIN_WITHDRAW_POINTS, MAX_DAILY_SPINS, MAX_DAILY_SCRATCHES, REFERRAL_BONUS_POINTS } from './types';
import { MockAuth, MockDb } from './services/mockFirebase';
import { GeminiService } from './services/geminiService';

// --- Components ---

// 1. Navbar
const BottomNav = ({ currentView, setView }: { currentView: AppView, setView: (v: AppView) => void }) => {
  const navItems = [
    { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Home' },
    { view: AppView.REFER, icon: Users, label: 'Refer' },
    { view: AppView.SPIN, icon: RotateCw, label: 'Spin' },
    { view: AppView.SCRATCH, icon: Sparkles, label: 'Scratch' },
    { view: AppView.SLOTS, icon: Gamepad2, label: 'Slots' }, // Added Slot Machine to nav
    { view: AppView.GEMINI, icon: Star, label: 'Oracle' }, // Added Gemini Oracle to nav
    { view: AppView.WITHDRAW, icon: Wallet, label: 'Cashout' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-700 pb-safe pt-2 px-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto"> {/* Changed to justify-around */}
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === item.view ? 'text-secondary' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <item.icon size={20} /> {/* Slightly reduced icon size for more items */}
            <span className="text-[9px] mt-1 font-medium">{item.label}</span> {/* Slightly reduced text size */}
          </button>
        ))}
      </div>
    </div>
  );
};

const TopBar = ({ user, setView }: { user: User | null, setView: (v: AppView) => void }) => {
  if (!user) {
    return null; // Don't render TopBar if user is null
  }

  return (
    <div className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-gray-700 p-3 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2">
        <div className="bg-primary/20 p-2 rounded-full">
            <Coins className="text-secondary" size={24} fill="currentColor" />
        </div>
        <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Adaura</h1>
            <p className="text-xs text-gray-400">{(user.points / POINTS_TO_PKR_RATE).toFixed(2)} PKR</p>
        </div>
      </div>
      
      <div 
        onClick={() => setView(AppView.DASHBOARD)}
        className="bg-gray-800 border border-gray-700 px-4 py-1.5 rounded-full flex items-center gap-2 cursor-pointer hover:bg-gray-700 transition"
      >
        <span className="text-secondary font-mono font-bold text-lg">{(user.points ?? 0).toLocaleString()}</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">PTS</span>
      </div>
    </div>
  );
};

// 2. Authentication
const AuthScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(''); // New state for referral code
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = isLogin 
        ? await MockAuth.login(email, password)
        : await MockAuth.signup(email, password, referralCode); // Pass referral code to signup
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>

      <div className="bg-surface p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700 relative z-10">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Adaura</h1>
            <p className="text-gray-400">Play, Earn, Repeat.</p>
        </div>

        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark border border-gray-600 rounded-xl p-3 text-white focus:border-secondary focus:outline-none transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
          <label className="block text-xs uppercase text-gray-400 mb-1 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark border border-gray-600 rounded-xl p-3 text-white focus:border-secondary focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          {!isLogin && ( // Only show referral code input during signup
            <div>
                <label className="block text-xs uppercase text-gray-400 mb-1 ml-1">Referral Code (Optional)</label>
                <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full bg-dark border border-gray-600 rounded-xl p-3 text-white focus:border-secondary focus:outline-none transition-colors"
                    placeholder="ABCDEF"
                />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/25"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-secondary font-semibold hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// 3. Views
const Dashboard = ({ user, refreshUser, setView }: { user: User, refreshUser: () => void, setView: (v: AppView) => void }) => {
  const [streakInfo, setStreakInfo] = useState<{streak: number, hasClaimedBonusToday: boolean}>({streak: 0, hasClaimedBonusToday: false});
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check streak status purely for display
    const res = MockDb.processDailyLogin(user.email);
    setStreakInfo(res);
  }, [user.email, user.dailyBonusClaimedDate, user.lastLoginDate]); // Re-run if relevant user fields change

  const claimDailyBonus = () => {
    if (streakInfo.hasClaimedBonusToday) return;
    const todayIndex = (streakInfo.streak - 1) % 7;
    const reward = DAILY_REWARDS[todayIndex];
    
    MockDb.recordDailyBonusClaim(user.email, reward); // Use the new function to record claim and add points
    refreshUser(); // Refresh user to reflect points and updated dailyBonusClaimedDate
    alert(`Claimed ${reward} points!`);
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-1">Daily Rewards</h2>
                <p className="text-indigo-100 text-sm mb-4">Login daily to multiply your earnings!</p>
                <div className="flex justify-between items-center gap-1 overflow-x-auto pb-2">
                    {DAILY_REWARDS.map((points, idx) => {
                        const day = idx + 1;
                        const isCurrentStreakDay = day === streakInfo.streak; // This indicates the day in the streak
                        const isClaimedToday = user.dailyBonusClaimedDate === today; // This indicates if the bonus is claimed for the *current day*

                        let dayClass = 'bg-white/10 border-white/10 text-gray-400';
                        if (day < streakInfo.streak) {
                            dayClass = 'bg-green-500/20 border-green-500 text-green-400'; // Past days in streak
                        } else if (isCurrentStreakDay) {
                            dayClass = 'bg-secondary border-yellow-300 text-black scale-110 shadow-lg'; // Current day in streak
                        }
                        
                        return (
                            <div key={idx} className={`flex-shrink-0 w-12 h-16 rounded-lg flex flex-col items-center justify-center border ${dayClass}`}>
                                <span className="text-[10px] font-bold">Day {day}</span>
                                <span className="font-bold text-sm">{points}</span>
                            </div>
                        )
                    })}
                </div>
                <button 
                    onClick={claimDailyBonus}
                    disabled={streakInfo.hasClaimedBonusToday} // Disable if already claimed today
                    className={`mt-3 w-full py-2 rounded-lg font-bold text-sm ${streakInfo.hasClaimedBonusToday ? 'bg-white/20 text-gray-300 cursor-not-allowed' : 'bg-secondary text-black hover:bg-yellow-300'}`}
                >
                    {streakInfo.hasClaimedBonusToday ? 'Claimed for Today' : 'Claim Bonus'}
                </button>
            </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setView(AppView.SPIN)} className="bg-surface p-4 rounded-xl border border-gray-700 hover:border-secondary transition group">
                <RotateCw className="text-purple-400 mb-2 group-hover:rotate-180 transition-transform duration-700" size={28} />
                <h3 className="font-bold">Spin Wheel</h3>
                <p className="text-xs text-gray-400">Win up to 20 pts</p>
            </button>
            <button onClick={() => setView(AppView.SCRATCH)} className="bg-surface p-4 rounded-xl border border-gray-700 hover:border-secondary transition group">
                <Sparkles className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" size={28} />
                <h3 className="font-bold">Scratch Card</h3>
                <p className="text-xs text-gray-400">Instant wins</p>
            </button>
            {/* Removed Slot Machine and Gemini Oracle cards as they are now in BottomNav */}
        </div>
    </div>
  );
};

const SpinWheel = ({ user, onWin, refreshUser }: { user: User, onWin: (pts: number) => void, refreshUser: () => void }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const segments = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]; // Changed from [5, 10, ..., 50] to [2, 4, ..., 20]
  const segAngle = 360 / segments.length;
  const spinsLeft = Math.max(0, MAX_DAILY_SPINS - (user.spinsToday || 0));

  const spin = () => {
    if (spinning) return;
    
    // Check limit before starting animation
    const success = MockDb.recordSpin(user.email);
    if (!success) {
        alert(`Daily limit of ${MAX_DAILY_SPINS} spins reached! Come back tomorrow.`);
        return;
    }
    
    // Immediately update UI counter
    refreshUser();
    
    setSpinning(true);
    
    // Random spin (at least 5 rotations)
    const randomSeg = Math.floor(Math.random() * segments.length);
    const extraRotations = 360 * 5;
    const landAngle = (randomSeg * segAngle); 
    const totalRotation = rotation + extraRotations + (360 - landAngle) + (Math.random() * 20); // Adds randomness within segment

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      onWin(segments[randomSeg]);
    }, 3000); // 3s matches CSS transition
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h2 className="text-2xl font-bold mb-2 text-secondary">Spin & Win</h2>
      <div className="bg-surface px-4 py-1.5 rounded-full border border-gray-700 mb-6">
          <span className="text-sm font-mono text-gray-300">Spins Left: <b className={spinsLeft > 0 ? "text-green-400" : "text-red-400"}>{spinsLeft}/{MAX_DAILY_SPINS}</b></span>
      </div>
      
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-500 drop-shadow-lg"></div>
        
        {/* Wheel */}
        <div 
            className="w-64 h-64 rounded-full border-4 border-gray-700 shadow-2xl overflow-hidden relative"
            style={{ 
                transform: `rotate(${rotation}deg)`, 
                transition: spinning ? 'transform 3s cubic-bezier(0.1, 0, 0.2, 1)' : 'none'
            }}
        >
            {segments.map((val, i) => (
                <div 
                    key={i}
                    className="absolute w-1/2 h-[2px] bg-transparent top-1/2 left-1/2 origin-left flex items-center justify-end pr-4"
                    style={{ 
                        transform: `rotate(${i * segAngle}deg)`,
                        backgroundColor: i % 2 === 0 ? '#4c1d95' : '#6d28d9',
                        height: '34px', // Hacky segment fill
                        width: '50%',
                        transformOrigin: 'center right',
                    }}
                >
                </div>
            ))}
            <div 
                className="w-full h-full rounded-full"
                style={{
                    background: `conic-gradient(
                        ${segments.map((_, i) => `${i % 2 === 0 ? '#4c1d95' : '#6d28d9'} ${i * 10}%, ${i % 2 === 0 ? '#4c1d95' : '#6d28d9'} ${(i + 1) * 10}%`).join(', ')}
                    )`
                }}
            ></div>
             {/* Text Overlay */}
             {segments.map((val, i) => (
                 <div
                    key={i}
                    className="absolute top-0 left-0 w-full h-full flex justify-center pt-4 text-xs font-bold text-white pointer-events-none"
                    style={{ transform: `rotate(${i * segAngle + (segAngle/2)}deg)`}}
                 >
                     <span className="mt-2">{val}</span>
                 </div>
             ))}

        </div>
        
        {/* Center Cap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-10 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
        </div>
      </div>

      <button 
        onClick={spin}
        disabled={spinning || spinsLeft === 0}
        className="mt-12 bg-secondary text-black font-bold py-3 px-12 rounded-full shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {spinning ? 'Spinning...' : spinsLeft === 0 ? 'No Spins Left' : 'SPIN'}
      </button>
      {spinsLeft === 0 && <p className="mt-4 text-xs text-red-400">Daily limit reached. Resets at midnight.</p>}
    </div>
  );
};

const SlotMachine = ({ user, onWin, refreshUser }: { user: User, onWin: (pts: number) => void, refreshUser: () => void }) => {
    const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
    const [spinning, setSpinning] = useState(false);
    const [winMessage, setWinMessage] = useState('');
  
    const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🔔'];
  
    const spin = () => {
      if (spinning) return;
      setSpinning(true);
      setWinMessage('');
      
      // Animate reels
      let counter = 0;
      const maxCount = 20; // 2 seconds approx
      const interval = setInterval(() => {
          setReels(prev => [
              symbols[Math.floor(Math.random() * symbols.length)],
              symbols[Math.floor(Math.random() * symbols.length)],
              symbols[Math.floor(Math.random() * symbols.length)]
          ]);
          counter++;
          if (counter >= maxCount) {
              clearInterval(interval);
              finishSpin();
          }
      }, 100);
    };
  
    const finishSpin = () => {
        // Determine result
        const r1 = symbols[Math.floor(Math.random() * symbols.length)];
        const r2 = symbols[Math.floor(Math.random() * symbols.length)];
        const r3 = symbols[Math.floor(Math.random() * symbols.length)];
        
        setReels([r1, r2, r3]);
        setSpinning(false);
  
        let points = 0;
        let msg = '';
  
        if (r1 === r2 && r2 === r3) {
            // 3 match
            if (r1 === '7️⃣') points = 100;
            else if (r1 === '💎') points = 50;
            else points = 30;
            msg = `JACKPOT! ${points} Points!`;
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            // 2 match
            points = 5;
            msg = `Small Win! ${points} Points`;
        } else {
            msg = 'No luck, try again!';
        }
  
        setWinMessage(msg);
        if (points > 0) {
            onWin(points);
        }
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <h2 className="text-2xl font-bold mb-8 text-pink-400 flex items-center gap-2">
              <Gamepad2 /> Slot Machine
          </h2>
          
          <div className="bg-gray-800 p-6 rounded-3xl border-4 border-pink-500 shadow-2xl shadow-pink-500/20 relative">
              {/* Reels Container */}
              <div className="flex gap-2 bg-black p-4 rounded-xl border border-gray-700 mb-6">
                  {reels.map((symbol, i) => (
                      <div key={i} className="w-20 h-24 bg-white rounded-lg flex items-center justify-center text-5xl shadow-inner border-b-4 border-gray-300">
                          <span className={spinning ? 'animate-pulse blur-[1px]' : ''}>{symbol}</span>
                      </div>
                  ))}
              </div>
  
              {/* Decorative lights */}
              <div className="absolute -top-2 left-4 w-2 h-2 rounded-full bg-yellow-400 animate-ping"></div>
              <div className="absolute -top-2 right-4 w-2 h-2 rounded-full bg-yellow-400 animate-ping delay-75"></div>
              
              <div className="text-center h-8 mb-2">
                   <p className={`font-bold ${winMessage.includes('!') ? 'text-green-400 scale-110' : 'text-gray-400'} transition-transform`}>
                      {winMessage || 'Match 3 symbols to win big!'}
                   </p>
              </div>
  
              <button 
                  onClick={spin}
                  disabled={spinning}
                  className="w-full bg-gradient-to-b from-pink-500 to-pink-700 hover:from-pink-400 hover:to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-pink-900"
              >
                  {spinning ? 'SPINNING...' : 'PULL LEVER'}
              </button>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-gray-500 w-full max-w-xs">
              <div className="flex justify-between border-b border-gray-700 pb-1">
                  <span>3x 7️⃣</span>
                  <span className="text-yellow-400">100 Pts</span>
              </div>
               <div className="flex justify-between border-b border-gray-700 pb-1">
                  <span>3x 💎</span>
                  <span className="text-yellow-400">50 Pts</span>
              </div>
               <div className="flex justify-between border-b border-gray-700 pb-1">
                  <span>3x Any</span>
                  <span className="text-yellow-400">30 Pts</span>
              </div>
               <div className="flex justify-between border-b border-gray-700 pb-1">
                  <span>2x Any</span>
                  <span className="text-yellow-400">5 Pts</span>
              </div>
          </div>
      </div>
    );
};

const ScratchCard = ({ user, onWin, refreshUser }: { user: User, onWin: (pts: number) => void, refreshUser: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [reward, setReward] = useState(0);
    const [scratched, setScratched] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const scratchesLeft = Math.max(0, MAX_DAILY_SCRATCHES - (user.scratchesToday || 0));

    const init = () => {
        if (scratchesLeft === 0) {
            // No new scratch card if limit reached
            setReward(0);
            setScratched(true); // Indicate it's "scratched" to prevent interaction
            return;
        }

        const val = Math.floor(Math.random() * 20) + 1; // Changed from * 50 to * 20
        setReward(val);
        setScratched(false);
        
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = '#9ca3af'; // gray-400
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add some text or texture to scratch layer
                ctx.fillStyle = '#6b7280';
                ctx.font = "20px Arial";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("Scratch Here", canvas.width / 2, canvas.height / 2);
            }
        }
    };

    useEffect(() => {
        init();
    }, [resetKey, user.scratchesToday, scratchesLeft]); // Re-init when scratchesToday changes (limit enforced) or scratchesLeft changes (e.g., on new day)

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (scratched || scratchesLeft === 0) return; // Prevent scratching if already scratched or no spins left
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        checkScratchPercentage();
    };

    const checkScratchPercentage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparent = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) transparent++;
        }

        if (transparent / (pixels.length / 4) > 0.4) {
            if (!scratched) {
                setScratched(true);
                // Clear fully
                ctx.clearRect(0,0, canvas.width, canvas.height);
                onWin(reward); // Reward points
                MockDb.recordScratch(user.email); // Record the scratch after winning
                refreshUser(); // Update user to reflect new scratchesToday count
            }
        }
    };

    const handleNewCard = () => {
        if (scratchesLeft === 0) {
            alert(`Daily limit of ${MAX_DAILY_SCRATCHES} scratches reached! Come back tomorrow.`);
            return;
        }
        setResetKey(p => p + 1);
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 min-h-[60vh]">
            <h2 className="text-2xl font-bold mb-2 text-white">Scratch & Earn</h2>
            <div className="bg-surface px-4 py-1.5 rounded-full border border-gray-700 mb-6">
                <span className="text-sm font-mono text-gray-300">Scratches Left: <b className={scratchesLeft > 0 ? "text-green-400" : "text-red-400"}>{scratchesLeft}/{MAX_DAILY_SCRATCHES}</b></span>
            </div>
            <div className="relative w-[300px] h-[200px] bg-white rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-300 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-yellow-800">{reward}</span>
                    <span className="text-yellow-800 text-sm font-bold">POINTS</span>
                </div>
                <canvas
                    key={resetKey}
                    ref={canvasRef}
                    width={300}
                    height={200}
                    className={`absolute inset-0 touch-none ${scratched || scratchesLeft === 0 ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                    onMouseMove={scratched || scratchesLeft === 0 ? undefined : handleMouseMove}
                    onTouchMove={scratched || scratchesLeft === 0 ? undefined : handleMouseMove}
                />
            </div>
            {(scratched || scratchesLeft === 0) && (
                <button 
                    onClick={handleNewCard}
                    disabled={scratchesLeft === 0}
                    className="mt-8 bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg animate-bounce-short disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {scratchesLeft === 0 ? 'No Scratches Left' : 'Get New Card'}
                </button>
            )}
            <p className="mt-4 text-gray-400 text-sm">Scratch 40% to reveal prize</p>
            {scratchesLeft === 0 && <p className="mt-4 text-xs text-red-400">Daily limit reached. Resets at midnight.</p>}
        </div>
    )
};

const Referral = ({ user, refreshUser }: { user: User, refreshUser: () => void }) => {
    const [inputCode, setInputCode] = useState('');
    
    const copyCode = () => {
        navigator.clipboard.writeText(user.referralCode);
        alert('Code copied!');
    };

    const claim = () => {
        if (!inputCode) return;
        if (inputCode === user.referralCode) {
            alert("You cannot use your own code.");
            return;
        }
        const success = MockDb.claimReferral(user.email, inputCode);
        if (success) {
            // Fix: Use REFERRAL_BONUS_POINTS correctly
            alert(`Success! You used code ${inputCode}. Referrer received ${REFERRAL_BONUS_POINTS} points.`);
            refreshUser();
        } else {
            alert("Invalid code or you have already been referred.");
        }
    };

    return (
        <div className="p-6 flex flex-col items-center text-center space-y-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-full">
                <Users size={48} className="text-white" />
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-white">Refer & Earn</h2>
                {/* Fix: Use REFERRAL_BONUS_POINTS correctly */}
                <p className="text-gray-400 text-sm mt-2">Get {REFERRAL_BONUS_POINTS} Points ({REFERRAL_BONUS_POINTS / POINTS_TO_PKR_RATE} PKR) for every friend!</p>
            </div>

            <div className="w-full bg-surface border border-dashed border-gray-600 rounded-xl p-4">
                <p className="text-xs uppercase text-gray-500 mb-2">Your Invite Code</p>
                <div className="flex items-center gap-2">
                    <code className="flex-1 bg-dark p-3 rounded-lg font-mono text-xl tracking-widest text-secondary font-bold">
                        {user.referralCode}
                    </code>
                    <button onClick={copyCode} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">
                        <CreditCard size={20} />
                    </button>
                </div>
            </div>

            <div className="w-full pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-3">Have a referral code?</p>
                <div className="flex gap-2">
                    <input 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 bg-surface border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-primary font-mono"
                        disabled={!!user.referredBy}
                    />
                    <button 
                        onClick={claim}
                        disabled={!!user.referredBy}
                        className="bg-primary hover:bg-purple-700 text-white px-6 rounded-lg font-bold disabled:opacity-50"
                    >
                        {user.referredBy ? 'USED' : 'CLAIM'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Withdraw = ({ user, refreshUser }: { user: User, refreshUser: () => void }) => {
    const [method, setMethod] = useState<'Easypaisa' | 'Jazzcash' | 'Binance'>('Easypaisa');
    const [details, setDetails] = useState('');
    const [amount, setAmount] = useState(1000);
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        // Filter requests for this user only
        const allReqs = MockDb.getWithdrawRequests();
        setRequests(allReqs.filter(r => r.userEmail === user.email));
    }, [user.points]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (amount < MIN_WITHDRAW_POINTS) throw new Error(`Minimum withdraw is ${MIN_WITHDRAW_POINTS} points`);
            MockDb.createWithdrawRequest({
                userId: user.uid,
                userEmail: user.email,
                amountPoints: amount,
                method,
                details
            });
            refreshUser();
            alert("Withdrawal request submitted!");
            setDetails('');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="p-4 pb-24">
            <div className="bg-surface p-6 rounded-2xl mb-6 border border-gray-700">
                <h2 className="text-gray-400 text-sm mb-1">Current Balance</h2>
                <div className="text-3xl font-bold text-white mb-4">{(user.points / POINTS_TO_PKR_RATE).toFixed(2)} PKR</div>
                <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-secondary transition-all duration-500" 
                        style={{ width: `${Math.min((user.points / MIN_WITHDRAW_POINTS) * 100, 100)}%` }} 
                    />
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">{user.points} / {MIN_WITHDRAW_POINTS} Pts</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-lg">Request Withdrawal</h3>
                
                <div className="grid grid-cols-3 gap-2">
                    {(['Easypaisa', 'Jazzcash', 'Binance'] as const).map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMethod(m)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                                method === m ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-gray-700 text-gray-400'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <div>
                    <label className="text-xs text-gray-400 ml-1">Account Number / ID</label>
                    <input 
                        required
                        value={details}
                        onChange={e => setDetails(e.target.value)}
                        placeholder={method === 'Binance' ? 'Binance ID' : '03XXXXXXXXX'}
                        className="w-full bg-surface border border-gray-700 p-3 rounded-lg focus:border-primary focus:outline-none mt-1"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400 ml-1">Points to Withdraw</label>
                    <input 
                        type="number"
                        min={MIN_WITHDRAW_POINTS}
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        className="w-full bg-surface border border-gray-700 p-3 rounded-lg focus:border-primary focus:outline-none mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">= {(amount / POINTS_TO_PKR_RATE).toFixed(2)} PKR</p>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    Withdraw Funds
                </button>
            </form>

            <div className="mt-8">
                <h3 className="font-bold mb-4">History</h3>
                <div className="space-y-2">
                    {requests.map(req => (
                        <div key={req.id} className="bg-surface p-3 rounded-lg flex justify-between items-center border border-gray-700">
                            <div>
                                <div className="font-bold text-sm">{req.method}</div>
                                <div className="text-xs text-gray-400">{new Date(req.date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-sm">{req.amountPkr} PKR</div>
                                <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                                    req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                    req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {req.status}
                                </div>
                            </div>
                        </div>
                    ))}
                    {requests.length === 0 && <p className="text-gray-500 text-center text-sm py-4">No history yet.</p>}
                </div>
            </div>
        </div>
    );
};

const AdminPanel = ({ onLogout }: { onLogout: () => void }) => {
    const [requests, setRequests] = useState(MockDb.getWithdrawRequests());

    const handleAction = (id: string, action: 'approved' | 'rejected') => {
        MockDb.updateWithdrawStatus(id, action);
        setRequests(MockDb.getWithdrawRequests());
    };

    return (
        <div className="p-6 bg-dark min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <button onClick={onLogout} className="text-red-400 text-sm border border-red-900 px-3 py-1 rounded">Logout</button>
            </div>

            <div className="bg-surface rounded-xl overflow-hidden border border-gray-700">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-800 text-gray-400 uppercase font-medium">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {requests.map(req => (
                            <tr key={req.id} className="hover:bg-gray-800/50">
                                <td className="p-4">
                                    <div className="font-medium text-white">{req.userEmail}</div>
                                    <div className="text-xs text-gray-500">{new Date(req.date).toLocaleDateString()}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-gray-300">{req.method}</div>
                                    <div className="text-xs text-gray-500">{req.details}</div>
                                </td>
                                <td className="p-4 font-mono text-secondary">
                                    {req.amountPkr} PKR
                                </td>
                                <td className="p-4">
                                    {req.status === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAction(req.id, 'approved')}
                                                className="bg-green-600 p-1.5 rounded hover:bg-green-500"
                                            ><CheckCircle size={16}/></button>
                                            <button 
                                                onClick={() => handleAction(req.id, 'rejected')}
                                                className="bg-red-600 p-1.5 rounded hover:bg-red-500"
                                            ><XCircle size={16}/></button>
                                        </div>
                                    ) : (
                                        <span className={`text-xs font-bold uppercase ${req.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                                            {req.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && <div className="p-8 text-center text-gray-500">No requests found.</div>}
            </div>
        </div>
    );
}

const GeminiOracle = ({ user, refreshUser }: { user: User, refreshUser: () => void }) => {
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    
    const ORACLE_COST = 20; // Cost for lucky number
    const ADVICE_COST = 25; // Cost for financial advice

    const ask = async (type: 'advice' | 'lucky') => {
        const cost = type === 'advice' ? ADVICE_COST : ORACLE_COST;

        if (user.points < cost) {
            alert(`Not enough points! Need ${cost} pts.`);
            return;
        }
        setLoading(true);
        MockDb.updatePoints(user.email, -cost);
        refreshUser();
        
        const result = type === 'advice' 
            ? await GeminiService.getFinancialAdvice()
            : await GeminiService.getLuckyNumber();
            
        setResponse(result);
        setLoading(false);
    };

    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
            <div className="bg-purple-900/30 p-6 rounded-full border border-purple-500/30">
                <Star size={48} className="text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold">Gemini AI Oracle</h2>
            <p className="text-gray-400 text-sm">Consult the AI for wisdom or luck</p>

            {response && (
                <div className="bg-surface border border-secondary/50 p-6 rounded-xl relative w-full max-w-sm">
                    <div className="absolute -top-3 left-4 bg-secondary text-black text-[10px] font-bold px-2 py-0.5 rounded">GEMINI SAYS</div>
                    <p className="text-lg font-medium italic">"{response}"</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <button 
                    disabled={loading || user.points < ADVICE_COST}
                    onClick={() => ask('advice')}
                    className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <MessageSquare size={24} className="text-blue-400" />
                    <span className="text-sm font-bold">Financial Advice</span>
                    <span className="text-xs text-gray-500">({ADVICE_COST} Pts)</span>
                </button>
                <button 
                    disabled={loading || user.points < ORACLE_COST}
                    onClick={() => ask('lucky')}
                    className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-2xl">🎲</span>
                    <span className="text-sm font-bold">Lucky Number</span>
                    <span className="text-xs text-gray-500">({ORACLE_COST} Pts)</span>
                </button>
            </div>
            {loading && <p className="text-sm text-secondary animate-bounce">Consulting the stars...</p>}
        </div>
    )
}

// 4. Main App Container
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.AUTH);
  const [init, setInit] = useState(true);

  useEffect(() => {
    // Check local storage for persistent login
    const savedUser = MockAuth.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      // If admin, go admin panel, else dashboard
      setView(savedUser.isAdmin ? AppView.ADMIN : AppView.DASHBOARD);
    }
    setInit(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setView(u.isAdmin ? AppView.ADMIN : AppView.DASHBOARD);
  };

  const handleLogout = () => {
    MockAuth.logout();
    setUser(null);
    setView(AppView.AUTH);
  };

  const refreshUser = () => {
    const updated = MockAuth.getCurrentUser();
    if (updated) setUser(updated);
  };

  const handleWin = (pts: number) => {
    if (!user) return;
    MockDb.updatePoints(user.email, pts);
    refreshUser();
    alert(`Congratulations! You won ${pts} Points!`);
  };

  if (init) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Loading Adaura...</div>;

  if (view === AppView.AUTH || !user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (view === AppView.ADMIN) {
      return <AdminPanel onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-dark text-white font-sans max-w-md mx-auto shadow-2xl relative">
      <TopBar user={user} setView={setView} />
      
      <main className="min-h-screen pt-4">
        {view === AppView.DASHBOARD && <Dashboard user={user} refreshUser={refreshUser} setView={setView} />}
        {view === AppView.SPIN && <SpinWheel user={user} onWin={handleWin} refreshUser={refreshUser} />}
        {view === AppView.SCRATCH && <ScratchCard user={user} onWin={handleWin} refreshUser={refreshUser} />}
        {view === AppView.SLOTS && <SlotMachine user={user} onWin={handleWin} refreshUser={refreshUser} />}
        {view === AppView.REFER && <Referral user={user} refreshUser={refreshUser} />}
        {view === AppView.WITHDRAW && <Withdraw user={user} refreshUser={refreshUser} />}
        {view === AppView.GEMINI && <GeminiOracle user={user} refreshUser={refreshUser} />}
      </main>

      <BottomNav currentView={view} setView={setView} />
    </div>
  );
}