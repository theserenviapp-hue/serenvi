'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <SignIn
        routing="hash"
        afterSignInUrl="/overview"
        signUpUrl="/register"
      />
    </div>
  );
}
