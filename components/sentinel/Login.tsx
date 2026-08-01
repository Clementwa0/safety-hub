'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { apiRequest } from '@/lib/http'
import { AUTH } from '@/lib/routes'

export default function LoginPage () {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await apiRequest<{
        user: { id: string; name: string; email: string; role: string }
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      router.replace(AUTH.SENTINEL_ROOT)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='flex min-h-screen bg-slate-950'>
      {/* Left Side */}
      <section className='hidden w-1/2 flex-col justify-between bg-gradient-to-br from-sky-900 via-slate-900 to-slate-950 p-12 text-white lg:flex'>
        <div>
          <div className='mb-10 flex items-center gap-3'>
            <div className='rounded-xl bg-sky-500/20 p-3'>
              <ShieldCheck className='h-8 w-8 text-sky-400' />
            </div>

            <div>
              <h1 className='text-2xl font-bold'>Sentinel Portal</h1>
              <p className='text-sm text-slate-300'>HSE Hub Limited</p>
            </div>
          </div>

          <div className='max-w-md space-y-6'>
            <h2 className='text-4xl font-bold leading-tight'>
              Manage your PPE business from one dashboard.
            </h2>

            <p className='text-lg text-slate-300'>
              Inventory, quotations, customers, suppliers, reports, analytics,
              and orders—all in one secure platform.
            </p>
          </div>
        </div>

        <div className='space-y-3 text-sm text-slate-400'>
          <p>✔ Product Management</p>
          <p>✔ Inventory Tracking</p>
          <p>✔ Customer CRM</p>
          <p>✔ Quotations & Orders</p>
          <p>✔ Sales Analytics</p>
        </div>
      </section>

      {/* Right Side */}
      <section className='flex flex-1 items-center justify-center p-6'>
        <Card className='w-full max-w-md border-slate-800 shadow-xl'>
          <CardHeader className='space-y-2 text-center'>
            <CardTitle className='text-3xl'>Welcome Back</CardTitle>

            <CardDescription>
              Sign in to your administrator account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>

                <Input
                  id='email'
                  type='email'
                  placeholder='admin@example.com'
                  required
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>

                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    required
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                  />

                  <button
                    type='button'
                    onClick={() => setShowPassword(prev => !prev)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <label className='flex items-center gap-2 text-sm'>
                  <Checkbox />

                  <span>Remember me</span>
                </label>

                <Link
                  href='/forgot-password'
                  className='text-sm text-sky-600 hover:underline'
                >
                  Forgot password?
                </Link>
              </div>

              {error ? (
                <p className='text-sm text-destructive'>{error}</p>
              ) : null}

              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className='mt-8 text-center text-sm text-muted-foreground'>
              Need help?{' '}
              <Link
                href='/contact'
                className='font-medium text-sky-600 hover:underline'
              >
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
