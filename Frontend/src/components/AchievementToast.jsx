import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star, Zap, Target } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { chatSocketService } from '../services/chatSocketService';

const AchievementToast = ({ achievement, onClose }) => {
    const IconComponent = LucideIcons[achievement.icon] || Trophy;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ x: 400, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.5 }}
            className="fixed bottom-10 right-10 z-[100] w-96 bg-gray-900/95 backdrop-blur-xl border border-indigo-500/50 rounded-2xl p-6 shadow-2xl shadow-indigo-500/20 overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>

            <div className="flex gap-5 items-start">
                <div className={`p-4 rounded-2xl bg-${achievement.badgeColor || 'indigo'}-500/20 text-${achievement.badgeColor || 'indigo'}-500 relative`}>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <IconComponent size={32} />
                    </motion.div>
                    <div className="absolute -top-1 -right-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">New Achievement!</span>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{achievement.description}</p>
                </div>
            </div>

            <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5 }}
                    className="h-full bg-indigo-500"
                />
            </div>
        </motion.div>
    );
};

export const AchievementNotifier = () => {
    const [activeAchievement, setActiveAchievement] = useState(null);

    useEffect(() => {
        chatSocketService.connect();
        chatSocketService.onAchievementUnlocked((achievement) => {
            console.log('Achievement Unlocked:', achievement);
            setActiveAchievement(achievement);
        });

        return () => {
            chatSocketService.off('achievement-unlocked');
        };
    }, []);

    return (
        <AnimatePresence>
            {activeAchievement && (
                <AchievementToast
                    achievement={activeAchievement}
                    onClose={() => setActiveAchievement(null)}
                />
            )}
        </AnimatePresence>
    );
};

export default AchievementToast;
