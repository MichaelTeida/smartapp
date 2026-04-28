import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0e1a] flex items-center justify-center">
      <SignUp />
    </div>
  )
}
