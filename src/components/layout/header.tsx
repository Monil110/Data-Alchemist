"use client";
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm py-4 px-8 flex items-center justify-between" style={{borderBottom: '1px solid #eaf6fa'}}>
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-[#0e7cba] tracking-tight">Finpay</span>
      </div>
      <nav className="flex items-center gap-8">
        <Link href="#" className="text-[#1a2a36] font-medium hover:text-[#0e7cba] transition">Products</Link>
        <Link href="#" className="text-[#1a2a36] font-medium hover:text-[#0e7cba] transition">Customers</Link>
        <Link href="#" className="text-[#1a2a36] font-medium hover:text-[#0e7cba] transition">Pricing</Link>
        <Link href="#" className="text-[#1a2a36] font-medium hover:text-[#0e7cba] transition">Learn</Link>
        <Link href="/login" className="px-5 py-2 rounded-full border border-[#d1e3ee] bg-white text-[#0e7cba] font-semibold hover:bg-[#eaf6fa] transition">Login</Link>
        <Link href="/signup" className="px-5 py-2 rounded-full bg-[#0e7cba] text-white font-semibold hover:bg-[#0a5c8e] transition">Sign Up</Link>
      </nav>
    </header>
  );
}
