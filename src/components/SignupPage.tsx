import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, BarChart2 } from 'lucide-react';
import { ExoOrb } from './ExoOrb';

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onHomeClick: () => void;
  onSuccessSignup?: (name: string, email: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSwitchToLogin,
  onHomeClick,
  onSuccessSignup,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccessSignup) {
      onSuccessSignup(name || 'Student', email || 'student@nilo.ai');
    }
  };

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

        {/* Right switch link */}
        <div className="text-sm font-medium text-[#6B7280]">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#6366F1] hover:text-[#4F46E5] font-semibold underline underline-offset-2 transition-colors ml-1"
          >
            Log in
          </button>
        </div>
      </div>

      {/* Top Stepper: 1 Create Account -> 2 Your Details -> 3 Get Started */}
      <div className="flex items-center justify-center max-w-md mx-auto my-4 w-full">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-[#5046E5] text-white flex items-center justify-center text-xs font-bold shadow-md shadow-indigo-500/25">
            1
          </div>
          <span className="text-[11px] font-bold text-[#1E1B2E] mt-1.5 whitespace-nowrap">
            Create Account
          </span>
        </div>

        {/* Connecting line */}
        <div className="flex-1 h-[2px] bg-slate-200 mx-3 -mt-4" />

        {/* Step 2 */}
        <div className="flex flex-col items-center opacity-60">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
            2
          </div>
          <span className="text-[11px] font-medium text-[#6B7280] mt-1.5 whitespace-nowrap">
            Your Details
          </span>
        </div>

        {/* Connecting line */}
        <div className="flex-1 h-[2px] bg-slate-200 mx-3 -mt-4" />

        {/* Step 3 */}
        <div className="flex flex-col items-center opacity-60">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
            3
          </div>
          <span className="text-[11px] font-medium text-[#6B7280] mt-1.5 whitespace-nowrap">
            Get Started
          </span>
        </div>
      </div>

      {/* Headline */}
      <div className="text-center my-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E1B2E]">
          Create your <span className="text-gradient-brand">NILO</span> account
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Start your learning journey with EXO.
        </p>
      </div>

      {/* Main Content: Left EXO Companion + Right Signup Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full my-4">
        
        {/* Left Companion Area */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          
          {/* Speech Bubble */}
          <div className="relative bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_10px_25px_rgba(124,92,255,0.12)] border border-purple-100 max-w-xs mb-2 z-20">
            <span className="text-xs font-bold text-[#1E1B2E] block">
              Let's get you started! ✨
            </span>
            <span className="text-[11.5px] text-[#6B7280] mt-0.5 block leading-relaxed">
              A few quick details and we'll be ready to learn together.
            </span>
            {/* Speech notch */}
            <div className="absolute -bottom-1.5 left-10 w-3 h-3 bg-white rotate-45 border-r border-b border-purple-100" />
          </div>

          {/* Cute doodle arrow */}
          <div className="text-[#8B5CF6] -my-1 -rotate-12 self-center mr-8 opacity-75">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>

          {/* Interactive EXO Orb */}
          <ExoOrb 
            size="md"
            subLabel=""
            showPedestal={true}
            speechBubbleTitle=""
            speechBubbleSubtitle=""
            interactive={true}
            className="!my-0"
          />

          {/* Handwritten-style caption doodle */}
          <div className="mt-6 flex items-center gap-2 text-right self-center rotate-[-2deg]">
            <p className="text-xs font-medium text-[#7C5CFF] tracking-tight italic">
              Same curiosity. <span className="font-bold text-[#1E1B2E]">Brighter learning.</span>
            </p>
            <span className="text-sm">⤴</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[28px] p-7 sm:p-8 border border-white shadow-[0_16px_40px_rgba(124,92,255,0.12),0_4px_12px_rgba(0,0,0,0.04)]">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151]">Full name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9FD] hover:bg-white focus:bg-white text-sm text-[#1E1B2E] placeholder:text-[#9CA3AF] border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#7C5CFF] rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151]">Email address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9FD] hover:bg-white focus:bg-white text-sm text-[#1E1B2E] placeholder:text-[#9CA3AF] border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#7C5CFF] rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151]">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF9FD] hover:bg-white focus:bg-white text-sm text-[#1E1B2E] placeholder:text-[#9CA3AF] border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#7C5CFF] rounded-xl outline-none transition-all"
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

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-[#5046E5] via-[#7042F8] to-[#9333EA] hover:opacity-95 shadow-[0_4px_16px_rgba(112,66,248,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Create Account</span>
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

            {/* Social Logins: Google, Microsoft, Apple */}
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

            {/* Terms notice */}
            <p className="mt-5 text-center text-[11px] text-[#9CA3AF] leading-tight">
              By creating an account, you agree to our{' '}
              <a href="#" className="underline hover:text-[#6B7280]">Terms of Service</a> and{' '}
              <a href="#" className="underline hover:text-[#6B7280]">Privacy Policy</a>.
            </p>

          </div>
        </div>

      </div>

      {/* Bottom 3 Feature Cards Row (matches right screen of reference) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full mt-6 mb-8">
        
        {/* Card 1: Learn Smarter */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(124,92,255,0.04)]">
          <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#EC4899] shrink-0">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E1B2E]">Learn Smarter</h4>
            <p className="text-[11px] text-[#6B7280] leading-snug">Explain concepts in your own words.</p>
          </div>
        </div>

        {/* Card 2: Get Feedback */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(124,92,255,0.04)]">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6366F1] shrink-0">
            <Zap className="w-5 h-5 fill-[#6366F1]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E1B2E]">Get Feedback</h4>
            <p className="text-[11px] text-[#6B7280] leading-snug">Find gaps and fix misconceptions.</p>
          </div>
        </div>

        {/* Card 3: See Progress */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(124,92,255,0.04)]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#10B981] shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E1B2E]">See Progress</h4>
            <p className="text-[11px] text-[#6B7280] leading-snug">Build confidence over time.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
