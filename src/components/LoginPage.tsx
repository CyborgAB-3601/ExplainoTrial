import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, MessageSquare, Sparkles, BarChart3, ArrowRight } from 'lucide-react';
import { ExoOrb } from './ExoOrb';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onHomeClick: () => void;
  onSuccessAuth?: (user: { name?: string; email: string }) => void;
}

export const LoginPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onHomeClick,
  onSuccessAuth,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isEmailHovered, setIsEmailHovered] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const isInspectingEmail = isEmailFocused || isEmailHovered;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccessAuth) {
      onSuccessAuth({
        name: mode === 'signup' ? name || 'Student' : undefined,
        email: email || 'student@nilo.ai',
      });
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col flex-1">
      {/* Top Header Row */}
      <div className="flex items-center justify-between py-3">
        {/* Logo */}
        <div 
          onClick={onHomeClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#EC4899] p-0.5 shadow-md shadow-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0.5 left-1 w-2.5 h-1.5 bg-white/50 rounded-full blur-[0.5px]" />
              <div className="flex items-center gap-0.5 text-white scale-[0.65] font-black tracking-tighter">
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 6.5L4 2.5L6.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.5 6.5L10 2.5L12.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-wide text-[#1E1B2E] font-sans">
            NILO
          </span>
        </div>

        {/* Right Switch Action */}
        <div className="text-sm font-medium text-[#6B7280]">
          {isLogin ? (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#6366F1] hover:text-[#4F46E5] font-semibold underline underline-offset-2 transition-colors ml-1"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#6366F1] hover:text-[#4F46E5] font-semibold underline underline-offset-2 transition-colors ml-1"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Left Pitch Column + Right Auth Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
        
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Welcome Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
            <span className="text-[#1E1B2E]">{isLogin ? 'Welcome to ' : 'Start with '}</span>
            <span className="text-gradient-brand">NILO</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7280] font-normal mt-2.5">
            {isLogin 
              ? 'Learn by explaining, with EXO.' 
              : 'Your voice-verifying AI study companion.'}
          </p>

          {/* 3 Pastel Feature Badges */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-7 max-w-lg">
            {/* Badge 1 */}
            <div className="flex flex-col items-start p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(124,92,255,0.05)]">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#7C5CFF] mb-2.5">
                <MessageSquare className="w-4 h-4 fill-[#7C5CFF]/20" />
              </div>
              <span className="text-xs font-semibold text-[#1E1B2E] leading-snug">Explain</span>
              <span className="text-[11px] text-[#6B7280] leading-tight">your understanding</span>
            </div>

            {/* Badge 2 */}
            <div className="flex flex-col items-start p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(124,92,255,0.05)]">
              <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-[#EC4899] mb-2.5">
                <Sparkles className="w-4 h-4 fill-[#EC4899]/20" />
              </div>
              <span className="text-xs font-semibold text-[#1E1B2E] leading-snug">Get instant</span>
              <span className="text-[11px] text-[#6B7280] leading-tight">feedback</span>
            </div>

            {/* Badge 3 */}
            <div className="flex flex-col items-start p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(124,92,255,0.05)]">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-[#6366F1] mb-2.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#1E1B2E] leading-snug">Build deeper</span>
              <span className="text-[11px] text-[#6B7280] leading-tight">understanding</span>
            </div>
          </div>

          {/* Interactive EXO Orb (tracks mouse, blinks, winks, inspects email, looks away for password) */}
          <div className="mt-6 -mb-4 flex flex-col items-center sm:items-start">
            <ExoOrb 
              size="md"
              isInspectingEmail={isInspectingEmail}
              inspectingEmailText={email}
              isPasswordMode={isPasswordFocused}
              showPassword={showPassword}
              speechBubbleTitle={isLogin ? "Hi! I'm EXO" : "Let's learn together! ✨"}
              speechBubbleSubtitle={isLogin ? "Your AI learning companion" : "I'm ready when you are"}
              speechBubbleEmoji={isLogin ? "✨" : "🚀"}
              subLabel=""
              showPedestal={true}
              speechBubblePosition="top-right"
              className="!max-w-md !my-2"
            />
          </div>

          {/* Bottom Quote with accent line */}
          <div className="mt-8 border-l-2 border-[#7C5CFF]/60 pl-3.5 max-w-md">
            <p className="text-xs sm:text-[13px] italic text-[#6B7280] font-medium">
              {isLogin 
                ? '"The more you explain, the more you understand."' 
                : '"Same curiosity. Brighter learning."'}
            </p>
          </div>
        </div>

        {/* Right Column: Auth Card with In-Card Toggle */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[28px] p-7 sm:p-8 border border-white shadow-[0_16px_40px_rgba(124,92,255,0.12),0_4px_12px_rgba(0,0,0,0.04)] transition-all">
            
            {/* Top Segmented Control [Login | Sign Up] */}
            <div className="p-1 rounded-full bg-[#F3F4F6] flex items-center mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                  isLogin 
                    ? 'text-[#1E1B2E] bg-white shadow-sm' 
                    : 'text-[#6B7280] hover:text-[#1E1B2E]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                  !isLogin 
                    ? 'text-[#1E1B2E] bg-white shadow-sm' 
                    : 'text-[#6B7280] hover:text-[#1E1B2E]'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Header Text based on Active Mode */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1E1B2E] tracking-tight">
                {isLogin ? 'Continue Learning' : 'Create Account'}
              </h2>
              <p className="text-xs sm:text-[13px] text-[#6B7280] mt-1 font-normal">
                {isLogin 
                  ? 'Welcome back! Log in to your account.' 
                  : 'Start your learning journey with EXO.'}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name Field (shown only in Sign Up mode) */}
              {!isLogin && (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required={!isLogin}
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9FD] hover:bg-white focus:bg-white text-sm text-[#1E1B2E] placeholder:text-[#9CA3AF] border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#7C5CFF] rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div 
                className="space-y-1.5"
                onMouseEnter={() => setIsEmailHovered(true)}
                onMouseLeave={() => setIsEmailHovered(false)}
              >
                <div className="relative flex items-center">
                  <Mail className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors ${isInspectingEmail ? 'text-[#7C5CFF]' : 'text-[#94A3B8]'}`} />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9FD] hover:bg-white focus:bg-white text-sm text-[#1E1B2E] placeholder:text-[#9CA3AF] border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="relative flex items-center">
                  <Lock className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors ${isPasswordFocused ? 'text-[#7C5CFF]' : 'text-[#94A3B8]'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={isLogin ? "Password" : "Create a password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF9FD] hover:bg-white focus:bg-white text-sm text-[#1E1B2E] placeholder:text-[#9CA3AF] border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 rounded-xl outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#94A3B8] hover:text-[#6B7280] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password (Login mode) */}
              {isLogin && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#4B5563]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#6366F1] focus:ring-[#7C5CFF]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="font-semibold text-[#6366F1] hover:text-[#4F46E5] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-[#5046E5] via-[#7042F8] to-[#9333EA] hover:opacity-95 shadow-[0_4px_16px_rgba(112,66,248,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>{isLogin ? 'Log in' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-[#E5E7EB] w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-[#9CA3AF] absolute">
                or continue with
              </span>
            </div>

            {/* Social Logins */}
            {isLogin ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Google */}
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all text-xs font-semibold text-[#374151]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Microsoft */}
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all text-xs font-semibold text-[#374151]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {/* Google */}
                <button
                  type="button"
                  className="flex items-center justify-center py-2.5 rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </button>

                {/* Microsoft */}
                <button
                  type="button"
                  className="flex items-center justify-center py-2.5 rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  className="flex items-center justify-center py-2.5 rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all text-[#1E1B2E]"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.8 1.11-1.92.99-3.04-1 .04-2.15.67-2.82 1.46-.58.68-1.1 1.82-.96 2.91 1.11.09 2.19-.57 2.79-1.33z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Terms Notice */}
            <p className="mt-5 text-center text-[11px] text-[#9CA3AF] leading-tight">
              By {isLogin ? 'logging in' : 'creating an account'}, you agree to our{' '}
              <a href="#" className="underline hover:text-[#6B7280]">
                {isLogin ? 'Terms' : 'Terms of Service'}
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-[#6B7280]">Privacy Policy</a>.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};
