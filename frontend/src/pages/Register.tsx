import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SERENVI</h1>
          <p className="text-purple-200">Join the MLM Platform</p>
        </div>
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          forceRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
};

export default Register;
