import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Lock, Award, Zap, Target } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import achievementService from '../services/achievementService';
import { toast } from 'react-toastify';

const AchievementGalleryPage = () => {
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const res = await achievementService.getAchievements();
            if (res.success) {
                setAchievements(res.data);
            }
        } catch (error) {
            toast.error('Failed to load achievements');
        } finally {
            setLoading(false);
        }
    };

    const possibleAchievements = [
        { type: 'FIRST_SESSION', title: 'Ice Breaker', desc: 'Complete your first session', icon: 'FiZap' },
        { type: 'SESSIONS_5', title: 'Steady Progress', desc: 'Complete 5 sessions', icon: 'FiTarget' },
        { type: 'SESSIONS_10', title: 'Mentorship Pro', desc: 'Complete 10 sessions', icon: 'FiTrendingUp' },
        { type: 'KARMA_LEVEL_5', title: 'Community Pillar', desc: 'Reach Karma Level 5', icon: 'FiAward' },
        { type: 'PROFILE_COMPLETE', title: 'All Set', desc: 'Complete your profile 100%', icon: 'FiCheckCircle' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center gap-3">
                            <Trophy className="text-yellow-500" size={40} />
                            Achievements Gallery
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Track your journey and milestones. Earn badges by participating in sessions,
                            helping the community, and reaching new levels.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {possibleAchievements.map((ach, index) => {
                        const isUnlocked = achievements.some(a => a.type === ach.type);
                        const unlockedData = achievements.find(a => a.type === ach.type);
                        const Icon = LucideIcons[ach.icon.replace('Fi', '')] || Award;

                        return (
                            <motion.div
                                key={ach.type}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative group rounded-3xl p-8 border transition-all duration-500 ${isUnlocked
                                        ? 'bg-gray-900/40 border-indigo-500/30 hover:border-indigo-500/60 shadow-lg shadow-indigo-500/5'
                                        : 'bg-gray-900/10 border-gray-800 opacity-60 grayscale'
                                    }`}
                            >
                                {!isUnlocked && (
                                    <div className="absolute top-4 right-4 text-gray-600">
                                        <Lock size={20} />
                                    </div>
                                )}

                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12 ${isUnlocked ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    <Icon size={32} />
                                </div>

                                <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                    {ach.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                    {ach.desc}
                                </p>

                                {isUnlocked && (
                                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Unlocked</span>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AchievementGalleryPage;
