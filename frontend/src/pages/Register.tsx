import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import Logo from '../components/Common/Logo';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-editorial bg-grain">
      <aside className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 opacity-20 bg-grain" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 380px at 20% -10%, rgba(192,138,46,0.35), transparent 60%), radial-gradient(800px 380px at 100% 110%, rgba(212,84,42,0.28), transparent 55%)',
          }}
        />
        <div className="relative p-12 flex flex-col justify-between w-full">
          <div className="text-ivory"><Logo className="h-12 w-auto" /></div>

          <div className="max-w-lg">
            <div className="eyebrow text-mist">Join the network</div>
            <h1 className="mt-4 font-display text-5xl xl:text-6xl leading-[0.98] text-balance">
              Earn as you <em className="text-saffron not-italic" style={{ fontStyle: 'italic' }}>share.</em>
            </h1>
            <p className="mt-6 text-mist/80 leading-relaxed text-pretty max-w-md">
              15 levels of network rewards. A catalogue that gets better every Monday. Start with a referral
              code or go solo — either way, welcome in.
            </p>

            <ul className="mt-8 space-y-3 text-mist">
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-saffron rounded-full" /> Curated pieces, earned commissions</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-saffron rounded-full" /> Live dashboard · transparent wallet</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-saffron rounded-full" /> Built for makers and sellers alike</li>
            </ul>
          </div>

          <div className="text-xs font-mono tracking-widest text-mist/60 uppercase">
            Modern · Indian · Bazaar
          </div>
        </div>
      </aside>

      <main className="lg:col-span-5 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-ink mb-6"><Logo className="h-10 w-auto" /></div>
          <div className="eyebrow mb-2">Create account</div>
          <h2 className="font-display text-3xl text-ink mb-6">Begin your ledger.</h2>
          <SignUp
            routing="path"
            path="/register"
            signInUrl="/login"
            forceRedirectUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border border-ink/10 bg-paper',
              },
              variables: {
                colorPrimary: '#0E0D0B',
                colorText: '#0E0D0B',
                colorBackground: '#FFFFFF',
                fontFamily: '"Instrument Sans", sans-serif',
                borderRadius: '10px',
              },
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Register;
