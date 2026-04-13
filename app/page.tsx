import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/overview');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
      <main className="text-center px-8">
        <h1 className="text-5xl font-bold text-white mb-4">Serenvi</h1>
        <p className="text-xl text-blue-200 mb-8">Your MLM platform for growth and earnings</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-blue-900 font-semibold rounded-full hover:bg-blue-50 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition border border-blue-400"
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
