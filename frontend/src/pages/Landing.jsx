import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Globe, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Pay with crypto, receive INR instantly. No waiting, no delays.',
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Built on Stellar blockchain. Your transactions are safe and transparent.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Accept payments from anywhere in the world. No borders, no limits.',
    },
    {
      icon: CheckCircle,
      title: 'Easy Integration',
      description: 'Simple QR code system. Works just like UPI, but with crypto.',
    },
  ];

  const steps = [
    { number: '1', title: 'Connect Wallet', description: 'Link your Stellar wallet (Freighter)' },
    { number: '2', title: 'Scan QR Code', description: 'Merchant generates a payment QR' },
    { number: '3', title: 'Confirm Payment', description: 'Review amount and approve' },
    { number: '4', title: 'Done!', description: 'Merchant receives INR instantly' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl md:text-7xl font-bold mb-6 text-gray-900 tracking-tight"
            >
              Pay with Crypto.
              <br />
              <span className="gradient-text">Get INR. Instantly.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              StellarPay brings UPI-style convenience to crypto payments.
              Shopkeepers get INR, customers pay with XLM or USDC.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/user">
                <Button size="lg" className="group flex items-center space-x-2">
                  <span>Pay with Crypto</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/merchant">
                <Button variant="outline" size="lg">
                  Merchant Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">How It Works</h2>
            <p className="text-lg text-gray-600">
              Simple, fast, and secure. Just 4 steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/20">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-[#FAFAFA]">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">Why StellarPay?</h2>
            <p className="text-lg text-gray-600">
              Built for the future of payments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join the future of payments. Fast, secure, and borderless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/user">
                <Button variant="secondary" size="lg" className="bg-white text-gray-900 hover:bg-gray-50">
                  Start Paying
                </Button>
              </Link>
              <Link to="/merchant">
                <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Become a Merchant
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
