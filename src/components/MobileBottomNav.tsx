import React from 'react';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export type MobileTab = 'home' | 'categories' | 'wishlist' | 'cart' | 'account';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const {
    language,
    cartCount,
    wishlist,
    currentUser,
  } = useStore();

  const handleTabClick = (tab: MobileTab) => {
    if (tab === 'home' && activeTab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onTabChange(tab);
  };

  const navItems = [
    {
      id: 'mobile-nav-home-btn',
      tabKey: 'home' as MobileTab,
      label: language === 'bn' ? 'হোম' : 'Home',
      icon: Home,
      badge: null,
    },
    {
      id: 'mobile-nav-categories-btn',
      tabKey: 'categories' as MobileTab,
      label: language === 'bn' ? 'ক্যাটাগরি' : 'Categories',
      icon: LayoutGrid,
      badge: null,
    },
    {
      id: 'mobile-nav-wishlist-btn',
      tabKey: 'wishlist' as MobileTab,
      label: language === 'bn' ? 'উইশলিস্ট' : 'Wishlist',
      icon: Heart,
      badge:
        wishlist.length > 0 ? (
          <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
            {wishlist.length > 99 ? '99+' : wishlist.length}
          </span>
        ) : null,
      filledWhenActive: true,
    },
    {
      id: 'mobile-nav-cart-btn',
      tabKey: 'cart' as MobileTab,
      label: language === 'bn' ? 'কার্ট' : 'Cart',
      icon: ShoppingBag,
      badge:
        cartCount > 0 ? (
          <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] text-slate-950 text-[9px] font-black flex items-center justify-center shadow-xs">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        ) : null,
    },
    {
      id: 'mobile-nav-account-btn',
      tabKey: 'account' as MobileTab,
      label: currentUser
        ? currentUser.name.split(' ')[0] || (language === 'bn' ? 'অ্যাকাউন্ট' : 'Account')
        : language === 'bn'
        ? 'অ্যাকাউন্ট'
        : 'Account',
      icon: User,
      avatar: currentUser?.avatar,
      badge: null,
    },
  ];

  return (
    <nav
      id="khorom-mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#070b14]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] pb-[env(safe-area-inset-bottom)] select-none"
    >
      <div className="h-14 sm:h-15 flex items-center justify-around px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tabKey;

          return (
            <button
              key={item.id}
              id={item.id}
              onClick={() => handleTabClick(item.tabKey)}
              className={`group flex-1 flex flex-col items-center justify-center h-full py-1 px-0.5 relative transition-all duration-150 cursor-pointer ${
                isActive ? 'text-[#dfb76c]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top accent indicator */}
              {isActive && (
                <span className="absolute top-0 inset-x-0 mx-auto w-8 h-0.5 bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] rounded-full shadow-[0_0_8px_rgba(223,183,108,0.6)]" />
              )}

              {/* Icon / Avatar with badge */}
              <div className="relative flex items-center justify-center w-6 h-6 my-0.5">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.label}
                    className={`w-5 h-5 rounded-full object-cover border transition-all ${
                      isActive
                        ? 'border-[#dfb76c] ring-1 ring-[#dfb76c]/50'
                        : 'border-slate-700 group-hover:border-slate-500'
                    }`}
                  />
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? 'text-[#dfb76c]' : 'text-slate-400'
                    } ${
                      item.tabKey === 'wishlist' && (isActive || (item.filledWhenActive && wishlist.length > 0))
                        ? 'fill-rose-500 text-rose-500'
                        : ''
                    }`}
                  />
                )}
                {item.badge}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] leading-tight tracking-tight truncate max-w-[62px] transition-colors ${
                  isActive ? 'font-bold text-[#faf8f5]' : 'font-medium text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
