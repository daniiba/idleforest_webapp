"use client";

import Navigation from "@/components/navigation";
import { FileText, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-brand-gray text-black pt-32 lg:pt-24">
        {/* Hero Section */}
        <section className="relative bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-brand-navy text-brand-yellow px-4 py-2 rounded-md mb-6">
                <FileText className="h-5 w-5" />
                <span className="font-bold text-sm uppercase">Legal Agreement</span>
              </div>
              <h1 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold mb-6">
                Terms of Service
              </h1>
              <p className="text-lg md:text-xl text-neutral-800 max-w-3xl mx-auto">
                Last Updated: November 19, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="relative bg-white py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-neutral-800 leading-relaxed mb-6">
                  Welcome to IdleForest. These Terms of Service ("Terms") govern your use of the IdleForest browser extension, desktop application, and website (collectively, the "Service"). By using our Service, you agree to these Terms. Please read them carefully.
                </p>
                <p className="text-neutral-800 leading-relaxed">
                  IdleForest is operated by Idleforest Unipessoal, LDA ("we," "us," or "our"). If you have any questions about these Terms, please contact us at <a href="mailto:support@idleforest.com" className="text-brand-navy hover:underline font-bold">support@idleforest.com</a>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Terms Sections */}
        <section className="relative bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* 1. Acceptance of Terms */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    By installing, accessing, or using the IdleForest Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Service.
                  </p>
                  <p>
                    You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you meet this age requirement.
                  </p>
                </div>
              </Card>

              {/* 2. Description of Service */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  2. Description of Service
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    IdleForest allows you to share your unused internet bandwidth in exchange for contributions to tree-planting initiatives. When you use our Service:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                      <span>Your idle bandwidth is used by our vetted partner, Olostep, to access publicly available web content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                      <span>Revenue generated from this bandwidth sharing is used to plant trees through verified organizations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                      <span>You can monitor your contribution and control bandwidth usage through our dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                      <span>All requests are sessionless and do not transmit your personal data, cookies, or login credentials</span>
                    </li>
                  </ul>
                </div>
              </Card>

              {/* 3. User Responsibilities */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  3. User Responsibilities
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p className="font-bold">You agree to:</p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Provide accurate information when creating an account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Maintain the security of your account credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Use the Service in compliance with all applicable laws and regulations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Not attempt to reverse engineer, modify, or interfere with the Service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Not use the Service for any illegal or unauthorized purpose</span>
                    </li>
                  </ul>
                  <p className="font-bold mt-6">You acknowledge that:</p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>You are responsible for your internet connection and any associated costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Bandwidth sharing may affect your internet speed and data usage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>You should review your internet service provider's terms regarding bandwidth sharing</span>
                    </li>
                  </ul>
                </div>
              </Card>

              {/* 4. Liability and Indemnification */}
              <Card className="bg-brand-yellow border-2 border-black p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Shield className="h-8 w-8 text-brand-navy flex-shrink-0" />
                  <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold">
                    4. Liability and Indemnification
                  </h2>
                </div>
                <div className="space-y-4 text-neutral-800">
                  <div className="bg-white border-2 border-brand-navy p-6">
                    <h3 className="font-bold text-lg mb-3 text-black">Our Commitment to You:</h3>
                    <p className="mb-3">
                      <strong className="text-black">IdleForest assumes full legal responsibility</strong> for all traffic generated through our network. This means:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span>You are NOT liable for the content or nature of requests made through your connection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span>IdleForest will indemnify and hold you harmless from any legal claims arising from network usage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span>We maintain comprehensive liability insurance to cover potential legal issues</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span>We will defend you against any third-party claims related to bandwidth usage through our Service</span>
                      </li>
                    </ul>
                  </div>
                  <p>
                    In the event of any legal inquiry or claim related to traffic passing through your connection via IdleForest, we will take full responsibility and provide legal support at no cost to you.
                  </p>
                </div>
              </Card>

              {/* 5. Privacy and Data Protection */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  5. Privacy and Data Protection
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    Your privacy is important to us. Our use of your data is governed by our Privacy Policy. Key points include:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We do NOT collect, store, or transmit your personal browsing data, cookies, or login credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>All web requests through our network are sessionless and isolated from your personal browsing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We collect minimal account information (email, username) necessary to operate the Service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We comply with GDPR and other applicable data protection regulations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>You can request deletion of your account and data at any time</span>
                    </li>
                  </ul>
                </div>
              </Card>

              {/* 6. Acceptable Use Policy */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  6. Acceptable Use Policy
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    We maintain strict standards for how bandwidth is used through our network. Our partner, Olostep, is contractually prohibited from:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>Accessing password-protected or private content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>Performing illegal activities or accessing restricted websites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>Sending spam, conducting DDoS attacks, or engaging in malicious behavior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>Accessing or transmitting personal data, cookies, or login credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>Violating website terms of service or engaging in unauthorized scraping</span>
                    </li>
                  </ul>
                  <p className="mt-4">
                    We actively monitor network traffic to ensure compliance. Any violation results in immediate termination of the client relationship.
                  </p>
                </div>
              </Card>

              {/* 7. Tree Planting Commitments */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  7. Tree Planting Commitments
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    We commit to using revenue generated from bandwidth sharing to fund tree-planting initiatives. Specifically:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We partner with verified organizations including Tree-Nation, Trees for the Future, and Planting on Demand</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We maintain full transparency about donations and tree-planting activities on our website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>You can track your personal contribution to tree planting through your dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We publish regular reports documenting our environmental impact</span>
                    </li>
                  </ul>
                  <p className="mt-4">
                    While we make every effort to ensure accurate tracking, the exact number of trees attributed to individual users is an estimate based on bandwidth contribution and revenue allocation.
                  </p>
                </div>
              </Card>

              {/* 8. Service Availability */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  8. Service Availability
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    We strive to provide reliable service, but we cannot guarantee uninterrupted access. The Service is provided "as is" and "as available."
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We may modify, suspend, or discontinue the Service at any time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We may perform maintenance that temporarily interrupts service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We are not liable for any interruption, delay, or failure of the Service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>You can pause or stop bandwidth sharing at any time through the Service settings</span>
                    </li>
                  </ul>
                </div>
              </Card>

              {/* 9. Account Termination */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  9. Account Termination
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p className="font-bold">You may terminate your account at any time by:</p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Uninstalling the browser extension or desktop application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Deleting your account through the dashboard settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Contacting us at support@idleforest.com to request account deletion</span>
                    </li>
                  </ul>
                  <p className="font-bold mt-6">We may terminate or suspend your account if:</p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>You violate these Terms of Service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>You engage in fraudulent or abusive behavior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We are required to do so by law</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>We discontinue the Service entirely</span>
                    </li>
                  </ul>
                  <p className="mt-4">
                    Upon termination, your right to use the Service will immediately cease. We will delete your account data in accordance with our Privacy Policy.
                  </p>
                </div>
              </Card>

              {/* 10. Intellectual Property */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  10. Intellectual Property
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    The Service, including all content, features, and functionality, is owned by IdleForest and is protected by copyright, trademark, and other intellectual property laws.
                  </p>
                  <p>
                    Our browser extension and desktop application are open source and available under the MIT License. You may view, modify, and distribute the code in accordance with that license.
                  </p>
                  <p>
                    The IdleForest name, logo, and branding are trademarks of Idleforest Unipessoal, LDA. You may not use our trademarks without prior written permission.
                  </p>
                </div>
              </Card>

              {/* 11. Disclaimers and Limitations of Liability */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  11. Disclaimers and Limitations of Liability
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <div className="bg-brand-gray border-2 border-neutral-300 p-6">
                    <p className="font-bold mb-3">Important Legal Notice:</p>
                    <p className="mb-3">
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>
                    <p>
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, IDLEFOREST SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                    </p>
                  </div>
                  <p className="mt-4">
                    However, this limitation does not apply to our indemnification obligations regarding traffic generated through our network, as described in Section 4.
                  </p>
                  <p>
                    Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for incidental or consequential damages. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.
                  </p>
                </div>
              </Card>

              {/* 12. Dispute Resolution */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  12. Dispute Resolution
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    If you have any concerns or disputes about the Service, please contact us first at support@idleforest.com. We will make every effort to resolve the issue informally.
                  </p>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of Portugal, without regard to its conflict of law provisions.
                  </p>
                  <p>
                    Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in Lisbon, Portugal, and you consent to personal jurisdiction in such courts.
                  </p>
                </div>
              </Card>

              {/* 13. Changes to Terms */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  13. Changes to These Terms
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    We may update these Terms from time to time. When we do, we will:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Update the "Last Updated" date at the top of this page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Notify you via email if the changes are material</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>Provide a notice within the Service</span>
                    </li>
                  </ul>
                  <p className="mt-4">
                    Your continued use of the Service after any changes indicates your acceptance of the new Terms. If you do not agree to the updated Terms, you must stop using the Service.
                  </p>
                </div>
              </Card>

              {/* 14. Miscellaneous */}
              <Card className="bg-white border-2 border-black p-8">
                <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-4">
                  14. Miscellaneous
                </h2>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and IdleForest regarding the Service.
                  </p>
                  <p>
                    <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
                  </p>
                  <p>
                    <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                  </p>
                  <p>
                    <strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written consent. We may assign our rights and obligations without restriction.
                  </p>
                  <p>
                    <strong>Force Majeure:</strong> We shall not be liable for any failure to perform our obligations due to circumstances beyond our reasonable control.
                  </p>
                </div>
              </Card>

              {/* Contact Information */}
              <Card className="bg-brand-yellow border-2 border-black p-8">
                <div className="flex items-start gap-4 mb-4">
                  <AlertCircle className="h-8 w-8 text-brand-navy flex-shrink-0" />
                  <h2 className="font-rethink-sans text-2xl md:text-3xl font-extrabold">
                    Contact Us
                  </h2>
                </div>
                <div className="space-y-4 text-neutral-800">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-white border-2 border-brand-navy p-6">
                    <p className="mb-2">
                      <strong className="text-black">Email:</strong> <a href="mailto:support@idleforest.com" className="text-brand-navy hover:underline">support@idleforest.com</a>
                    </p>
                    <p className="mb-2">
                      <strong className="text-black">Website:</strong> <a href="https://idleforest.com" className="text-brand-navy hover:underline">idleforest.com</a>
                    </p>
                    <p>
                      <strong className="text-black">Company:</strong> Idleforest Unipessoal, LDA<br />
                      Lisbon, Portugal
                    </p>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        </section>
      </main>
    </>
  );
}
