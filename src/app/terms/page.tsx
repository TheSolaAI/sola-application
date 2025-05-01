'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import BackgroundPattern from '@/app/_components/onboarding/BackgroundPatterns';
import Footer from '@/app/_components/onboarding/Footer';

export default function TermsPage() {
  const router = useRouter();

  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative isolate bg-gradient-to-b from-gray-950 to-black min-h-screen w-full overflow-x-hidden">
      <BackgroundPattern />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-gray-950/75 border-b border-white/10">
        <nav
          className="mx-auto flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-gray-900/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
        >
          <h1 className="text-3xl font-bold text-white mb-8">
            Terms and Conditions
          </h1>

          <div className="space-y-6 text-gray-300">
            <div className="text-xl mb-6">Welcome to SOLA AI</div>

            <p className="mb-6">
              By accessing or using our app (the "Service") during this beta
              phase, you agree to comply with and be bound by these Terms and
              Conditions ("Terms"). Please read them carefully.
            </p>

            <div className="space-y-6">
              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  You acknowledge that the App is in development and is being
                  provided "AS IS" without warranty of any kind, including
                  without limitation, any warranty as to performance,
                  non-infringement of third-party rights, merchantability, or
                  fitness for a particular purpose. The primary purpose of this
                  beta testing is to obtain feedback on software performance and
                  identify defects.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  As a beta tester, you agree to provide feedback, comments, and
                  suggestions regarding the App's functionality, usability, and
                  performance. This feedback will be used to improve the App and
                  may be incorporated into future versions. You hereby assign to
                  us all rights, title, and interest to such feedback, including
                  any enhancements developed as a result of your ideas.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  You are advised to exercise caution when using the App,
                  particularly when initiating financial transactions through
                  voice commands. Do not rely on the correct functioning or
                  performance of the beta App, and safeguard important financial
                  and personal data accordingly.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  By participating in this beta test, you explicitly consent to
                  the use of your actual funds for testing the App's financial
                  features. You acknowledge the potential risks involved in
                  conducting real financial transactions through beta software.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  The App may display financial insights, recommendations, or
                  data obtained from third-party sources. While we strive to
                  ensure the accuracy of this information, we cannot guarantee
                  its completeness, timeliness, or reliability. You should
                  verify any critical financial information through official
                  channels before making financial decisions.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  You agree to promptly report any issues, bugs, or unexpected
                  behavior encountered while using the App, especially those
                  related to financial transactions. Reports should be submitted
                  through the designated feedback channels provided in the App.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  You acknowledge that any feedback, suggestions, ideas, or
                  recommendations you provide regarding the App or its features
                  will become our property. You assign all intellectual property
                  rights in such feedback to us, and we may use this feedback
                  for any purpose without compensation to you.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  You are responsible for maintaining the confidentiality of
                  your account credentials and ensuring that unauthorized
                  individuals do not have access to your device when the App is
                  active. You should implement additional security measures,
                  including device passcodes and biometric authentication, to
                  prevent unauthorized voice transactions.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  To the maximum extent permitted by applicable law, we shall
                  not be liable for any direct, indirect, incidental, special,
                  consequential, or exemplary damages resulting from your use of
                  the App during the beta phase. This includes, but is not
                  limited to, damages for loss of profits, goodwill, data, or
                  other intangible losses.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500">
                <p className="mb-2">
                  We reserve the right to modify these Terms and Conditions at
                  any time. We will provide notice of significant changes
                  through the App or via email. Your continued use of the App
                  after such modifications constitutes your acceptance of the
                  updated terms.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
