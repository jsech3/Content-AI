import React from 'react';
import { DivideIcon as LucideIcon, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationItem {
  name: string;
  icon: LucideIcon;
  tab: string;
}

interface LayoutProps {
  children: React.ReactNode;
  navigation: NavigationItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Layout({ children, navigation, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed inset-y-0 left-0 w-64 glass-panel border-r border-dark-700/50"
      >
        <motion.div 
          className="flex items-center gap-3 px-6 py-6 border-b border-dark-700/50"
          whileHover={{ scale: 1.02 }}
        >
          {/* AI Video Icon with Neural Network Animation */}
          <div className="relative">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative w-10 h-10 flex items-center justify-center"
            >
              {/* Neural Network Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-lg"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              
              {/* Main Icon */}
              <BrainCircuit className="w-8 h-8 text-accent-primary relative z-10" />
              
              {/* Particle Effects */}
              <motion.div
                className="absolute top-0 right-0"
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Sparkles className="w-4 h-4 text-accent-secondary" />
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-0"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.5,
                }}
              >
                <Zap className="w-3 h-3 text-accent-primary" />
              </motion.div>
            </motion.div>
          </div>

          {/* Brand Text with Gradient and Glow */}
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="gradient-text bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-[length:200%_100%]">
                Content AI
              </span>
            </h1>
            <p className="text-xs text-gray-400 tracking-wide">
              Powered by Intelligence
            </p>
          </div>
        </motion.div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => onTabChange(item.tab)}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="pl-64">
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}