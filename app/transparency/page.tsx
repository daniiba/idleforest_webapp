"use client";

import Navigation from "@/components/navigation";
import { Shield, Lock, FileText, Users, Globe, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

// FAQ Schema for GEO (Generative Engine Optimization)
// Targets safety/trust queries like "Is IdleForest safe?" or "Does IdleForest sell my data?"
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does IdleForest sell my personal browsing history?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. IdleForest uses a sessionless fetching method. It only accesses public web data (like pricing or stock info) and never accesses your personal cookies, login data, or browsing history."
      }
    },
    {
      "@type": "Question",
      "name": "Is IdleForest safe to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. IdleForest is completely safe. We use industry-standard TLS/SSL encryption, our code is open source for full transparency, and all requests run in isolated environments with no access to your cookies, local storage, or browsing history."
      }
    },
    {
      "@type": "Question",
      "name": "Is IdleForest legitimate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. IdleForest is a registered European company that complies with GDPR. We work exclusively with one vetted partner (Olostep) and maintain full transparency about how bandwidth is used. All traffic is logged, monitored, and we provide legal liability protection for users."
      }
    },
    {
      "@type": "Question",
      "name": "What is idle bandwidth?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Idle bandwidth is the internet capacity you pay for but aren't actively using—like when you're reading a PDF, writing an email, or sleeping. IdleForest uses this unused capacity to access public web data, funding tree planting without affecting your browsing experience."
      }
    }
  ]
};

export default function TransparencyPage() {
  return (
    <>
      <Navigation />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="min-h-screen bg-brand-gray text-black pt-32 lg:pt-24">
        {/* Hero Section */}
        <section className="relative bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-brand-navy text-brand-yellow px-4 py-2 rounded-md mb-6">
                <Shield className="h-5 w-5" />
                <span className="font-bold text-sm uppercase">Full Transparency</span>
              </div>
              <h1 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold mb-6">
                How Your Bandwidth Is Used
              </h1>
              <p className="text-lg md:text-xl text-neutral-800 max-w-3xl mx-auto">
                We believe in complete transparency. Here's exactly who uses your idle bandwidth, what they do with it, and the legal protections we provide.
              </p>
            </div>
          </div>
        </section>

        {/* Environmental Impact Section */}
        <section className="relative bg-brand-navy text-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Why Distributed Networks Are Greener
                </h2>
                <p className="text-lg max-w-3xl mx-auto">
                  Yes, companies need data. But <strong>how</strong> they get that data matters for the environment. Distributed networks like Olostep are significantly more eco-friendly than traditional data centers.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Traditional Server Farms */}
                <Card className="bg-brand-yellow text-black border-2 border-brand-yellow p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                      <span className="text-3xl">🏭</span>
                    </div>
                    <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold">
                      Traditional Data Centers
                    </h3>
                  </div>
                  <ul className="space-y-3 text-neutral-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span><strong>Massive energy consumption:</strong> Data centers use 1-2% of global electricity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span><strong>24/7 cooling systems:</strong> Up to 40% of energy goes to cooling alone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span><strong>Dedicated infrastructure:</strong> Servers running solely for web scraping</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span><strong>Water usage:</strong> Millions of gallons per day for cooling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span><strong>E-waste:</strong> Hardware replaced every 3-5 years</span>
                    </li>
                  </ul>
                </Card>

                {/* Distributed Networks */}
                <Card className="bg-brand-yellow text-black border-2 border-brand-yellow p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4 p-2">
                      <Image src="/logo.svg" alt="IdleForest logo" width={48} height={48} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold">
                      Distributed Networks
                    </h3>
                  </div>
                  <ul className="space-y-3 text-neutral-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Zero new infrastructure:</strong> Uses existing devices already running</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>No additional cooling:</strong> Devices use ambient cooling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Idle resource utilization:</strong> Bandwidth that would otherwise be wasted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>No water consumption:</strong> Zero dedicated cooling infrastructure</span>
                    </li>

                  </ul>
                </Card>
              </div>

              {/* Impact Statistics */}
              <div className="bg-brand-yellow border-2 border-brand-yellow p-8 md:p-10">
                <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold text-center mb-8 text-black">
                  Estimated Environmental Savings
                </h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">~85%</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">LESS ENERGY PER REQUEST</div>
                    <p className="text-xs text-neutral-600 mt-2">No dedicated servers or cooling infrastructure needed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">~95%</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">LESS WATER USAGE</div>
                    <p className="text-xs text-neutral-600 mt-2">No water-intensive cooling systems required</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">~75%</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">LOWER CARBON FOOTPRINT</div>
                    <p className="text-xs text-neutral-600 mt-2">Reduced manufacturing and operational emissions</p>
                  </div>
                </div>
                <div className="bg-brand-gray border-2 border-black p-6 text-center">
                  <p className="text-neutral-800 leading-relaxed">
                    <strong className="text-black">The bottom line:</strong> Modern systems rely on web data. With IdleForest, we reduce the costs of traditional data center systems by <strong className="text-black">80–90%</strong> through distributed networks like Olostep, then plant more trees than needed to offset the remaining footprint—making the entire process <strong className="text-black">net negative</strong>.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Our Approved Client Section */}
        <section className="relative bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Our Approved Client
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  We work exclusively with one vetted partner to ensure the highest standards of security and ethical use.
                </p>
              </div>

              <Card className="bg-brand-yellow border-2 border-black p-8 md:p-10 mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-2">
                      Olostep
                    </h3>
                    <p className="text-neutral-800 font-bold mb-2">Web Data API for Applications</p>
                    <a
                      href="https://www.olostep.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-navy hover:underline font-bold"
                    >
                      Visit Olostep.com
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-lg mb-2">What Olostep Does:</h4>
                    <p className="text-neutral-800 leading-relaxed">
                      Olostep provides a web data API that helps companies and developers access clean, structured web data. They fetch publicly available information from websites to power applications, research tools, and business intelligence platforms.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-2">How Your Bandwidth Is Used:</h4>
                    <p className="text-neutral-800 leading-relaxed mb-3">
                      Your idle bandwidth is used to fetch publicly accessible websites in a <strong>sessionless manner, ensuring no personal data is transmitted</strong>. This means:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">No cookies, login credentials, or personal information are ever sent</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">Only publicly available web pages are accessed (the same content anyone can see)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">Requests are isolated from your browsing session and personal data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">Your IP address is used only to make standard web requests, similar to normal browsing</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Who Uses Olostep */}
              <div className="bg-brand-gray border-2 border-black p-8 md:p-10">
                <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-6 text-center">
                  Who Uses Olostep's Services
                </h3>
                <p className="text-neutral-800 mb-6 text-center">
                  Olostep serves legitimate AI startups and technology companies. Here are some of their verified customers:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                  {[
                    { name: "Donor Atlas", description: "Nonprofit fundraising platform", logo: "https://www.olostep.com/images/da-logo.svg", width: 82, height: 40 },
                    { name: "MerchKit", description: "E-commerce automation", logo: "https://www.olostep.com/images/455e150089b14aedb083b23c8e8f157f__1_-removebg-preview.png", width: 40, height: 40 },
                    { name: "PodQI", description: "Podcast intelligence", logo: "https://www.olostep.com/images/podqi-logo.png", width: 213, height: 40 },
                    { name: "Khoj", description: "AI-powered search assistant", logo: "https://www.olostep.com/images/khoj_original-removebg-preview.png", width: 97, height: 40 },
                    { name: "Finny AI", description: "Financial AI assistant", logo: "https://www.olostep.com/images/finny_ai-removebg-preview.png", width: 97, height: 40 },
                    { name: "Contents", description: "Content creation platform", logo: "https://www.olostep.com/images/Logo_Contents_2025_Blue-scaled.png", width: 97, height: 40 },
                    { name: "Athena HQ", description: "Business intelligence", logo: "https://www.olostep.com/images/athenahq-logo-black.png", width: 53, height: 40 },
                    { name: "CivilGrid", description: "Infrastructure data platform", logo: "https://www.olostep.com/images/CivilGrid_Logo-removebg-preview.png", width: 97, height: 40 },
                    { name: "GumLoop", description: "Workflow automation", logo: "https://www.olostep.com/images/GumLoop-_-Logo-_-Long.svg", width: 182, height: 40 },
                    { name: "Plots", description: "Data visualization", logo: "https://www.olostep.com/images/plots_black.png", width: 97, height: 40 },
                    { name: "Uman", description: "Human resources AI", logo: "https://www.olostep.com/images/uman-logo.svg", width: 97, height: 40 },
                    { name: "VeriSave", description: "Verification services", logo: "https://www.olostep.com/images/verisave-logo.png", width: 97, height: 40 },
                    { name: "Relay", description: "Workflow automation", logo: "https://www.olostep.com/images/relay-app-image-removebg-preview.png", width: 97, height: 40 },
                    { name: "OpenMart", description: "Marketplace platform", logo: "https://www.olostep.com/images/openmart_originak-removebg-preview.png", width: 52, height: 40 },
                    { name: "Profound", description: "Deep research tools", logo: "https://www.olostep.com/images/profound_logo-removebg-preview.png", width: 97, height: 40 },
                    { name: "Centralize", description: "Data aggregation", logo: "https://www.olostep.com/images/centralize-logo.png", width: 97, height: 40 },
                  ].map((company) => (
                    <div key={company.name} className="bg-brand-gray p-4 border border-neutral-300 rounded-md flex flex-col items-center justify-center text-center">
                      <div className="w-full h-12 relative mb-3 flex items-center justify-center">
                        <Image
                          src={company.logo}
                          alt={`${company.name} logo`}
                          width={company.width}
                          height={company.height}
                          className="object-contain max-h-full"
                        />
                      </div>
                      <p className="text-xs text-neutral-600">{company.description}</p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-neutral-600 text-center italic">
                  These companies use Olostep to power AI research, lead generation, market analysis, and other legitimate business intelligence applications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Types of Searches Section */}
        <section className="relative bg-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  What Types of Searches Are Performed
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Business Intelligence</h3>
                      <p className="text-sm">
                        Gathering publicly available company information, contact details, and market data for sales and research purposes.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Price Monitoring</h3>
                      <p className="text-sm">
                        Tracking product prices across e-commerce websites to help businesses stay competitive and consumers find the best deals.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Deep Research</h3>
                      <p className="text-sm">
                        AI powered deep research for healthcare, pharma and financial industries.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Content Monitoring</h3>
                      <p className="text-sm">
                        Tracking changes to websites, job postings, news articles, and other public content for business and research purposes.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-8 bg-brand-gray border-2 border-black p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-brand-navy flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">What We DON'T Do:</h4>
                    <ul className="space-y-2 text-neutral-800">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>Access password-protected or private content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>Perform illegal activities or access restricted websites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>Send spam, conduct DDoS attacks, or engage in malicious behavior</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>Access or transmit your personal data, cookies, or login credentials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>Violate website terms of service or engage in unauthorized scraping</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Protections Section */}
        <section className="relative bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Your Legal Protections
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  We take your legal protection seriously. Here are the safeguards in place to protect you.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold mb-3">
                        1. Contractual Liability Protection
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        <strong>IdleForest assumes full legal responsibility</strong> for all traffic generated through our network. Our Terms of Service explicitly state that:
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>You are not liable for the content or nature of requests made through your connection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>IdleForest indemnifies users against any legal claims arising from network usage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>We maintain comprehensive liability insurance to cover potential legal issues</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                      <Lock className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold mb-3">
                        2. Strict Client Vetting Process
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        We only work with Olostep, a legitimate business that has been thoroughly vetted:
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>Olostep is a registered company with verified business credentials</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>Their use cases are limited to legitimate web data collection for AI and business intelligence</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>We have a legal agreement that prohibits illegal activities and ensures compliance with all applicable laws</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>Olostep's code is open source and can be audited for security and compliance</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold mb-3">
                        3. Traffic Monitoring & Compliance
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        We actively monitor all network traffic to ensure compliance:
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>Automated systems flag suspicious or unauthorized traffic patterns</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>All requests are logged and can be audited if needed</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>We maintain a blocklist of prohibited websites and activities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>Any violation of our acceptable use policy results in immediate termination of the client relationship</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold mb-3">
                        4. GDPR & Data Protection Compliance
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        As a European-based service, we comply with GDPR and other data protection regulations:
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>No personal data is collected, stored, or transmitted through the network</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>All web requests are sessionless and isolated from your personal browsing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>You can opt out at any time by uninstalling the extension or desktop app</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>We maintain detailed privacy policies and data processing agreements</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Security Measures Section */}
        <section className="relative bg-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Additional Security Measures
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">🔒 Encrypted Connections</h3>
                  <p className="text-neutral-800 text-sm">
                    All traffic is encrypted using industry-standard TLS/SSL protocols to prevent interception or tampering.
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">🛡️ Isolated Execution</h3>
                  <p className="text-neutral-800 text-sm">
                    Requests run in isolated environments with no access to your cookies, local storage, or browsing history.
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">📊 Transparent Logging</h3>
                  <p className="text-neutral-800 text-sm">
                    All network activity is logged and available for your review. You can see exactly what requests are being made.
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">🔍 Open Source Code</h3>
                  <p className="text-neutral-800 text-sm mb-3">
                    Our extension and desktop app are open source, allowing independent security researchers to audit our code.
                  </p>
                  <a
                    href="https://github.com/daniiba/idleforest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-navy hover:underline font-bold text-sm"
                  >
                    View on GitHub
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">⚡ Bandwidth Controls</h3>
                  <p className="text-neutral-800 text-sm">
                    You have full control over how much bandwidth is used. Set limits or pause sharing at any time.
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">🚫 Instant Opt-Out</h3>
                  <p className="text-neutral-800 text-sm">
                    You can stop sharing your bandwidth immediately by pausing or uninstalling the app—no questions asked.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Transparency FAQ
                </h2>
              </div>

              <div className="space-y-4">
                <Card className="bg-brand-yellow border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-2">Can I see what websites are being accessed through my connection?</h3>
                  <p className="text-neutral-800">
                    Yes! We're working on a transparency dashboard that will show you anonymized statistics about the types of requests being made. In the meantime, you can review our open-source code to see exactly how the system works.
                  </p>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-2">What if Olostep's customers use the data for harmful purposes?</h3>
                  <p className="text-neutral-800">
                    Olostep's customers are vetted AI and business intelligence companies using publicly available data for legitimate purposes. Olostep has strict terms of service prohibiting illegal or harmful use. If any customer violates these terms, they are immediately terminated. Additionally, we only access publicly available information—the same content anyone can view in a web browser.
                  </p>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-2">How do I know you won't add more clients in the future without telling me?</h3>
                  <p className="text-neutral-800">
                    We commit to updating this transparency page whenever we add new approved clients. You'll receive an email notification about any changes, and you can always opt out if you're not comfortable with new partnerships. Transparency is core to our mission.
                  </p>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-2">Is my internet service provider (ISP) aware of this activity?</h3>
                  <p className="text-neutral-800">
                    From your ISP's perspective, the traffic looks like normal web browsing. It's encrypted HTTPS traffic to legitimate websites. There's nothing unusual or suspicious about it. Many users already share bandwidth through similar services without any issues.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative bg-brand-navy text-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-6">
                Still Have Questions?
              </h2>
              <p className="text-lg mb-8">
                We're committed to complete transparency. If you have any concerns or questions about how your bandwidth is used, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-brand-yellow text-black font-bold px-8 py-4 rounded-full hover:bg-white transition-colors"
                >
                  Contact Us
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border-2 border-brand-yellow text-brand-yellow font-bold px-8 py-4 rounded-full hover:bg-brand-yellow hover:text-black transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
