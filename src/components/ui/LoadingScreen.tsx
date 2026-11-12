import React from 'react'
import { BookOpen } from 'lucide-react'

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-navy-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated logo */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto animate-pulse-glow">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-2xl gradient-brand opacity-30 animate-ping mx-auto" />
        </div>

        {/* Brand name */}
        <h1 className="text-2xl font-bold text-white font-display mb-1">
          Find My Notes
        </h1>
        <p className="text-navy-400 text-sm mb-6">Study Smart · Score Higher</p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
