'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <PageHero title="Terms of Service" subtitle="Last updated: March 2026" imageKey="about" />

      <main className="flex-grow section-padding">
        <div className="container-width max-w-3xl mx-auto prose dark:prose-invert prose-headings:font-display prose-headings:text-esrc-green-900 dark:prose-headings:text-esrc-green-300 prose-a:text-esrc-green-700">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using NextGen (operated by ESRC Cameroon), you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.
          </p>

          <h2>2. Use of the Platform</h2>
          <p>You agree to use NextGen only for lawful purposes. You must not:</p>
          <ul>
            <li>Share your account credentials with others.</li>
            <li>Redistribute, resell, or copy course content without written permission.</li>
            <li>Post harmful, offensive, or misleading content in community spaces.</li>
            <li>Attempt to reverse-engineer or interfere with the platform.</li>
          </ul>

          <h2>3. Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account password and for all activity under your account. Notify us immediately at{' '}
            <a href="mailto:info@esrccameroon.org">info@esrccameroon.org</a> if you suspect unauthorised access.
          </p>

          <h2>4. Payments & Refunds</h2>
          <p>
            Paid courses are charged at the listed price in XAF at the time of purchase. Refunds are available within 7 days of purchase if less than 20% of the course has been completed. Contact{' '}
            <a href="mailto:info@esrccameroon.org">info@esrccameroon.org</a> to request a refund.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All course content, platform code, logos, and materials are owned by ESRC Cameroon or licensed to us. You are granted a limited, non-transferable licence to access content for personal learning only. You retain ownership of any content you submit to the platform (community posts, forum replies), but grant us a licence to display it.
          </p>

          <h2>6. Certificates</h2>
          <p>
            Certificates issued by NextGen are digital credentials confirming course completion. They do not confer academic degrees or professional licences unless otherwise stated.
          </p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            The platform is provided "as is". We do not guarantee uninterrupted access or that content is error-free. We are not liable for any indirect, incidental, or consequential damages arising from use of the platform.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by Cameroonian law, ESRC Cameroon's total liability to you shall not exceed the amount you paid for the course or service giving rise to the claim.
          </p>

          <h2>9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your profile settings.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of Cameroon. Any disputes shall be subject to the jurisdiction of the courts of Yaoundé, Cameroon.
          </p>

          <h2>11. Changes to These Terms</h2>
          <p>
            We may update these Terms periodically. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify registered users of material changes via email.
          </p>

          <h2>12. Contact</h2>
          <p>
            Questions about these Terms? Email us at{' '}
            <a href="mailto:info@esrccameroon.org">info@esrccameroon.org</a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
