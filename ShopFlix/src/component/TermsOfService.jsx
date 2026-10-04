import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Shopflix Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: June 12, 2025</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">1. Eligibility</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>You must be at least 18 years old or the age of majority in your jurisdiction.</li>
            <li>By using the Services, you represent and warrant you meet these requirements.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">2. Account Registration</h2>
          <p className="text-gray-700">
            To access certain features, you must register for an account with accurate, current, and complete information. You
            are responsible for maintaining the confidentiality of your credentials and for all activities under your account.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">3. User Conduct</h2>
          <p className="text-gray-700">You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Violate any applicable laws or regulations.</li>
            <li>Infringe intellectual property rights of others.</li>
            <li>Post or transmit harmful, deceptive, or objectionable content.</li>
            <li>Attempt to interfere with the operation or security of the Services.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">4. Purchases and Payment</h2>
          <p className="text-gray-700">
            All purchases are subject to availability and confirmation of price. Payment terms are specified at checkout. Refunds,
            returns, and cancellations are governed by our separate Return &amp; Refund Policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">5. Content and Intellectual Property</h2>
          <p className="text-gray-700">
            All content is owned or licensed by Shopflix and protected by law. You may not reproduce or distribute without
            prior written consent. User-generated content remains yours, but you grant Shopflix a license to use it.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">6. Privacy</h2>
          <p className="text-gray-700">
            Our <a href="/privacy" className="text-indigo-600 underline">Privacy Policy</a> explains how we collect and use your
            information. By using the Services, you consent to that collection.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">7. Third-Party Links</h2>
          <p className="text-gray-700">
            The Services may contain links to third-party sites. We are not responsible for their content or practices.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">8. Disclaimers &amp; Limitation of Liability</h2>
          <p className="text-gray-700">
            The Services are provided "AS IS". We disclaim all warranties. Our liability is limited to the lesser of the amount
            you paid in the last 12 months or $100.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">9. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify Shopflix for claims arising out of your use of the Services or violation of these Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">10. Changes to Terms</h2>
          <p className="text-gray-700">
            We may modify these Terms at any time. Continued use constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">11. Governing Law &amp; Dispute Resolution</h2>
          <p className="text-gray-700">
            Governed by the laws of India. Disputes resolved via arbitration in New Delhi under the Indian Arbitration Act.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">12. Contact Us</h2>
          <p className="text-gray-700">
            Email: <a href="mailto:support@shopflix.com" className="text-indigo-600 underline">support@shopflix.com</a><br />
            Address: Shopflix Inc., 123 Commerce Street, Bengaluru, India
          </p>
        </section>

        <p className="text-xs text-gray-500 mt-8">© 2025 Shopflix Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
