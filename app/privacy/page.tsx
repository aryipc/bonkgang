
import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <Header />
        <main className="w-full mt-8 bg-zinc-900 border-2 border-amber-400 rounded-lg p-6 md:p-8 text-gray-300">
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-6 text-center">Privacy Policy</h2>

          <div className="space-y-4 text-sm sm:text-base leading-relaxed">
            <p>Your privacy is important to us. It is the policy of LetsBonkGang Official Register to respect your privacy regarding any information we may collect from you across our website.</p>

            <h3 className="text-xl text-amber-300 pt-4">1. Information We Collect</h3>
            <p><strong>Image Data:</strong> The primary data we collect is the image you upload. This image is sent to our server and to a third-party AI service (Google Gemini) for the sole purpose of analyzing its content and generating a new piece of artwork.</p>
            <p><strong>Usage Data:</strong> We may collect anonymous data about your interactions with our service, such as which "gang" style is selected. This is used to generate the public "Member Stats" on the homepage. This data is aggregated and does not personally identify you.</p>

            <h3 className="text-xl text-amber-300 pt-4">2. How We Use Information</h3>
            <p>The image you provide is used exclusively to create a descriptive prompt for our AI model. The model then uses this prompt to generate a new image. The uploaded image and the generated descriptive prompt are not stored on our servers long-term and are discarded after the generation process is complete or fails.</p>

            <h3 className="text-xl text-amber-300 pt-4">3. Data Storage and Security</h3>
            <p>We do not create user accounts, and we do not store your original uploaded images on our servers. The generated images may be temporarily cached for performance but are not permanently stored in association with any personal data. We take reasonable measures to protect the data during transit and processing.</p>

            <h3 className="text-xl text-amber-300 pt-4">4. Third-Party Services</h3>
            <p>We use Google's Gemini API to perform image analysis and generation. Your uploaded image is processed by Google's services in accordance with their privacy policy. We do not have control over their data handling practices.</p>

            <h3 className="text-xl text-amber-300 pt-4">5. Cookies</h3>
            <p>We do not use cookies for tracking purposes on the LetsBonkGang Official Register website.</p>

            <h3 className="text-xl text-amber-300 pt-4">6. Your Rights</h3>
            <p>Since we do not store personal data or link uploads to specific users, the ability to request data deletion is not applicable. Once you close your session, your connection to the uploaded content is lost.</p>
            
            <h3 className="text-xl text-amber-300 pt-4">7. Changes to This Policy</h3>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/" className="px-6 py-2 bg-amber-400 text-black font-bold rounded-md transition-all duration-200 ease-in-out border-2 border-black shadow-[3px_3px_0px_#000] enabled:hover:bg-amber-500 enabled:active:translate-y-1 enabled:active:translate-x-1 enabled:active:shadow-none">
              Back to Home
            </Link>
          </div>
        </main>
        <footer className="mt-12 text-center text-xs text-gray-400">
            <p>Powered by LetsBonkGang Official Team &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
}
