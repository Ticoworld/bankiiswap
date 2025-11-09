// Removed login flow: redirect all /login visits straight to /swap
'use client';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  redirect('/swap');
  return null;
}
