// src/app/(dapp)/admin/page.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiBarChart , FiSettings, FiDatabase, FiShield, FiUsers } from 'react-icons/fi';

// Admin wallet addresses from environment variables
const getAdminWallets = () => {
  const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS;
  if (!adminWallets) return [];
  return adminWallets.split(',').map(wallet => wallet.trim());
};

import { redirect } from 'next/navigation'

export default function AdminDashboard() { redirect('/swap') }
  // Check if current wallet is admin
