'use client';

import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4">
      <SignUp
        routing="hash"
        forceRedirectUrl="/overview"
        signInUrl="/login"
      />
    </div>
  );
}
