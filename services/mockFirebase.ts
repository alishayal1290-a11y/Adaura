import { User, WithdrawRequest, POINTS_TO_PKR_RATE, REFERRAL_BONUS_POINTS, MAX_DAILY_SPINS, MAX_DAILY_SCRATCHES } from '../types';

// Keys for local storage
const USERS_KEY = 'adaura_users';
const REQUESTS_KEY = 'adaura_withdraws';
const CURRENT_USER_KEY = 'adaura_current_user_email';

// Helper to get all users
const getUsers = (): Record<string, User> => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : {};
};

// Helper to save users
const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Helper to get requests
const getRequests = (): WithdrawRequest[] => {
  const data = localStorage.getItem(REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveRequests = (reqs: WithdrawRequest[]) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
};

export const MockAuth = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate delay
    await new Promise(r => setTimeout(r, 800));
    
    const users = getUsers();
    const user = users[email];
    
    // Hardcoded check for admin
    if (email === 'alishayal1290@gmail.com' && password === 'ali1290') {
        if (!user) {
            // Create admin if not exists
            const adminUser: User = {
                email,
                uid: 'admin-123',
                points: 99999,
                referralCode: 'ADMIN',
                lastLoginDate: new Date().toISOString().split('T')[0],
                dailyStreak: 0,
                dailyBonusClaimedDate: '', // Initialize new field
                lastAdWatch: 0,
                spinsToday: 0,
                lastSpinDate: new Date().toISOString().split('T')[0],
                scratchesToday: 0, // Initialize new field
                lastScratchDate: new Date().toISOString().split('T')[0], // Initialize new field
                isAdmin: true
            };
            users[email] = adminUser;
            saveUsers(users);
            localStorage.setItem(CURRENT_USER_KEY, email);
            return adminUser;
        }
    }

    if (!user) {
      throw new Error('User not found. Please sign up.');
    }
    
    // In a real app, hash check password. Here we trust.
    localStorage.setItem(CURRENT_USER_KEY, email);
    return user;
  },

  signup: async (email: string, password: string, referredByCode?: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 800));
    const users = getUsers();
    if (users[email]) {
      throw new Error('User already exists.');
    }

    const newUser: User = {
      email,
      uid: Math.random().toString(36).substr(2, 9),
      points: 50, // Welcome bonus
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      lastLoginDate: new Date().toISOString().split('T')[0],
      dailyStreak: 0,
      dailyBonusClaimedDate: '', // Initialize new field
      lastAdWatch: 0,
      spinsToday: 0,
      lastSpinDate: new Date().toISOString().split('T')[0],
      scratchesToday: 0, // Initialize new field
      lastScratchDate: new Date().toISOString().split('T')[0], // Initialize new field
      isAdmin: false
    };

    users[email] = newUser;
    saveUsers(users); // Save new user before trying to claim referral

    // Process referral if provided
    if (referredByCode) {
        const success = MockDb.claimReferral(email, referredByCode);
        if (!success) {
            console.warn(`Could not claim referral for code: ${referredByCode}`);
        }
    }

    localStorage.setItem(CURRENT_USER_KEY, email);
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const email = localStorage.getItem(CURRENT_USER_KEY);
    if (!email) return null;
    const users = getUsers();
    return users[email] || null;
  }
};

export const MockDb = {
  updatePoints: (email: string, pointsToAdd: number) => {
    const users = getUsers();
    if (users[email]) {
      users[email].points += pointsToAdd;
      saveUsers(users);
    }
    return users[email];
  },

  claimReferral: (userEmail: string, codeToClaim: string): boolean => {
    const users = getUsers();
    const user = users[userEmail];
    
    // Find owner of code
    const referrerEmail = Object.keys(users).find(key => users[key].referralCode === codeToClaim);
    
    if (referrerEmail && user && !user.referredBy && referrerEmail !== userEmail) {
      // Bonus for Referrer
      users[referrerEmail].points += REFERRAL_BONUS_POINTS; 
      
      // Mark user as referred
      users[userEmail].referredBy = referrerEmail;
      
      saveUsers(users);
      return true;
    }
    return false;
  },

  processDailyLogin: (email: string): { streak: number, hasClaimedBonusToday: boolean } => {
    const users = getUsers();
    const user = users[email];
    if (!user) return { streak: 0, hasClaimedBonusToday: false };

    const today = new Date().toISOString().split('T')[0];
    
    // Update lastLoginDate and streak
    let newStreak = 1;
    if (user.lastLoginDate === today) {
      // Already logged in today, do nothing to streak
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (user.lastLoginDate === yesterdayStr) {
          newStreak = Math.min(user.dailyStreak + 1, 7);
      }
      user.dailyStreak = newStreak;
      user.lastLoginDate = today;
    }

    // Check if bonus claimed today
    const hasClaimedBonusToday = user.dailyBonusClaimedDate === today;

    saveUsers(users);
    return { streak: user.dailyStreak, hasClaimedBonusToday };
  },

  recordDailyBonusClaim: (email: string, points: number) => {
    const users = getUsers();
    const user = users[email];
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    if (user.dailyBonusClaimedDate !== today) {
      user.points += points;
      user.dailyBonusClaimedDate = today;
      saveUsers(users);
    }
  },

  recordSpin: (email: string): boolean => {
    const users = getUsers();
    const user = users[email];
    if (!user) return false;

    const today = new Date().toISOString().split('T')[0];
    
    // Reset spins if it's a new day
    if (user.lastSpinDate !== today) {
        user.spinsToday = 0;
        user.lastSpinDate = today;
    }

    if ((user.spinsToday || 0) >= MAX_DAILY_SPINS) {
        return false;
    }

    user.spinsToday = (user.spinsToday || 0) + 1;
    saveUsers(users);
    return true;
  },

  recordScratch: (email: string): boolean => {
    const users = getUsers();
    const user = users[email];
    if (!user) return false;

    const today = new Date().toISOString().split('T')[0];
    
    // Reset scratches if it's a new day
    if (user.lastScratchDate !== today) {
        user.scratchesToday = 0;
        user.lastScratchDate = today;
    }

    if ((user.scratchesToday || 0) >= MAX_DAILY_SCRATCHES) {
        return false;
    }

    user.scratchesToday = (user.scratchesToday || 0) + 1;
    saveUsers(users);
    return true;
  },

  createWithdrawRequest: (req: Omit<WithdrawRequest, 'id' | 'status' | 'date' | 'amountPkr'>) => {
    const users = getUsers();
    const user = users[req.userEmail];

    if (user.points < req.amountPoints) {
      throw new Error("Insufficient balance");
    }

    // Deduct points immediately
    user.points -= req.amountPoints;
    saveUsers(users);

    const requests = getRequests();
    const newReq: WithdrawRequest = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      amountPkr: req.amountPoints / POINTS_TO_PKR_RATE,
      status: 'pending',
      date: new Date().toISOString()
    };
    requests.push(newReq);
    saveRequests(requests);
  },

  getWithdrawRequests: (): WithdrawRequest[] => {
    return getRequests();
  },

  updateWithdrawStatus: (id: string, status: 'approved' | 'rejected') => {
    const requests = getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      requests[index].status = status;
      
      // If rejected, refund points to user
      if (status === 'rejected') {
        const users = getUsers();
        const req = requests[index];
        if (users[req.userEmail]) {
            users[req.userEmail].points += req.amountPoints;
            saveUsers(users);
        }
      }
      
      saveRequests(requests);
    }
  }
};