'use client'

import { useState, useEffect, useRef } from 'react'
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'collection', label: 'Information Collection' },
  { id: 'use', label: 'Use of Information' },
  { id: 'protection', label: 'Data Protection' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'terms', label: 'Terms of Use' },
  { id: 'user-content', label: 'User Content' },
  { id: 'prohibited', label: 'Prohibited Conduct' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'disclaimers', label: 'Disclaimers' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'third-party', label: 'Third-Party Links' },
  { id: 'changes', label: 'Changes to Policy' },
  { id: 'contact', label: 'Contact Us' },
]

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('introduction')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    const headings = contentRef.current?.querySelectorAll('section[id]') || []
    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-green-200 mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif">Privacy Policy &amp; Terms of Use</h1>
          <p className="mt-3 text-green-100 text-sm">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
          {/* Sticky nav — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">On this page</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === s.id
                        ? 'bg-green-50 text-[#1B5E20] font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {activeSection === s.id && <ChevronRight className="w-3 h-3 shrink-0" />}
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div ref={contentRef} className="prose prose-gray max-w-none space-y-12">
            <section id="introduction">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to the Entrepreneurship and Social Research Centre (ESRC) Cameroon Learning Platform. This Privacy Policy and Terms of Use document governs your access to and use of our website, online courses, research resources, and related services. By using our platform, you agree to the terms outlined herein. We are committed to protecting your privacy and ensuring a safe, productive learning environment for all users.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                ESRC Cameroon is a research and capacity building institution headquartered in Cameroon, dedicated to fostering entrepreneurship education, social research, and sustainable development across Africa. Our platform serves learners, researchers, instructors, and partners across the continent and beyond.
              </p>
            </section>

            <section id="collection">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Privacy Policy — Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed">When you register or use our platform, we may collect the following types of information:</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Personal Identification:</strong> Full name, email address, phone number, country, city, and profile photo.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Account Credentials:</strong> Hashed passwords and authentication tokens. We never store plain-text passwords.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Learning Activity:</strong> Course enrollments, lesson completions, quiz results, assignment submissions, and certificates earned.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Payment Information:</strong> Transaction references from mobile money providers (MTN MoMo, Orange Money) and card processors. We do not store full card numbers.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Communications:</strong> Messages sent through our platform, forum posts, course reviews, and support requests.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Technical Data:</strong> IP addresses, browser type, device type, and usage logs collected automatically via cookies and similar technologies.</span></li>
              </ul>
            </section>

            <section id="use">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Use of Information</h2>
              <p className="text-gray-700 leading-relaxed">ESRC Cameroon uses the information we collect for the following purposes:</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>To create and manage your user account and authenticate your identity.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>To deliver online courses, track learning progress, and issue certificates of completion.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>To process payments and verify transactions through supported payment providers.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>To communicate important platform updates, course announcements, and administrative notices.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>To personalize your learning experience and recommend relevant courses and resources.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>To analyze platform usage patterns and improve our services, content quality, and user experience.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>To comply with applicable laws, regulations, and legal obligations in Cameroon and applicable international frameworks.</span></li>
              </ul>
              <p className="text-gray-700 mt-4">We do <strong>not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.</p>
            </section>

            <section id="protection">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>Encryption of data in transit using TLS/HTTPS protocols.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>Secure hashing of passwords using industry-standard algorithms (bcrypt).</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>Access controls limiting data access to authorized personnel only.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>Regular security assessments and infrastructure monitoring.</span></li>
              </ul>
              <p className="text-gray-700 mt-4">
                While we strive to protect your personal data, no method of transmission over the Internet is 100% secure. You are responsible for maintaining the confidentiality of your account credentials and for any activities that occur under your account.
              </p>
              <p className="text-gray-700 mt-3">
                You have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, please contact us at <a href="mailto:info@esrccameroon.org" className="text-[#1B5E20] font-medium">info@esrccameroon.org</a>.
              </p>
            </section>

            <section id="cookies">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. Cookies are small text files stored on your device.
              </p>
              <p className="text-gray-700 mt-3">We use the following types of cookies:</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Essential Cookies:</strong> Required for the platform to function correctly (authentication sessions, security tokens).</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Preference Cookies:</strong> Remember your language preference (English/French) and display settings.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform to improve content and performance.</span></li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can control or disable cookies through your browser settings. However, disabling essential cookies may affect the functionality of the platform.
              </p>
            </section>

            <section id="terms">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Terms of Use</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the ESRC Cameroon Learning Platform, you agree to comply with these Terms of Use. These terms apply to all users, including learners, instructors, researchers, and administrators.
              </p>
              <p className="text-gray-700 mt-3">
                To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update your information as necessary to keep it accurate. You are responsible for maintaining the security of your account password and for all activities that occur under your account.
              </p>
              <p className="text-gray-700 mt-3">
                Enrollment in paid courses requires payment of the applicable fees through our supported payment methods. Fees are non-refundable unless otherwise stated in the specific course terms. ESRC Cameroon reserves the right to modify course fees with reasonable notice.
              </p>
            </section>

            <section id="user-content">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">User Content</h2>
              <p className="text-gray-700 leading-relaxed">
                Users may submit content to the platform including forum posts, course reviews, research submissions, and profile information (&quot;User Content&quot;). By submitting User Content, you grant ESRC Cameroon a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content in connection with the platform and our educational mission.
              </p>
              <p className="text-gray-700 mt-3">
                You represent and warrant that: (a) you own or have the right to submit the User Content; (b) the User Content does not infringe any third-party intellectual property rights; and (c) the User Content does not violate any applicable law or these Terms.
              </p>
              <p className="text-gray-700 mt-3">
                ESRC Cameroon reserves the right to remove any User Content that violates these Terms or that we deem inappropriate, without prior notice.
              </p>
            </section>

            <section id="prohibited">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Prohibited Conduct</h2>
              <p className="text-gray-700 leading-relaxed">You agree not to engage in any of the following activities:</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span><span>Sharing your account credentials with others or creating multiple accounts to circumvent access restrictions.</span></li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span><span>Downloading, copying, or distributing course materials without explicit written permission from ESRC Cameroon.</span></li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span><span>Submitting false, misleading, or fraudulent information in registrations, payments, or user profiles.</span></li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span><span>Posting hateful, discriminatory, abusive, or sexually explicit content in any platform communication.</span></li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span><span>Attempting to gain unauthorized access to any part of the platform, other user accounts, or our backend systems.</span></li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span><span>Using automated tools (bots, scrapers) to extract content or data from the platform without permission.</span></li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span><span>Engaging in any activity that disrupts or interferes with the normal operation of the platform.</span></li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span><span>Impersonating ESRC Cameroon staff, instructors, or other users.</span></li>
              </ul>
              <p className="text-gray-700 mt-4">
                Violation of these prohibitions may result in immediate account suspension or termination, without refund, and may be reported to relevant authorities where applicable law requires.
              </p>
            </section>

            <section id="ip">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on the ESRC Cameroon Learning Platform — including but not limited to course videos, lecture notes, research publications, assessments, graphics, logos, and software — is the intellectual property of ESRC Cameroon or its content contributors, and is protected by applicable copyright, trademark, and intellectual property laws.
              </p>
              <p className="text-gray-700 mt-3">
                Enrollment in a course grants you a limited, personal, non-transferable license to access and use the course materials for your own educational purposes only. You may not reproduce, distribute, display, perform, create derivative works from, or commercially exploit any platform content without our prior written consent.
              </p>
              <p className="text-gray-700 mt-3">
                The ESRC Cameroon name, logo, and associated marks are trademarks of the Entrepreneurship and Social Research Centre. Unauthorized use of these marks is strictly prohibited.
              </p>
            </section>

            <section id="disclaimers">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed">
                The ESRC Cameroon Learning Platform and all content thereon are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. ESRC Cameroon does not warrant that:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>The platform will be uninterrupted, error-free, or free of viruses or other harmful components.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>The results obtained from using the platform will be accurate or reliable.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>The quality of any courses, information, or other material accessed through the platform will meet your expectations.</span></li>
              </ul>
              <p className="text-gray-700 mt-4">
                Course content is intended for educational purposes only and should not be construed as professional legal, financial, medical, or business advice. Always seek qualified professional guidance for specific decisions.
              </p>
            </section>

            <section id="liability">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by applicable law, ESRC Cameroon and its officers, directors, employees, agents, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform, including but not limited to:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>Loss of data, profits, goodwill, or business opportunities.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>Errors or omissions in platform content.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>Unauthorized access to your account or personal data resulting from your failure to maintain account security.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E20] font-bold">•</span><span>Service interruptions or technical failures beyond our reasonable control.</span></li>
              </ul>
              <p className="text-gray-700 mt-4">
                In jurisdictions that do not allow the exclusion or limitation of certain damages, our liability shall be limited to the fullest extent permitted by law. Our total aggregate liability shall not exceed the amount paid by you to ESRC Cameroon in the twelve (12) months preceding the event giving rise to the claim.
              </p>
            </section>

            <section id="third-party">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                The ESRC Cameroon platform may contain links to third-party websites, resources, or services for informational and educational purposes. These links are provided as a convenience and do not constitute an endorsement or recommendation by ESRC Cameroon. We have no control over the content, privacy practices, or terms of third-party websites.
              </p>
              <p className="text-gray-700 mt-3">
                We encourage you to review the privacy policies and terms of any third-party websites you visit. ESRC Cameroon shall not be responsible or liable for any loss or damage arising from your use of or reliance on third-party content or services.
              </p>
            </section>

            <section id="changes">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                ESRC Cameroon reserves the right to modify this Privacy Policy and Terms of Use at any time. When we make material changes, we will notify registered users via email and by updating the &quot;Last updated&quot; date at the top of this page. We encourage you to review this policy periodically.
              </p>
              <p className="text-gray-700 mt-3">
                Your continued use of the platform following the posting of changes constitutes your acceptance of the revised terms. If you do not agree with the updated terms, you should discontinue use of the platform and may request account deletion by contacting us.
              </p>
              <p className="text-gray-700 mt-3">
                This policy is governed by the laws of Cameroon. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts of Cameroon.
              </p>
            </section>

            <section id="contact">
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6">Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions, concerns, or requests relating to this Privacy Policy or your personal data, please reach out to us through any of the following channels:
              </p>
              <div className="bg-[#1B5E20]/5 border border-[#1B5E20]/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#1B5E20] rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <a href="mailto:info@esrccameroon.org" className="text-[#1B5E20] hover:underline">info@esrccameroon.org</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#1B5E20] rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-700">+237 677 948 904 / 677 775 535</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#1B5E20] rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-700">Entrepreneurship and Social Research Centre</p>
                    <p className="text-gray-600 text-sm">UP-Station Bamenda</p>
                    <p className="text-gray-600 text-sm">Opposite Tradex Nomayous, Yaoundé, Cameroon</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-6">
                We aim to respond to all inquiries within 5 business days.{' '}
                <Link href="/contact" className="text-[#1B5E20] hover:underline">Visit our Contact page</Link> for additional options.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
