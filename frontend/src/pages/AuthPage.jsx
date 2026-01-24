import { useState } from "react";
import { useAuth } from "../lib/useAuth.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Briefcase, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";

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

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0B0D] relative overflow-hidden px-4 selection:bg-orange-500/30 selection:text-orange-200">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-md relative z-10"
            >
                {/* Glass Card */}
                <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/5">

                    {/* Header Section */}
                    <div className="p-8 pb-6 text-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {isLogin ? "Welcome Back" : "Join StellarPay"}
                        </h2>
                        <p className="text-gray-400 mt-2 text-sm font-medium">
                            {isLogin ? "Enter your credentials to access your account" : "Start your journey with the future of payments"}
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="p-8 pt-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-red-200 font-medium">{error}</span>
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
                                        className="space-y-5"
                                    >
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                            </div>
                                            <input
                                                name="name"
                                                placeholder="Full Name"
                                                onChange={handleChange}
                                                required={!isLogin}
                                                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:bg-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:bg-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:bg-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-xl border border-white/10">
                                            {["user", "merchant"].map((r) => (
                                                <button
                                                    type="button"
                                                    key={r}
                                                    onClick={() => setRole(r)}
                                                    className={`relative flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${role === r
                                                        ? "text-white bg-white/10 shadow-lg shadow-black/20"
                                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                                        }`}
                                                >
                                                    {role === r && (
                                                        <motion.div
                                                            layoutId="role-bg"
                                                            className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg border border-orange-500/30"
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative flex items-center justify-center gap-2">
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
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                }}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors group"
                            >
                                {isLogin ? "New to StellarPay? " : "Already have an account? "}
                                <span className="text-orange-400 group-hover:text-orange-300 underline underline-offset-4 decoration-orange-400/30 group-hover:decoration-orange-300">
                                    {isLogin ? "Create an account" : "Sign in instead"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer decorations */}
                <div className="mt-8 text-center text-xs text-gray-600 font-medium">
                    <p>Secured by Stellar Network</p>
                </div>
            </motion.div>
        </div>
    );
}
