'use client'

import { Button } from '@/components/ui/button'

export function LoginPage() {
  const handleLogin = () => {
    window.location.href = '/api/auth/discord'
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Splitter</h1>
        <p className="mt-2 text-base text-muted-foreground">Split expenses with friends and family</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button
          onClick={handleLogin}
          variant="outline"
          className="w-full py-6 text-base"
        >
          Continue with Discord
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By signing in, you agree to our Terms of Service
      </p>
    </div>
  )
}
