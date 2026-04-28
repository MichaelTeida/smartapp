import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
      <SignIn appearance={{
        elements: {
          formButtonPrimary: 
            "bg-emerald-500 hover:bg-emerald-400 text-sm normal-case",
        }
      }} />
    </div>
  );
}
