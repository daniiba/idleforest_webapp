'use client'

// Essential React/Next.js imports
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// UI Components (assuming these paths are correct)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation"; // Assuming Navigation component exists

// Animation Libraries
import { motion } from "framer-motion";

// Icons
import { ArrowRight, Building2, Download, FileText, Globe, TreePine, Users, Monitor, Apple, Shield, ChartBar, Megaphone, HeartHandshake } from "lucide-react";

// Reusable Slide-In Animation Component
const SlideIn = ({
  children,
  direction = "left",
  delay = 0
}: {
  children: React.ReactNode,
  direction?: "left" | "right",
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -20 : 20 }} // Start off-screen and transparent
      animate={{ opacity: 1, x: 0 }} // Animate to full opacity and original position
      transition={{ duration: 0.5, delay }} // Control animation speed and delay
    >
      {children}
    </motion.div>
  );
};

// Reusable Feature Card Component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay
}: {
  icon: React.ElementType, // Use ElementType for component props
  title: string,
  description: string,
  delay: number
}) => {
  return (
    <SlideIn delay={delay}>
      <Card className="bg-brand-yellow border-2 border-black hover:border-black transition-colors h-full shadow-lg"> {/* Yellow background with black border */}
        <CardContent className="p-6 flex flex-col h-full">
          <div className="mb-4 p-3 bg-black rounded-md w-fit">
            <Icon className="text-brand-yellow h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold text-black mb-2">{title}</CardTitle>
          <p className="text-black/80 text-sm flex-grow">{description}</p>
        </CardContent>
      </Card>
    </SlideIn>
  );
};

// Main Business Page Component
export default function BusinessPage() {
  const [currentBrowser, setCurrentBrowser] = useState('chrome') // Default to Chrome

  useEffect(() => {
    // Detect browser from user agent
    const detectBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase()

      if (userAgent.indexOf('edg') !== -1) {
        return 'edge'
      } else if (userAgent.indexOf('firefox') !== -1) {
        return 'firefox'
      } else if (userAgent.indexOf('chrome') !== -1) {
        return 'chrome'
      } else {
        return 'chrome' // Default to Chrome for other browsers
      }
    }
    // href="https://microsoftedge.microsoft.com/addons/detail/idle-forest-plant-trees/cccklibfpcangcakgpllhcohldgcginb"
    // href="https://chromewebstore.google.com/detail/idleforest/ofdclafhpmccdddnmfalihgkahgiomjk"
    // href="https://addons.mozilla.org/en-US/firefox/addon/idleforest/"

    setCurrentBrowser(detectBrowser())
  }, [])

  return (
    // Main container with black background and white text
    <div className="min-h-screen bg-brand-gray text-black overflow-x-hidden md:pt-24"> {/* Prevent horizontal scroll */}
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-[80vh] flex justify-center items-center pt-32 pb-16 relative overflow-hidden bg-white">
        {/* Decorative SVG Lines */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <Image
            src="/Vector (Stroke).svg"
            alt=""
            fill
            className="object-cover opacity-100"
            priority
          />
        </div>

        {/* Hero Content Container */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center gap-12">
            {/* Center aligned text and button */}
            <div className="max-w-4xl text-center">
              <SlideIn>
                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Passively Boost Your ESG Score & <span className="block">Reforest the Planet</span>
                </h1>
                {/* Sub-heading/description */}
                <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
                  Transform your company's unused bandwidth into verified environmental impact. We handle the setup, legal, and certificates—you get the ESG boost.
                </p>
                {/* Action Button */}
                <div className="flex justify-center">
                  <Link href="/contact" passHref>
                    <Button
                      className="bg-brand-yellow hover:bg-brand-yellow/90 text-black font-semibold py-3 px-8 rounded-md text-lg"
                    >
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </SlideIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-brand-yellow relative">
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <SlideIn>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">What We Can Do For Companies</h2>
              <p className="text-base lg:text-lg text-black/80 max-w-3xl mx-auto">
                Join the growing number of companies making a real environmental impact while engaging employees in sustainability efforts.
              </p>
            </SlideIn>
          </div>
          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature Cards using the reusable component */}
            <FeatureCard icon={ChartBar} title="ESG & B-Corp Scoring" description="Directly improve your ESG ratings and B-Corp certification scores with verified impact data." delay={0.1} />
            <FeatureCard icon={Megaphone} title="Enhance Public Image" description="Strengthen your brand reputation and demonstrate authentic commitment to sustainability." delay={0.2} />
            <FeatureCard icon={Users} title="Community Spotlight" description="Gain exposure by being featured to our engaged community of eco-conscious users." delay={0.3} />
            <FeatureCard icon={Building2} title="Automated Onboarding" description="Fully automated setup across your entire network. 130MB lightweight deployment." delay={0.4} />
            <FeatureCard icon={FileText} title="Verified Certificates" description="Certificates backed by Tree Nation. Issued yearly or every 6 months for your reports." delay={0.5} />
            <FeatureCard icon={HeartHandshake} title="Donation Matching" description="We match your donations until you reach your agreed ESG/CSR goal." delay={0.6} />
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 lg:py-24 bg-brand-yellow relative">
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <SlideIn>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Download IdleForest</h2>
              <p className="text-base lg:text-lg text-black/80 max-w-3xl mx-auto">
                Get started with IdleForest on your desktop and make a positive environmental impact today.
              </p>
            </SlideIn>
          </div>

          {/* Download Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Windows Download Card */}
            <SlideIn delay={0.1}>
              <Card className="bg-brand-yellow border-2 border-black hover:border-black transition-colors h-full shadow-lg">
                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  <div className="mb-6 p-4 bg-black rounded-md">
                    <Monitor className="text-brand-yellow h-12 w-12" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-black mb-4">Windows</CardTitle>
                  <p className="text-black/80 mb-6 flex-grow">130MB lightweight download. Enterprise-ready executable supporting silent installation and automated network-wide deployment.</p>
                  <Button
                    asChild
                    className="bg-black hover:bg-black/90 text-brand-yellow font-medium py-3 px-6 rounded-md transition-colors duration-200 mt-auto"
                  >
                    <Link
                      href="https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe"
                      className="flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-5 w-5" /> Download for Windows
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </SlideIn>

            {/* Mac Download Card */}
            <SlideIn delay={0.2}>
              <Card className="bg-brand-yellow border-2 border-black hover:border-black transition-colors h-full shadow-lg">
                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  <div className="mb-6 p-4 bg-black rounded-md">
                    <Apple className="text-brand-yellow h-12 w-12" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-black mb-4">MAC OS</CardTitle>
                  <p className="text-black/80 mb-6 flex-grow">Optimized for macOS Apple Silicon and Intel. Runs silently in the background with zero performance impact on your team's workflow.</p>
                  <Button
                    asChild
                    className="bg-black hover:bg-black/90 text-brand-yellow font-medium py-3 px-6 rounded-md transition-colors duration-200 mt-auto"
                  >
                    <Link
                      href="https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip"
                      className="flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-5 w-5" /> Download for Mac
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Certificates Section */}
      <section id="certificates" className="py-16 lg:py-24 bg-black relative">
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <SlideIn>
              <h2 className="text-white font-bold text-3xl lg:text-4xl mb-4">Verified Impact Certificates</h2>
              <p className="text-base lg:text-lg text-neutral-400 max-w-3xl mx-auto">
                Showcase your company's environmental commitment with certificates backed by Tree Nation.
              </p>
            </SlideIn>
          </div>
          {/* Certificate Layout */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center">
            {/* Sample Certificate */}
            <SlideIn delay={0.1}>
              <motion.div
                className="bg-neutral-900 p-8 rounded-lg border-2 border-neutral-800 max-w-md shadow-lg hover:shadow-brand-yellow w-full"
                animate={{
                  y: [0, -10, 0],
                  x: [0, 5, 0, -5, 0],
                  boxShadow: [
                    '0 10px 15px -3px rgba(160, 185, 16, 0.1), 0 4px 6px -4px rgba(160, 185, 16, 0.1)',
                    '0 20px 25px -5px rgba(160, 185, 16, 0.3), 0 8px 10px -6px rgba(160, 185, 16, 0.3)',
                    '0 10px 15px -3px rgba(160, 185, 16, 0.1), 0 4px 6px -4px rgba(160, 185, 16, 0.1)'
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut"
                }}
              >
                {/* Certificate Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <TreePine className="text-brand-yellow h-8 w-8" />
                    <h3 className="text-2xl font-bold text-white">IdleForest</h3>
                  </div>
                  <div className="text-sm text-neutral-400">Certificate #12345</div>
                </div>
                {/* Certificate Body */}
                <h3 className="text-xl font-semibold mb-4 text-white">Certificate of Impact</h3>
                <p className="mb-6 text-neutral-300">This certifies that</p>
                <h4 className="text-2xl font-bold text-brand-yellow mb-6">Acme Corporation</h4>
                <p className="mb-6 text-neutral-300">has contributed to global reforestation efforts through IdleForest, resulting in:</p>
                {/* Impact Metrics */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center"><span className="text-neutral-300">Trees Planted:</span><span className="text-xl font-bold text-brand-yellow">1,234</span></div>
                  <Separator className="bg-neutral-700" />
                  <div className="flex justify-between items-center"><span className="text-neutral-300">CO₂ Offset:</span><span className="text-xl font-bold text-brand-yellow">24.7 tons</span></div>
                  <Separator className="bg-neutral-700" />
                  <div className="flex justify-between items-center"><span className="text-neutral-300">Project Locations:</span><span className="text-sm text-brand-yellow">Madagascar, Brazil, Indonesia</span></div> {/* Smaller text for locations */}
                  <Separator className="bg-neutral-700" />
                  <div className="flex justify-between items-center"><span className="text-neutral-300">Period:</span><span className="text-brand-yellow">Jan 2025 - Apr 2025</span></div>
                </div>
                {/* Footer/Verification */}
                <div className="text-center mt-8">
                  <p className="text-xs text-neutral-400">Verified and authenticated by IdleForest</p>
                  <p className="text-xs text-neutral-500 mt-1">Digital signature: 0x8a721cf...</p>
                </div>
              </motion.div>
            </SlideIn>
            {/* Certificate Features/Benefits Text */}
            <div className="md:w-1/2 space-y-6 lg:space-y-8 max-w-md">
              <SlideIn direction="right" delay={0.2}>
                <h3 className="text-2xl font-bold text-white">Recognized & Trusted</h3>
                <p className="text-neutral-300 mt-2">Certificates are backed by Tree Nation, recognized and trusted worldwide. Trusted by 700+ users and companies.</p>
              </SlideIn>
              <SlideIn direction="right" delay={0.3}>
                <h3 className="text-2xl font-bold text-white">Shareable Reports</h3>
                <p className="text-neutral-300 mt-2">Certificates issued yearly or every 6 months. Download and share PDF reports to enhance your brand marketing.</p>
              </SlideIn>
              <SlideIn direction="right" delay={0.4}>
                <h3 className="text-2xl font-bold text-white">ESG & B-Corp Ready</h3>
                <p className="text-neutral-300 mt-2">Passively boost your ESG and B-Corp scoring with verified impact data. Use our certificates to validate your contributions.</p>
              </SlideIn>

            </div>
          </div>
        </div>
      </section>

      {/* Deployment Section - Commented out as per original request */}
      {/*
      <section id="deployment-section" className="py-16 lg:py-24 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <SlideIn>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Deploy IdleForest Across Your Organization</h2>
              <p className="text-lg lg:text-xl text-neutral-300 max-w-3xl mx-auto">
                Get started with our enterprise deployment options. Our team will help you set up and manage the installation process.
              </p>
            </SlideIn>
          </div>
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <SlideIn>
                <Card className="bg-neutral-900 border border-neutral-700 p-6 lg:p-8">
                  <CardTitle className="text-2xl font-bold mb-6 text-white">Request Enterprise Deployment</CardTitle>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-white mb-1">Company Name</label>
                      <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Corporation" className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Business Email</label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@company.com" className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow" required />
                    </div>
                    <div>
                      <label htmlFor="employees" className="block text-sm font-medium text-white mb-1">Number of Employees</label>
                      <Input id="employees" name="employees" type="number" value={formData.employees} onChange={handleChange} placeholder="e.g., 100" className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow" required min="1" />
                    </div>
                    <Button type="submit" className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3 px-6 rounded-md transition-colors duration-200 mt-6">
                      Request Deployment Package
                    </Button>
                  </form>
                </Card>
              </SlideIn>
            </div>
            <div className="md:w-1/2 space-y-6 lg:space-y-8">
              <SlideIn direction="right" delay={0.2}>
                <h3 className="text-2xl font-bold text-white">Browser Extension</h3>
                <p className="text-neutral-300 mb-4 mt-2">Deploy our browser extension across your organization with group policy or enterprise management tools.</p>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">Chrome Enterprise</Button>
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">Firefox Enterprise</Button>
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">Edge Enterprise</Button>
                </div>
              </SlideIn>
              <SlideIn direction="right" delay={0.3}>
                <h3 className="text-2xl font-bold mt-8 text-white">Desktop Application</h3>
                <p className="text-neutral-300 mb-4 mt-2">Deploy our desktop application using your existing software distribution system.</p>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">Windows MSI</Button>
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">macOS PKG</Button>
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">Linux DEB/RPM</Button>
                </div>
              </SlideIn>
              <SlideIn direction="right" delay={0.4}>
                <p className="text-neutral-400 mt-6 text-sm">
                  Our enterprise team will provide you with a custom deployment package and documentation tailored to your organization's needs after you submit the request.
                </p>
              </SlideIn>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Call to Action (CTA) Section */}
      <section className="py-16 lg:py-24 bg-brand-yellow">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <SlideIn>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">Ready to make a difference?</h2>
              <p className="text-base lg:text-lg text-black/80 mb-8">
                Join the growing community of businesses using IdleForest to make a positive environmental impact.
              </p>
              {/* CTA Button */}
              <div className="flex justify-center">
                <Link href="/contact" passHref>
                  <Button className="bg-black hover:bg-black/90 text-brand-yellow font-semibold py-3 px-8 rounded-md transition-colors duration-200">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

    </div>
  );
}