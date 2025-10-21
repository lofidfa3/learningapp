import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - LinguaNews',
  description: 'Privacy Policy for LinguaNews language learning platform',
};

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-6 neon-text text-primary">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: October 13, 2025</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">1. Introduction</h2>
            <p className="mb-4 leading-relaxed">
              LinguaNews ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our language 
              learning service.
            </p>
            <p className="mb-4 leading-relaxed">
              By using LinguaNews, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">2. Information We Collect</h2>
            
            <h3 className="text-xl font-bold mb-3 text-secondary">2.1 Personal Information</h3>
            <p className="mb-4 leading-relaxed">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li><strong>Email address:</strong> For account creation and communication</li>
              <li><strong>Display name:</strong> For personalization</li>
              <li><strong>Password:</strong> Stored securely using Firebase Authentication</li>
              <li><strong>OAuth tokens:</strong> If you sign in with Google or Spotify</li>
            </ul>

            <h3 className="text-xl font-bold mb-3 text-secondary">2.2 Usage Information</h3>
            <p className="mb-4 leading-relaxed">
              We automatically collect certain information when you use the Service:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li>Learning progress and vocabulary data</li>
              <li>Flashcard review history and statistics</li>
              <li>Articles read and translations requested</li>
              <li>Language preferences and settings</li>
              <li>Device information and browser type</li>
              <li>IP address and approximate location</li>
            </ul>

            <h3 className="text-xl font-bold mb-3 text-secondary">2.3 Payment Information</h3>
            <p className="mb-4 leading-relaxed">
              Payment information is processed by <strong>Stripe</strong>, our third-party payment processor. 
              We do not store your credit card information. Stripe collects:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li>Credit card details</li>
              <li>Billing address</li>
              <li>Payment history</li>
            </ul>

            <h3 className="text-xl font-bold mb-3 text-secondary">2.4 Spotify Integration</h3>
            <p className="mb-4 leading-relaxed">
              If you connect your Spotify account, we access:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Currently playing track information</li>
              <li>Your Spotify username and profile</li>
              <li>Playback state (for lyrics feature)</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              <strong>Note:</strong> We do NOT access your playlists, library, or listening history beyond 
              the currently playing track.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">3. How We Use Your Information</h2>
            <p className="mb-4 leading-relaxed">
              We use the collected information for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Delivery:</strong> Providing translations, flashcards, and learning features</li>
              <li><strong>Account Management:</strong> Creating and maintaining your account</li>
              <li><strong>Progress Tracking:</strong> Storing your learning progress and statistics</li>
              <li><strong>Payment Processing:</strong> Managing subscriptions and billing</li>
              <li><strong>Communication:</strong> Sending service updates and support responses</li>
              <li><strong>Improvements:</strong> Analyzing usage to improve the Service</li>
              <li><strong>Security:</strong> Detecting and preventing fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">4. Third-Party Services</h2>
            <p className="mb-4 leading-relaxed">
              We use the following third-party services that may collect information:
            </p>

            <div className="space-y-4 ml-4">
              <div>
                <h3 className="text-lg font-bold mb-2 text-secondary">Firebase (Google)</h3>
                <p className="leading-relaxed">
                  Used for authentication, database, and hosting. 
                  <br />
                  Privacy Policy: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">firebase.google.com/support/privacy</a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 text-secondary">Stripe</h3>
                <p className="leading-relaxed">
                  Used for payment processing and subscription management.
                  <br />
                  Privacy Policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/privacy</a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 text-secondary">Spotify</h3>
                <p className="leading-relaxed">
                  Used for music integration and lyrics features (optional).
                  <br />
                  Privacy Policy: <a href="https://www.spotify.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">spotify.com/privacy</a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 text-secondary">News APIs</h3>
                <p className="leading-relaxed">
                  We fetch news articles from The Guardian and GNews. Their privacy policies apply to the content they provide.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 text-secondary">Translation APIs</h3>
                <p className="leading-relaxed">
                  We use MyMemory and LibreTranslate for translations. Text you translate may be processed by these services.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">5. Data Storage and Security</h2>
            <p className="mb-4 leading-relaxed">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Encryption:</strong> All data transmitted is encrypted using SSL/TLS</li>
              <li><strong>Firebase Security:</strong> Data stored in Firebase Firestore with security rules</li>
              <li><strong>Password Security:</strong> Passwords are hashed and never stored in plain text</li>
              <li><strong>Access Control:</strong> Limited access to personal data</li>
              <li><strong>Regular Updates:</strong> Security patches and updates applied regularly</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">6. Data Retention</h2>
            <p className="mb-4 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Data:</strong> Retained until you delete your account</li>
              <li><strong>Learning Progress:</strong> Stored indefinitely unless you delete it</li>
              <li><strong>Payment Records:</strong> Retained for legal and accounting purposes (7 years)</li>
              <li><strong>Deleted Accounts:</strong> Data is permanently deleted within 30 days of account deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">7. Your Rights (GDPR)</h2>
            <p className="mb-4 leading-relaxed">
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
              <li><strong>Restriction:</strong> Request restriction of data processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              To exercise these rights, contact us at: <strong>privacy@linguanews.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">8. Cookies and Tracking</h2>
            <p className="mb-4 leading-relaxed">
              We use the following types of cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Preference Cookies:</strong> Store your language and theme preferences</li>
              <li><strong>Firebase Cookies:</strong> Used for authentication and session management</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              You can disable cookies in your browser settings, but this may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">9. Children's Privacy</h2>
            <p className="mb-4 leading-relaxed">
              Our Service is not directed to children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe your 
              child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">10. International Data Transfers</h2>
            <p className="mb-4 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with this 
              Privacy Policy and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">11. Changes to Privacy Policy</h2>
            <p className="mb-4 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary uppercase">12. Contact Us</h2>
            <p className="mb-4 leading-relaxed">
              If you have questions about this Privacy Policy or want to exercise your rights, contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> privacy@linguanews.com</li>
              <li><strong>Data Protection Officer:</strong> dpo@linguanews.com</li>
              <li><strong>Website:</strong> {typeof window !== 'undefined' ? window.location.origin : 'https://linguanews.com'}</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-primary">
          <p className="text-sm text-muted-foreground text-center">
            This Privacy Policy is effective as of October 13, 2025. By continuing to use LinguaNews after 
            this date, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

