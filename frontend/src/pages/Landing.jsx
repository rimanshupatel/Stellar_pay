import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Globe, CheckCircle, TrendingUp, Lock, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Footer from '../components/Footer';


export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Pay with crypto, receive INR instantly. No waiting, no delays.',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Built on Stellar blockchain. Your transactions are safe and transparent.',
      color: 'from-green-600 to-emerald-600',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Accept payments from anywhere in the world. No borders, no limits.',
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: CheckCircle,
      title: 'Easy Integration',
      description: 'Simple QR code system. Works just like UPI, but with crypto.',
      color: 'from-orange-600 to-amber-600',
    },
  ];

  const steps = [
    { number: '1', title: 'Connect Wallet', description: 'Link your Stellar wallet (Freighter)' },
    { number: '2', title: 'Scan QR Code', description: 'Merchant generates a payment QR' },
    { number: '3', title: 'Confirm Payment', description: 'Review amount and approve' },
    { number: '4', title: 'Done!', description: 'Merchant receives INR instantly' },
  ];

  const stats = [
    { label: 'Transactions', value: '10M+', icon: TrendingUp },
    { label: 'Active Users', value: '50K+', icon: Globe },
    { label: 'Merchants', value: '5K+', icon: CheckCircle },
    { label: 'Uptime', value: '99.9%', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4 gradient-mesh">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-transparent" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-900">Live on Stellar Network</span>
              <span className="text-xs text-gray-600">• Now supporting USDC payments</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-gray-900 tracking-tight leading-[1.1]"
            >
              Pay with Crypto.
              <br />
              <span className="bg-gradient-to-r from-[#FF9B71] via-[#FF7E5F] to-[#FF9B71] bg-clip-text text-transparent">
                Get INR. Instantly.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
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
                <Button size="lg" className="group flex items-center space-x-2 bg-gradient-to-r from-[#FF9B71] to-[#FF7E5F] hover:from-[#FF8A5C] hover:to-[#FF6D4A] text-white shadow-lg hover:shadow-xl px-8 py-4 text-base">
                  <span>Pay with Crypto</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/merchant">
                <Button variant="outline" size="lg" className="px-8 py-4 text-base border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50">
                  Merchant Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white border-y border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
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
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md`}>
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
      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
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

      <Footer />
    </div>
  );
}
