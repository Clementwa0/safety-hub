import Image from 'next/image'
import { useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from '@/components/ui/sidebar'
import AppSidebarGroup from './SidebarGroup'

const AppSidebar = () => {
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar()
  const collapsed = state === 'collapsed'

  const handleItemClick = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, setOpenMobile])

  return (
    <Sidebar
      collapsible='icon'
      className='
        group/sidebar
        relative
        flex-shrink-0
        border-r
        border-gray-200/80
        bg-background/95
        backdrop-blur-md
        transition-all
        duration-300
        ease-in-out
        dark:border-gray-800/80
        dark:bg-gray-900
      '
    >
      {/* Integrated Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className='
          absolute
          -right-3
          top-6
          z-50
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          border
          border-gray-200
          bg-background
          text-muted-foreground
          shadow-sm
          opacity-0
          group-hover/sidebar:opacity-100
          transition-all
          duration-200
          hover:scale-105
          hover:bg-accent
          hover:text-foreground
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          dark:border-gray-800
          dark:bg-gray-900
        '
      >
        {collapsed ? (
          <ChevronRight className='h-3.5 w-3.5' />
        ) : (
          <ChevronLeft className='h-3.5 w-3.5' />
        )}
      </button>

      {/* Header */}
      <SidebarHeader className='border-b border-gray-200/60 px-4 py-3 dark:border-gray-800/60'>
        <div
          className={`flex h-12 items-center transition-all duration-300 ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 p-1.5 shadow-sm dark:bg-zinc-100'>
            <Image
              src='/logo.png'
              alt='HSE Hub'
              width={28}
              height={28}
              className='h-full w-full object-contain invert dark:invert-0'
            />
          </div>

          {!collapsed && (
            <div className='flex flex-col overflow-hidden animate-in fade-in duration-300'>
              <h2 className='truncate text-sm font-semibold tracking-tight text-foreground'>
                Sentinel
              </h2>
              <p className='truncate text-xs font-medium text-muted-foreground/80'>
                HSE Hub Limited
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className='px-3 py-4'>
        <AppSidebarGroup collapsed={collapsed} onItemClick={handleItemClick} />
      </SidebarContent>

      {/* Modern Minimal Footer */}
      {!collapsed && (
        <SidebarFooter className='mt-auto border-t border-gray-200/60 p-4 dark:border-gray-800/60 animate-in fade-in duration-300'>
          <div className='flex items-center justify-between text-[11px] font-medium text-muted-foreground/70'>
            <div className='flex items-center gap-1.5'>
              <span className='relative flex h-1.5 w-1.5'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500'></span>
              </span>
              <span>Production</span>
            </div>
            <div className='rounded-md bg-gray-200/60 px-1.5 py-0.5 text-[10px] tracking-wider text-muted-foreground dark:bg-gray-800'>
              v1.0.0
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

export default AppSidebar