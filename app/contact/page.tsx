'use client'

// Essential React/Next.js imports
import { useState } from "react";
import Link from "next/link"; // Although not used directly for links here, good practice to keep

// UI Components (assuming these paths are correct)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader
import Navigation from "@/components/navigation"; // Assuming Navigation component exists

// Animation Libraries
import { motion } from "framer-motion";

// Icons
import { Mail, Phone, MapPin, Send, Building, ArrowRight, CalendarDays } from "lucide-react"; // Added Send, Building, and CalendarDays icons

// Reusable Slide-In Animation Component (copied from BusinessPage for self-containment)
const SlideIn = ({
  children,
  direction = "left",
  delay = 0
}: {
  children: React.ReactNode,
  direction?: "left" | "right" | "up" | "down", // Added up/down
  delay?: number
}) => {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const offset = direction === "left" || direction === "up" ? -20 : 20;

  return (
    <motion.div
      initial={{ opacity: 0, [axis]: offset }} // Start off-screen and transparent
      animate={{ opacity: 1, [axis]: 0 }} // Animate to full opacity and original position
      transition={{ duration: 0.5, delay }} // Control animation speed and delay
    >
      {children}
    </motion.div>
  );
};


// Main Contact Page Component
export default function ContactPage() {
  // State for the contact form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '', // Added companyName
    companySize: '', // Added companySize
    location: '',    // Added location
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  // Handle form input changes (works for Input and Textarea)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear status when user starts typing again
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    console.log("Contact Form Data:", formData); // Log data

    try {
      // Send data to our API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      console.log("Form submitted successfully");
      setSubmitStatus('success');
      // Clear form on success
      setFormData({ name: '', email: '', companyName: '', companySize: '', location: '', subject: '', message: '' });

    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Main container with black background and white text
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      {/* Main Content Section */}
      <section className="py-20 lg:py-28 relative isolate"> {/* Isolate for stacking context */}

        {/* Background Glow Effect */}
        <div
          className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
          aria-hidden="true"
        >
          <div
            className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#059669] to-[#34d399] opacity-20 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]" // Emerald gradient
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <SlideIn direction="down">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-brand-yellow to-green-500 text-transparent bg-clip-text">
                Get In Touch
              </h1>
              <p className="text-lg lg:text-xl text-neutral-300 max-w-2xl mx-auto">
                Have questions, feedback, or interested in enterprise solutions? We'd love to hear from you.
              </p>
            </SlideIn>
          </div>

          {/* Content Layout: Form on Left, Info on Right */}
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">

            {/* Left Side: Contact Form */}
            <div className="w-full md:w-3/5 lg:w-1/2">
              <SlideIn direction="left" delay={0.1}>
                <Card className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/60 shadow-xl shadow-brand-yellow/10 rounded-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white">Send us a message</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Name Input */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">Full Name</label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Email Input */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">Email Address</label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Company Name Input */}
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-neutral-300 mb-1">Company Name</label>
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Your Company Inc."
                          className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Company Size Input */}
                      <div>
                        <label htmlFor="companySize" className="block text-sm font-medium text-neutral-300 mb-1">Company Size</label>
                        <Input
                          id="companySize"
                          name="companySize"
                          type="text"
                          value={formData.companySize}
                          onChange={handleChange}
                          placeholder="e.g., 1-10, 50-200, 1000+"
                          className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Location Input */}
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-neutral-300 mb-1">Location (City, Country)</label>
                        <Input
                          id="location"
                          name="location"
                          type="text"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g., London, UK"
                          className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Subject Input (Optional) */}
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-1">Subject <span className="text-neutral-500">(Optional)</span></label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="e.g., Enterprise Inquiry"
                          className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Message Textarea */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-1">Your Message</label>
                        <Textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Type your message here..."
                          className="bg-neutral-800 border-neutral-600 placeholder-neutral-500 text-white focus:border-brand-yellow focus:ring-brand-yellow min-h-[100px]" // Added min-h
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Submission Button & Status */}
                      <div className="pt-2">
                        {submitStatus === 'success' && (
                          <p className="text-sm text-brand-yellow mb-3">✓ Message sent successfully! We'll get back to you soon.</p>
                        )}
                        {submitStatus === 'error' && (
                          <p className="text-sm text-red-500 mb-3">✗ Oops! Something went wrong. Please try again.</p>
                        )}
                        <Button
                          type="submit"
                          className="w-full bg-brand-yellow hover:bg-brand-yellow text-white font-bold py-3 px-6 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Message <Send className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </SlideIn>
            </div>

            {/* Right Side: Contact Information */}
            <div className="w-full md:w-2/5 lg:w-1/2 md:mt-0"> {/* Removed Card here for simpler look */}
              <SlideIn direction="right" delay={0.2}>
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>

                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-neutral-800 rounded-full flex-shrink-0">
                      <Mail className="h-5 w-5 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Email Us</h3>
                      <a href="mailto:support@idleforest.com" className="text-brand-yellow hover:text-brand-yellow transition-colors break-all">
                        support@idleforest.com
                      </a>
                      <p className="text-sm text-neutral-400 mt-1">General inquiries & support</p>
                    </div>
                  </div>

                  {/* Book a Meeting */}
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-neutral-800 rounded-full flex-shrink-0">
                      <CalendarDays className="h-5 w-5 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Book a Meeting</h3>
                      <a href="https://calendly.com/idleforest" target="_blank" rel="noopener noreferrer" className="text-brand-yellow hover:text-brand-yellow transition-colors">
                        Schedule a call with us
                      </a>
                      <p className="text-sm text-neutral-400 mt-1">Find a time that works for you</p>
                    </div>
                  </div>

                  {/* Phone */}
                  {/*  <div className="flex items-start gap-4">
                             <div className="mt-1 p-2 bg-neutral-800 rounded-full flex-shrink-0">
                                <Phone className="h-5 w-5 text-brand-yellow" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Call Us</h3>
                                <a href="tel:+351XXXXXXXXX" className="text-brand-yellow hover:text-brand-yellow transition-colors">
                                    +351 XXX XXX XXX 
                                </a>
                                <p className="text-sm text-neutral-400 mt-1">Mon-Fri, 9am - 6pm WET</p>
                            </div>
                        </div> */}

                  {/* Address */}
                  {/* <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-neutral-800 rounded-full flex-shrink-0">
                                <MapPin className="h-5 w-5 text-brand-yellow" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Our Office</h3>
                                <p className="text-neutral-300">
                                    123 GreenTech Avenue<br/>
                                    Lisbon, 1000-001<br/>
                                    Portugal
                                </p>
                                <p className="text-sm text-neutral-400 mt-1">(Visits by appointment only)</p>
                            </div>
                        </div> */}



                </div>
              </SlideIn>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}