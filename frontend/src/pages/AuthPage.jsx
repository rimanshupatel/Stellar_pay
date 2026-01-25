import { useState } from "react";
import { useAuth } from "../lib/useAuth.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Briefcase, ArrowRight, Loader2, Wallet, AlertCircle } from "lucide-react";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { Button } from "../components/ui/Button";

export default function AuthPage() {
    const { login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState("user");
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                await login(form.email, form.password);
            } else {
                await register(form.name, form.email, form.password, role);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED] relative overflow-hidden px-4 py-12">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Dots Pattern - Top Left */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="absolute top-20 left-20 w-32 h-32 grid grid-cols-4 gap-2"
                >
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-800" />
                    ))}
                </motion.div>

                {/* Dots Pattern - Bottom Right */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="absolute bottom-20 right-20 w-32 h-32 grid grid-cols-4 gap-2"
                >
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-800" />
                    ))}
                </motion.div>

                {/* Abstract Shapes */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-10 w-24 h-24 border-4 border-gray-300 rounded-2xl"
                />

                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-10 w-32 h-32 border-4 border-[#FF9B71] rounded-2xl opacity-40"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl relative z-10"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Illustration/Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="hidden lg:flex flex-col justify-center space-y-6 p-8"
                    >
                        <div className="space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                                className="w-20 h-20 bg-gradient-to-br from-[#FF9B71] to-[#FF7E5F] rounded-3xl flex items-center justify-center shadow-xl"
                            >
                                <Wallet className="w-10 h-10 text-white" />
                            </motion.div>

                            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                Welcome to<br />
                                <span className="bg-gradient-to-r from-[#FF9B71] to-[#FF7E5F] bg-clip-text text-transparent">
                                    StellarPay
                                </span>
                            </h1>

                            <p className="text-lg text-gray-600 leading-relaxed">
                                The future of crypto payments. Pay with digital assets, receive INR instantly. Fast, secure, and borderless.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mt-8">
                            {[
                                "⚡ Instant crypto-to-INR conversion",
                                "🔒 Secured by Stellar blockchain",
                                "🌍 Global payment acceptance",
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex items-center space-x-3 text-gray-700"
                                >
                                    <span className="text-lg">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side - Auth Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden soft-shadow-xl">
                            {/* Header */}
                            <div className="p-8 pb-6 text-center bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                                    {isLogin ? "Welcome Back" : "Join StellarPay"}
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    {isLogin ? "Sign in to continue your journey" : "Create an account to get started"}
                                </p>
                            </div>

                            {/* Form */}
                            <div className="p-8 pt-6">
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                                        >
                                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                            <span className="text-sm text-red-800 font-medium">{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <AnimatePresence mode="wait">
                                        {!isLogin && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                                    </div>
                                                    <input
                                                        name="name"
                                                        placeholder="Full Name"
                                                        onChange={handleChange}
                                                        required={!isLogin}
                                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF9B71] focus:ring-4 focus:ring-[#FF9B71]/10 outline-none transition-all duration-200"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="Email Address"
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF9B71] focus:ring-4 focus:ring-[#FF9B71]/10 outline-none transition-all duration-200"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            placeholder="Password"
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF9B71] focus:ring-4 focus:ring-[#FF9B71]/10 outline-none transition-all duration-200"
                                        />
                                    </div>

                                    {isLogin && (
                                        <div className="flex justify-end">
                                            <button type="button" className="text-sm text-[#FF9B71] hover:text-[#FF7E5F] font-medium transition-colors">
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}

                                    <AnimatePresence mode="wait">
                                        {!isLogin && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <div className="grid grid-cols-2 gap-3 p-1 bg-gray-50 rounded-xl border border-gray-200">
                                                    {["user", "merchant"].map((r) => (
                                                        <button
                                                            type="button"
                                                            key={r}
                                                            onClick={() => setRole(r)}
                                                            className={`relative flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${role === r
                                                                    ? "text-gray-900 bg-white shadow-sm"
                                                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                                }`}
                                                        >
                                                            {role === r && (
                                                                <motion.div
                                                                    layoutId="role-bg"
                                                                    className="absolute inset-0 bg-white rounded-lg border border-gray-200"
                                                                    initial={false}
                                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                                />
                                                            )}
                                                            <span className="relative z-10 flex items-center gap-2 capitalize">
                                                                {r === "user" ? <User className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                                                {r}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        size="lg"
                                        className="w-full group bg-gradient-to-r from-[#FF9B71] to-[#FF7E5F] hover:from-[#FF8A5C] hover:to-[#FF6D4A] text-white shadow-lg hover:shadow-xl"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                {isLogin ? "Sign In" : "Create Account"}
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                {/* Social Login */}
                                <div className="mt-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-500">Or continue with</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        {[
                                            { icon: FaGoogle, label: "Google", color: "bg-white hover:bg-gray-50 text-gray-700" },
                                            { icon: FaApple, label: "Apple", color: "bg-gray-900 hover:bg-gray-800 text-white" },
                                            { icon: FaFacebook, label: "Facebook", color: "bg-[#1877F2] hover:bg-[#0C63D4] text-white" },
                                        ].map((social) => {
                                            const Icon = social.icon;
                                            return (
                                                <motion.button
                                                    key={social.label}
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="button"
                                                    className={`px-4 py-3 rounded-xl ${social.color} border border-gray-200 shadow-sm transition-all duration-200 flex items-center justify-center`}
                                                    title={social.label}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError("");
                                        }}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
                                    >
                                        {isLogin ? "New to StellarPay? " : "Already have an account? "}
                                        <span className="text-[#FF9B71] group-hover:underline underline-offset-4">
                                            {isLogin ? "Create an account" : "Sign in instead"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-6 text-center text-xs text-gray-500">
                            <p>🔒 Secured by Stellar Network • End-to-end encrypted</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
