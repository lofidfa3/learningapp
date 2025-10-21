import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - LinguaNews',
  description: 'Terms of Service for LinguaNews language learning platform',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 text-sm font-bold uppercase"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="border-4 border-primary p-8 retro-card bg-card">
        <h1 className="text-4xl font-bold mb-6 neon-text text-primary">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: October 13, 2025</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">1. Acceptance of Terms</h2>
            <p className="mb-4 leading-relaxed">
              By accessing and using LinguaNews ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these Terms of Service, please do not use 
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">2. Description of Service</h2>
            <p className="mb-4 leading-relaxed">
              LinguaNews is a language learning platform that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access to live news articles in multiple languages</li>
              <li>AI-powered translation services (Premium)</li>
              <li>Vocabulary extraction and flashcard systems (Premium)</li>
              <li>Spotify lyrics integration for language learning (Premium)</li>
              <li>Progress tracking and learning analytics (Premium)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">3. User Accounts</h2>
            <p className="mb-4 leading-relaxed">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">4. Premium Subscription</h2>
            <p className="mb-4 leading-relaxed">
              Premium features are available through a paid subscription:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Price:</strong> €1.00 per month</li>
              <li><strong>Billing:</strong> Automatically charged monthly</li>
              <li><strong>Cancellation:</strong> Can be cancelled anytime from your profile</li>
              <li><strong>Refunds:</strong> Refunds are handled on a case-by-case basis</li>
              <li><strong>Payment Processing:</strong> All payments are processed securely through Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">5. User Conduct</h2>
            <p className="mb-4 leading-relaxed">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Service for any illegal purposes</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">6. Intellectual Property</h2>
            <p className="mb-4 leading-relaxed">
              All content, features, and functionality of the Service are owned by LinguaNews and are 
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mb-4 leading-relaxed">
              News articles are provided by third-party sources and remain the property of their respective 
              owners. Translations and learning materials generated through the Service are for personal use only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">7. Third-Party Services</h2>
            <p className="mb-4 leading-relaxed">
              Our Service integrates with third-party services including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Spotify:</strong> For music and lyrics integration</li>
              <li><strong>The Guardian & GNews:</strong> For news content</li>
              <li><strong>Translation APIs:</strong> For language translation</li>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>Firebase:</strong> For authentication and data storage</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Use of these services is subject to their respective terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">8. Disclaimer of Warranties</h2>
            <p className="mb-4 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="mb-4 leading-relaxed">
              We do not guarantee the accuracy of translations, news content, or any learning materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">9. Limitation of Liability</h2>
            <p className="mb-4 leading-relaxed">
              IN NO EVENT SHALL LINGUANEWS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">10. Changes to Terms</h2>
            <p className="mb-4 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of 
              any material changes via email or through the Service. Continued use of the Service after 
              changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">11. Termination</h2>
            <p className="mb-4 leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior 
              notice or liability, for any reason, including breach of these Terms.
            </p>
            <p className="mb-4 leading-relaxed">
              You may cancel your account at any time from your profile settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">12. Governing Law</h2>
            <p className="mb-4 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the European Union, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">13. Contact Us</h2>
            <p className="mb-4 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> support@linguanews.com</li>
              <li><strong>Website:</strong> {typeof window !== 'undefined' ? window.location.origin : 'https://linguanews.com'}</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-primary">
          <p className="text-sm text-muted-foreground text-center">
            By using LinguaNews, you acknowledge that you have read and understood these Terms of Service 
            and agree to be bound by them.
          </p>
        </div>
      </div>
    </div>
  );
}

