import React from 'react';
import { CreditCard, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your account and preferences</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6"
      >
        <div className="space-y-8">
          {/* Subscription Section */}
          <div>
            <h3 className="text-lg font-medium text-white">Subscription</h3>
            <div className="mt-4 glass-panel p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent-primary" />
                    <p className="font-medium text-white">Pro Plan</p>
                  </div>
                  <p className="text-sm text-gray-400">Unlimited AI script generation</p>
                </div>
                <span className="text-lg font-semibold text-white">$19.99/month</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 primary-button w-full justify-center"
              >
                <CreditCard className="w-4 h-4" />
                Upgrade to Pro
              </motion.button>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-white">Account Settings</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full input-field"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  className="mt-1 w-full input-field"
                  placeholder="https://youtube.com/c/yourchannel"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="primary-button mt-4"
              >
                Save Changes
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}