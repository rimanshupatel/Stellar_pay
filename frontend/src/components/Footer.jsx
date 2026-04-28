import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Github, Twitter, Send } from 'lucide-react';
import { FaDiscord, FaTelegram } from 'react-icons/fa';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: [
            { name: 'Pay', href: '/user' },
            { name: 'Merchant', href: '/merchant' },
            { name: 'API', href: '#' },
            { name: 'Pricing', href: '#' },
        ],
        Company: [
            { name: 'About', href: '#' },
            { name: 'Blog', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Contact', href: '#' },
        ],
        Resources: [
            { name: 'Documentation', href: '#' },
            { name: 'Help Center', href: '#' },
            { name: 'Community', href: '#' },
            { name: 'Status', href: '#' },
        ],
        Legal: [
            { name: 'Privacy', href: '#' },
            { name: 'Terms', href: '#' },
            { name: 'Security', href: '#' },
            { name: 'Compliance', href: '#' },
        ],
    };

    const socialLinks = [
        { icon: Github, href: '#', label: 'GitHub' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: FaDiscord, href: '#', label: 'Discord' },
        { icon: FaTelegram, href: '#', label: 'Telegram' },
    ];

    return (
        <footer className="relative bg-white border-t border-gray-200">
            {/* Gradient Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-60" />

            <div className="container mx-auto max-w-7xl px-4 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center space-x-2.5 mb-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                StellarPay
                            </span>
                        </Link>
                        <p className="text-sm text-gray-600 mb-6 max-w-xs leading-relaxed">
                            The future of payments. Pay with crypto, receive INR instantly. Built on Stellar blockchain.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center space-x-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-900 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </motion.a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="font-semibold text-gray-900 text-sm mb-4">
                                {category}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <p>© {currentYear} StellarPay. All rights reserved.</p>
                        <span className="hidden md:block">•</span>
                        <p className="hidden md:block">
                            Powered by <span className="font-semibold text-gray-900">Stellar Network</span>
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                        />
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                            <span className="text-sm font-medium">Subscribe</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
