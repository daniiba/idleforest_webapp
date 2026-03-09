"use client";

import Navigation from "@/components/navigation";
import { Shield, Lock, FileText, Users, Globe, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('Transparency');

  return (
    <>
      <Navigation />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="min-h-screen bg-brand-gray text-black">
        {/* Hero Section */}
        <section className="relative bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-brand-navy text-brand-yellow px-4 py-2 rounded-md mb-6">
                <Shield className="h-5 w-5" />
                <span className="font-bold text-sm uppercase">{t('badge')}</span>
              </div>
              <h1 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold mb-6">
                {t('hero_title')}
              </h1>
              <p className="text-lg md:text-xl text-neutral-800 max-w-3xl mx-auto">
                {t('hero_desc')}
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
                  {t('env_title')}
                </h2>
                <p className="text-lg max-w-3xl mx-auto">
                  {t('env_desc')}
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
                      {t('dc_title')}
                    </h3>
                  </div>
                  <ul className="space-y-3 text-neutral-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_energy')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_cooling')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_infra')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_water')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_waste')}</span>
                    </li>
                  </ul>
                </Card>

                {/* Distributed Networks */}
                <Card className="bg-brand-yellow text-black border-2 border-brand-yellow p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4 p-2">
                      <Image src="/logo.png" alt="IdleForest logo" width={48} height={48} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold">
                      {t('dn_title')}
                    </h3>
                  </div>
                  <ul className="space-y-3 text-neutral-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('dn_infra')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('dn_cooling')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('dn_idle')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('dn_water')}</span>
                    </li>

                  </ul>
                </Card>
              </div>

              {/* Impact Statistics */}
              <div className="bg-brand-yellow border-2 border-brand-yellow p-8 md:p-10">
                <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold text-center mb-8 text-black">
                  {t('savings_title')}
                </h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">{t('energy_pct')}</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">{t('energy_label')}</div>
                    <p className="text-xs text-neutral-600 mt-2">{t('energy_desc')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">{t('water_pct')}</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">{t('water_label')}</div>
                    <p className="text-xs text-neutral-600 mt-2">{t('water_desc')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">{t('carbon_pct')}</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">{t('carbon_label')}</div>
                    <p className="text-xs text-neutral-600 mt-2">{t('carbon_desc')}</p>
                  </div>
                </div>
                <div className="bg-brand-gray border-2 border-black p-6 text-center">
                  <p className="text-neutral-800 leading-relaxed">
                    <strong className="text-black">{t('bottom_line')}</strong> {t('bottom_line_desc')}
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
                  {t('client_title')}
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  {t('client_desc')}
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
                    <p className="text-neutral-800 font-bold mb-2">{t('olostep_subtitle')}</p>
                    <a
                      href="https://www.olostep.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-navy hover:underline font-bold"
                    >
                      {t('visit_olostep')}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('what_olostep_does')}</h4>
                    <p className="text-neutral-800 leading-relaxed">
                      {t('what_olostep_does_desc')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('how_bandwidth_used')}</h4>
                    <p className="text-neutral-800 leading-relaxed mb-3">
                      {t('how_bandwidth_desc')}
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">{t('no_cookies')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">{t('public_only')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">{t('isolated')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">{t('ip_usage')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Who Uses Olostep */}
              <div className="bg-brand-gray border-2 border-black p-8 md:p-10">
                <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-6 text-center">
                  {t('who_uses')}
                </h3>
                <p className="text-neutral-800 mb-6 text-center">
                  {t('who_uses_desc')}
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
                  {t('who_uses_note')}
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
                  {t('searches_title')}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('bi_title')}</h3>
                      <p className="text-sm">
                        {t('bi_desc')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('price_title')}</h3>
                      <p className="text-sm">
                        {t('price_desc')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('research_title')}</h3>
                      <p className="text-sm">
                        {t('research_desc')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('content_title')}</h3>
                      <p className="text-sm">
                        {t('content_desc')}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-8 bg-brand-gray border-2 border-black p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-brand-navy flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('dont_do_title')}</h4>
                    <ul className="space-y-2 text-neutral-800">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_password')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_illegal')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_spam')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_personal')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_tos')}</span>
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
                  {t('legal_title')}
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  {t('legal_desc')}
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
                        {t('liability_title')}
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        {t('liability_desc')}
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('liability_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('liability_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('liability_3')}</span>
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
                        {t('vetting_title')}
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        {t('vetting_desc')}
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('vetting_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('vetting_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('vetting_3')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('vetting_4')}</span>
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
                        {t('monitoring_title')}
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        {t('monitoring_desc')}
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('monitoring_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('monitoring_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('monitoring_3')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('monitoring_4')}</span>
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
                        {t('gdpr_title')}
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        {t('gdpr_desc')}
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('gdpr_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('gdpr_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('gdpr_3')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('gdpr_4')}</span>
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
                  {t('security_title')}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('encrypted_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('encrypted_desc')}
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('isolated_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('isolated_desc')}
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('logging_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('logging_desc')}
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('opensource_title')}</h3>
                  <p className="text-neutral-800 text-sm mb-3">
                    {t('opensource_desc')}
                  </p>
                  <a
                    href="https://github.com/daniiba/idleforest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-navy hover:underline font-bold text-sm"
                  >
                    {t('view_github')}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('bandwidth_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('bandwidth_desc')}
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('optout_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('optout_desc')}
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
                  {t('faq_title')}
                </h2>
              </div>

              <div className="space-y-4">
                <Card className="bg-brand-yellow border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-2">{t('faq_see_q')}</h3>
                  <p className="text-neutral-800">
                    {t('faq_see_a')}
                  </p>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-2">{t('faq_harmful_q')}</h3>
                  <p className="text-neutral-800">
                    {t('faq_harmful_a')}
                  </p>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-2">{t('faq_more_q')}</h3>
                  <p className="text-neutral-800">
                    {t('faq_more_a')}
                  </p>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-2">{t('faq_isp_q')}</h3>
                  <p className="text-neutral-800">
                    {t('faq_isp_a')}
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
                {t('still_questions')}
              </h2>
              <p className="text-lg mb-8">
                {t('still_questions_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-brand-yellow text-black font-bold px-8 py-4 rounded-full hover:bg-white transition-colors"
                >
                  {t('contact_us')}
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border-2 border-brand-yellow text-brand-yellow font-bold px-8 py-4 rounded-full hover:bg-brand-yellow hover:text-black transition-colors"
                >
                  {t('back_home')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
