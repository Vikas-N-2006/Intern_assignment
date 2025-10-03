import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500/90 dark:bg-green-600/90',
          borderColor: 'border-green-400/50',
          iconColor: 'text-white',
          progressColor: 'bg-green-300/50'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-500/90 dark:bg-red-600/90',
          borderColor: 'border-red-400/50',
          iconColor: 'text-white',
          progressColor: 'bg-red-300/50'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-500/90 dark:bg-orange-600/90',
          borderColor: 'border-orange-400/50',
          iconColor: 'text-white',
          progressColor: 'bg-orange-300/50'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-500/90 dark:bg-blue-600/90',
          borderColor: 'border-blue-400/50',
          iconColor: 'text-white',
          progressColor: 'bg-blue-300/50'
        };
    }
  };

  const config = getToastConfig(type);
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.4
          }}
          className="pointer-events-auto w-full max-w-sm"
        >
          <div className={`${config.bgColor} ${config.borderColor} backdrop-blur-lg border rounded-2xl shadow-2xl overflow-hidden`}>
            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className={`h-1 ${config.progressColor}`}
            />
            
            <div className="p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className={`${config.iconColor} flex-shrink-0 mt-0.5`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white font-medium text-sm leading-relaxed"
                  >
                    {message}
                  </motion.p>
                </div>
                
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={onClose}
                  className="text-white/80 hover:text-white flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
