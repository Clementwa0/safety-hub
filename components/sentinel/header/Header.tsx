import { PanelLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import Breadcrumbs from './Breadcrumbs'
import Notifications from './Notifications'
import UserMenu from './UserMenu'

const Header = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <header
      className='
        sticky top-0 z-40
        flex h-16 shrink-0 items-center
        justify-between
        border-b border-slate-200/70 bg-background/95
        px-4
        backdrop-blur-xl
        transition-all
        duration-300
        dark:border-slate-800/50
        dark:bg-slate-900/95
        dark:shadow-lg
        dark:shadow-sky-900/5
      '
    >
      {/* Left Section */}
      <div className='flex items-center gap-3'>
        {/* Mobile Toggle with Tooltip */}
        <Button
          variant='ghost'
          size='icon'
          className='
    lg:hidden
    relative
    text-slate-400
    hover:text-sky-400
    hover:bg-sky-400/10
    transition-all
    duration-200
    rounded-lg
  '
          onClick={toggleSidebar}
          aria-label='Toggle sidebar'
          title='Toggle sidebar'
        >
          <PanelLeft className='h-5 w-5 transition-transform duration-200 hover:scale-110' />
          <span className='absolute -top-1 -right-1 h-2 w-2 rounded-full bg-sky-400 animate-pulse' />
        </Button>
        {/* Breadcrumbs with enhanced styling */}
        <div className='hidden sm:block'>
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Section */}
      <div className='flex items-center gap-2'>
        {/* Divider */}
        <div className='hidden sm:block h-6 w-px bg-slate-800/50 dark:bg-slate-800/50' />

        {/* Notifications with enhanced styling */}
        <div className='relative'>
          <Notifications />
          <span
            className='
            absolute -top-0.5 -right-0.5
            h-2.5 w-2.5
            rounded-full
            bg-sky-400
            ring-2 ring-slate-900
            animate-pulse
            dark:ring-slate-900
          '
          />
        </div>

        {/* User Menu with enhanced styling */}
        <div className='relative'>
          <UserMenu />
          {/* Online status indicator */}
          <span
            className='
            absolute bottom-0 right-0
            h-3 w-3
            rounded-full
            bg-emerald-400
            ring-2 ring-slate-900
            dark:ring-slate-900
          '
          />
        </div>
      </div>
    </header>
  )
}

export default Header
