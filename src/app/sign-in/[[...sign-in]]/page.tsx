import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0e1a] flex items-center justify-center">
      <SignIn />
    </div>
  )
}
