"use client"

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/use-cart';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartSidebar from './cart-sidebar';

const Navbar = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/lives', label: 'Live Sessions' },
    { href: '/articles', label: 'Collection' },
  ];

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent group-hover:from-pink-700 group-hover:to-orange-600 transition-all duration-300">
                TheJuneBerry
              </span>
            </Link>
            
            <div className="flex items-center space-x-1">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                      pathname === item.href
                        ? "text-pink-600 bg-pink-50 shadow-sm"
                        : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-600 to-orange-500"></div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative ml-2 p-2.5 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-600 to-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <div className="md:hidden ml-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 text-gray-700" />
                  ) : (
                    <Menu className="h-5 w-5 text-gray-700" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      pathname === item.href
                        ? "text-pink-600 bg-pink-50 shadow-sm"
                        : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-600 to-orange-500"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;