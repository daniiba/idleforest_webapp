'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  CheckCircle2,
  Monitor,
  Apple,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import { motion } from 'framer-motion'

// Animation component for fade-in effect
const FadeIn = ({
  children,
  delay = 0
}: {
  children: React.ReactNode,
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

// Step Card Component
const StepCard = ({
  stepNumber,
  title,
  description,
  fullDescription, // Added
  imageSrc,
  bgColor = 'bg-blue-600',
  textHelp,
  delay = 0
}: {
  stepNumber: number
  title: string
  description: React.ReactNode
  fullDescription?: React.ReactNode; // Added
  imageSrc?: string
  bgColor?: string
  textHelp?: string
  delay?: number
}) => {
  // Hardcoded brighter background colors for each step
  const getImageBgColor = () => {
    switch (stepNumber) {
      case 1:
        return 'bg-blue-400';
      case 2:
        return 'bg-purple-400';
      case 3:
        return 'bg-brand-yellow';
      default:
        return 'bg-blue-400';
    }
  };

  const imageBgColor = getImageBgColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl overflow-hidden shadow-xl flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Main content section - 2/3 height */}
      <div
        className={`${bgColor} p-7 flex flex-col flex-grow`}
      >
        <div className="mb-4">
          <div className="text-sm font-medium text-white/80">STEP {stepNumber}</div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        <div className="text-white/90 flex-grow min-h-[3em]">{description}</div>

        {textHelp && (
          <div className="mt-4 flex items-start gap-2">
            <HelpCircle className="h-5 w-5 text-white/70 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/70">{textHelp}</p>
          </div>
        )}
      </div>

      {/* Image section - 1/3 height with brighter background */}
      {imageSrc ? (
        <div
          className={`${imageBgColor} p-4 flex items-center justify-center h-52`}
        >
          <div className="bg-white/10 rounded-lg p-2 flex justify-center items-center w-full h-full">
            <Image
              src={imageSrc}
              alt={`Step ${stepNumber}: ${title}`}
              width={300}
              height={200}
              className="rounded object-contain max-h-full"
            />
          </div>
        </div>
      ) : (
        <div
          className={`${imageBgColor} h-52`}
        />
      )}
    </motion.div>
  )
}

export default function DownloadSuccessPage() {
  const [platform, setPlatform] = useState<'windows' | 'mac' | null>(null);

  useEffect(() => {
    const platformString = navigator.platform.toLowerCase();
    if (platformString.includes('win')) {
      setPlatform('windows');
    } else {
      setPlatform('mac'); // Default to Mac for non-Windows OS (including Mac, Linux, etc.)
    }
  }, []);


  return (
    <div className="min-h-screen bg-brand-gray text-white">
      <Navigation />

      <main className="container mx-auto px-4 pb-32">
        {/* Download Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-brand-yellow/30 rounded-full mb-6"
          >
            <Download className="h-10 w-10 text-brand-yellow" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
          >
            Thanks for downloading IdleForest, only a few steps left
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-neutral-300 max-w-2xl mx-auto"
          >
            Follow the instructions below to install IdleForest and start planting trees.
          </motion.p>
        </div>

        {/* Installation Steps */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            {platform === 'windows' ? (
              <>
                <StepCard
                  stepNumber={1}
                  title="Download" // Changed
                  bgColor="bg-blue-900"
                  delay={0.3}
                  description={ // Changed
                    <>
                      <p>Download the <strong>IdleForestSetup.zip</strong> file. You'll find it in your browser's downloads list or your Downloads folder.</p>
                    </>
                  }
                  textHelp="Can't find the installer? Check your Downloads folder."
                  imageSrc="/onboarding/download_windows.png"
                />

                <StepCard
                  stepNumber={2}
                  title="Extract" // Changed
                  bgColor="bg-purple-900"
                  delay={0.4}
                  description={ // Changed
                    <>
                      <p>Go to your Downloads folder, find <strong>IdleForestSetup.zip</strong>, and extract its contents to a new folder.</p>
                    </>
                  }
                  textHelp="Right-click the .zip file and choose 'Extract All...' or use your preferred unzipping tool." // Added
                  imageSrc="/onboarding/install_windows.png"
                />

                <StepCard
                  stepNumber={3}
                  title="Run & Approve"
                  bgColor="bg-brand-yellow"
                  delay={0.5}
                  description={ // Shortened initial description - Changed
                    <>
                      <p>Open the extracted folder and run <strong>IdleForest.exe</strong>. If SmartScreen appears, click '<strong>More info</strong>', then '<strong>Run anyway</strong>'.</p>
                    </>
                  }
                  fullDescription={ // Original long description for hover - Changed
                    <>
                      <p>Open the folder where you extracted the files and double-click <strong>IdleForest.exe</strong>. Windows Defender SmartScreen might show a warning like "Windows protected your PC" because our application is new. This is standard. To proceed, click '<strong>More info</strong>', then '<strong>Run anyway</strong>'.</p>
                    </>
                  }
                  textHelp="This warning appears because we are a new application. Your security is not at risk."
                  imageSrc="/onboarding/launch_windows.png"
                />
              </>
            ) : (
              <>
                <StepCard
                  stepNumber={1}
                  title="Open"
                  bgColor="bg-blue-900"
                  delay={0.3}
                  description={
                    <>
                      <p>Open the <strong>IdleForest.dmg</strong> file from your downloads list, in the bottom left of this window.</p>
                    </>
                  }
                  textHelp="Can't find the file? Check your Downloads folder."
                  imageSrc="/onboarding/download.png"
                />

                <StepCard
                  stepNumber={2}
                  title="Install"
                  bgColor="bg-purple-900"
                  delay={0.4}
                  description={
                    <>
                      <p>Drag the IdleForest icon to the Applications folder as shown.</p>
                    </>
                  }
                  imageSrc="/onboarding/install.png"
                />

                <StepCard
                  stepNumber={3}
                  title="Allow"
                  bgColor="bg-brand-yellow"
                  delay={0.5}
                  description={
                    <>
                      <p>Open IdleForest from your Applications folder. If a security warning appears, go to System Preferences → Security & Privacy, and click "Open Anyway" for IdleForest.</p>
                    </>
                  }
                  textHelp="Need more help? Contact our support team."
                  imageSrc="/onboarding/launch.png"
                />
              </>
            )}
          </div>
        </div>

        {/* What happens next section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-3xl mx-auto bg-neutral-900 rounded-xl shadow-md overflow-hidden mb-10 border border-neutral-800"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">What happens next?</h2>
            <p className="text-neutral-300 mb-6">
              IdleForest will run in the background, using your idle computing resources to help plant trees around the world. The application is designed to be lightweight and will only use resources when your computer is idle.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-800 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-brand-yellow mr-2" />
                  Impact Tracking
                </h3>
                <p className="text-neutral-400 text-sm">View your contribution to global reforestation efforts in real-time.</p>
              </div>
              <div className="bg-neutral-800 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-brand-yellow mr-2" />
                  Customization
                </h3>
                <p className="text-neutral-400 text-sm">Adjust resource usage settings to match your preferences.</p>
              </div>
            </div>
          </div>
        </motion.div>


      </main>

      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/4 right-0 w-[40rem] h-[30rem]"
          style={{
            background: 'radial-gradient(circle at right, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
            filter: 'blur(120px)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-[40rem] h-[30rem]"
          style={{
            background: 'radial-gradient(circle at left, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
            filter: 'blur(120px)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
