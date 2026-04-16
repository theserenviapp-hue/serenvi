import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import Logo from '../components/Common/Logo';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-editorial bg-grain">
      {/* Editorial panel */}
      <aside className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 opacity-20 bg-grain" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 380px at 80% -10%, rgba(212,84,42,0.35), transparent 60%), radial-gradient(800px 380px at 0% 110%, rgba(62,82,64,0.30), transparent 55%)',
          }}
        />
        <div className="relative p-12 flex flex-col justify-between w-full">
          <div className="text-ivory"><Logo className="h-12 w-auto" /></div>

          <div className="max-w-lg">
            <div className="eyebrow text-mist">Est. 2026</div>
            <h1 className="mt-4 font-display text-5xl xl:text-6xl leading-[0.98] text-balance">
              A bazaar, <em className="text-saffron not-italic" style={{ fontStyle: 'italic' }}>refined.</em>
            </h1>
            <p className="mt-6 text-mist/80 leading-relaxed text-pretty max-w-md">
              Welcome back. Your network, your earnings and every piece you&apos;ve favourited are waiting inside.
            </p>
          </div>

          <div className="text-xs font-mono tracking-widest text-mist/60 uppercase">
            Modern · Indian · Bazaar
          </div>
        </div>
      </aside>

      {/* Auth form */}
      <main className="lg:col-span-5 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-ink mb-6"><Logo className="h-10 w-auto" /></div>
          <div className="eyebrow mb-2">Sign in</div>
          <h2 className="font-display text-3xl text-ink mb-6">Welcome home.</h2>
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
            forceRedirectUrl="/dashboard"
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

export default Login;
