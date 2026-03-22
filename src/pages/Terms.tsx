import React from 'react';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, CreditCard, Mail } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last Updated: March 22, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of EcobServe's platform, services, and website (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Account Registration and Eligibility</h2>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                You must be at least 18 years old to use the Service. By using the Service, you represent that you meet this age requirement.
              </p>
            </div>
          </section>

          {/* Subscription Plans */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Subscription Plans and Billing</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Plans</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Explorer (Free):</strong> Basic carbon calculator with limited features</li>
                  <li><strong>Planner ($29/month):</strong> Full dashboard, recommendations, and API access</li>
                  <li><strong>Impact Leader ($99/month):</strong> Portfolio tracking, UN SDG alignment, custom reports</li>
                  <li><strong>Enterprise (Custom):</strong> White-label, dedicated support, custom integrations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing Terms</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Subscriptions are billed monthly or annually in advance</li>
                  <li>Payment is processed securely through Stripe</li>
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>You can cancel anytime from your account settings</li>
                  <li>No refunds for partial months or unused features</li>
                  <li>Price changes will be communicated 30 days in advance</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Trial</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may offer a free trial for paid plans. You will not be charged until the trial period ends. You can cancel anytime during the trial without being charged.
                </p>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">User Responsibilities and Prohibited Conduct</h2>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Scrape, crawl, or use automated tools without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Impersonate others or provide false information</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Service and its original content, features, and functionality are owned by EcobServe and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. The EcobServe name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of EcobServe.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of any content you submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your User Content solely to provide and improve the Service. You represent that you have all necessary rights to grant this license.
                </p>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Availability and Modifications</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We strive to provide reliable service but cannot guarantee:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Uninterrupted or error-free operation</li>
              <li>That defects will be corrected immediately</li>
              <li>That the Service is free from viruses or harmful components</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time with or without notice. We will not be liable for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
            </div>

            <p className="text-gray-700 leading-relaxed mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>EcobServe shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim</li>
              <li>We are not responsible for any loss of profits, revenue, data, or business opportunities</li>
              <li>These limitations apply even if we have been advised of the possibility of such damages</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above limitations may not apply to you.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Disclaimer of Warranties</h2>
            </div>

            <p className="text-gray-700 leading-relaxed mb-3">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Implied warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy, reliability, or completeness of carbon calculations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              While we use industry-standard emission factors (DEFRA, EPA), carbon calculations are estimates and should not be considered exact measurements. We recommend consulting with certified sustainability professionals for critical decisions.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless EcobServe, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your access to or use of the Service, your User Content, or your violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong>By You:</strong> You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>By Us:</strong> We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our sole discretion. We will provide notice when reasonably possible.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Effect of Termination:</strong> Upon termination, your right to use the Service will immediately cease. You may request a copy of your data within 30 days of termination. After 30 days, we may delete your data in accordance with our Privacy Policy.
              </p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution and Governing Law</h2>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Arbitration:</strong> Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules, except that either party may seek injunctive relief in court for intellectual property disputes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Class Action Waiver:</strong> You agree to resolve disputes on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.
              </p>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Policy</h2>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong>General Policy:</strong> All subscription fees are non-refundable except as required by law or as explicitly stated below.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Exceptions:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>If you cancel within 7 days of your first paid subscription, you may request a full refund</li>
                <li>If we make a billing error, we will correct it and refund any overcharges</li>
                <li>If we discontinue the Service, we will provide a pro-rated refund for unused time</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                To request a refund, contact <a href="mailto:billing@ecobserve.com" className="text-blue-600 hover:text-blue-700 font-medium">billing@ecobserve.com</a> with your account details and reason for the request.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to These Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through a prominent notice on the Service at least 30 days before the changes take effect. Your continued use of the Service after the changes take effect constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Miscellaneous */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Miscellaneous</h2>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and EcobServe regarding the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:legal@ecobserve.com" className="text-blue-600 hover:text-blue-700">legal@ecobserve.com</a></p>
              <p><strong>General Inquiries:</strong> <a href="mailto:info@ecobserve.com" className="text-blue-600 hover:text-blue-700">info@ecobserve.com</a></p>
              <p><strong>Billing:</strong> <a href="mailto:billing@ecobserve.com" className="text-blue-600 hover:text-blue-700">billing@ecobserve.com</a></p>
              <p><strong>Address:</strong> 123 Green Street, San Francisco, CA 94102</p>
              <p><strong>Phone:</strong> <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-700">+1 (555) 123-4567</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
