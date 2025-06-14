"use client"

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/use-cart';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartSidebar from './cart-sidebar';

const Navbar = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/lives', label: 'Lives' },
    { href: '/articles', label: 'Shop' },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              TheJuneBerry
            </Link>
            
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-pink-600 bg-pink-50"
                        : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Cart Icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-pink-600 bg-pink-50"
                      : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;