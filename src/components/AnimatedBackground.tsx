import { motion } from 'framer-motion'
import { useMemo } from 'react'

export default function AnimatedBackground() {
  // Reduced circles - Clear and visible animations
  const circles = useMemo(() => [
    // Large circles - Slow, gentle movement
    { 
      size: 450, x: '10%', y: '20%', delay: 0, duration: 35, 
      opacity: [0.3, 0.6, 0.3], 
      moveY: -60, moveX: 50, 
      scale: [1, 1.3, 1],
      borderRadius: [50, 45, 50],
      color: 'blue' 
    },
    { 
      size: 420, x: '85%', y: '25%', delay: 8, duration: 38, 
      opacity: [0.25, 0.55, 0.25], 
      moveY: -55, moveX: -45, 
      scale: [1, 1.25, 1],
      borderRadius: [50, 55, 50],
      color: 'indigo' 
    },
    { 
      size: 480, x: '20%', y: '75%', delay: 15, duration: 32, 
      opacity: [0.3, 0.6, 0.3], 
      moveY: 65, moveX: 55, 
      scale: [1, 1.35, 1],
      borderRadius: [50, 40, 50],
      color: 'purple' 
    },
    { 
      size: 400, x: '75%', y: '70%', delay: 12, duration: 40, 
      opacity: [0.25, 0.5, 0.25], 
      moveY: 60, moveX: -50, 
      scale: [1, 1.3, 1],
      borderRadius: [50, 60, 50],
      color: 'cyan' 
    },
    
    // Medium circles - Moderate movement
    { 
      size: 320, x: '5%', y: '50%', delay: 3, duration: 28, 
      opacity: [0.4, 0.65, 0.4], 
      moveY: -70, moveX: 60, 
      scale: [1, 1.4, 1],
      borderRadius: [50, 40, 50],
      color: 'blue' 
    },
    { 
      size: 350, x: '90%', y: '15%', delay: 10, duration: 30, 
      opacity: [0.35, 0.6, 0.35], 
      moveY: -65, moveX: -55, 
      scale: [1, 1.35, 1],
      borderRadius: [50, 55, 50],
      color: 'indigo' 
    },
    { 
      size: 300, x: '50%', y: '10%', delay: 18, duration: 26, 
      opacity: [0.4, 0.7, 0.4], 
      moveY: 75, moveX: 65, 
      scale: [1, 1.5, 1],
      borderRadius: [50, 45, 50],
      color: 'purple' 
    },
    { 
      size: 340, x: '35%', y: '80%', delay: 20, duration: 33, 
      opacity: [0.35, 0.6, 0.35], 
      moveY: 70, moveX: -60, 
      scale: [1, 1.4, 1],
      borderRadius: [50, 60, 50],
      color: 'cyan' 
    },
  ], [])

  const colorClasses = {
    blue: 'bg-blue-400/50',
    indigo: 'bg-indigo-400/50',
    purple: 'bg-purple-400/50',
    cyan: 'bg-cyan-400/50',
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ willChange: 'transform' }}>
      {/* Floating Circles - Minimized for clarity */}
      {circles.map((circle, index) => (
        <motion.div
          key={`circle-${index}`}
          className={`absolute ${colorClasses[circle.color as keyof typeof colorClasses]} blur-3xl`}
          style={{
            width: circle.size,
            height: circle.size,
            left: circle.x,
            top: circle.y,
            borderRadius: `${circle.borderRadius[0]}%`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            y: [0, circle.moveY, 0],
            x: [0, circle.moveX, 0],
            scale: circle.scale,
            opacity: circle.opacity,
            borderRadius: circle.borderRadius.map(radius => `${radius}%`),
          }}
          transition={{
            duration: circle.duration,
            delay: circle.delay,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1], // Smooth easeInOut
            repeatType: 'loop',
          }}
        />
      ))}
    </div>
  )
}
