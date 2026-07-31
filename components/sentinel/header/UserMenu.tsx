'use client'

import { useEffect, useState } from 'react'
import {
  HelpCircle,
  LogOut,
  Shield,
  User,
} from 'lucide-react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { apiRequest } from '@/lib/http'
import { AUTH } from '@/lib/routes'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  createdAt?: string
}

const UserMenu = () => {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    void apiRequest<{ user: UserProfile }>('/api/auth/me').then((payload) => {
      setUser(payload.user)
    }).catch(() => {
      setUser(null)
    })
  }, [])

  const initials =
    user?.name
      ?.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase() ?? 'U'

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout errors and continue with local redirect.
    }

    toast.success('Logged out successfully', {
      description: `Goodbye ${user?.name ?? 'there'}!`
    })

    router.push(AUTH.LOGIN)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='rounded-full focus:outline-none focus:ring-2 focus:ring-primary'>
        <Avatar className='h-10 w-10 cursor-pointer border shadow-sm'>
          <AvatarImage src='' alt={user?.name ?? 'User'} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-72'>
        <div className='flex items-center gap-3 p-3'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src='' alt={user?.name ?? 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className='flex flex-col overflow-hidden'>
            <span className='truncate font-semibold'>{user?.name ?? 'User'}</span>
            <span className='truncate text-xs text-muted-foreground'>
              {user?.email ?? 'Signed in'}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User className='mr-2 h-4 w-4' />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Shield className='mr-2 h-4 w-4' />
          Account
        </DropdownMenuItem>

        <DropdownMenuItem>
          <HelpCircle className='mr-2 h-4 w-4' />
          Help
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className='text-red-600'>
          <LogOut className='mr-2 h-4 w-4' />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
