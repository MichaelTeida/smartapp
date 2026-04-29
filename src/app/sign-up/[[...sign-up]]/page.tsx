import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp appearance={{
        elements: {
          formButtonPrimary:
            "bg-indigo-500 hover:bg-indigo-400 text-sm normal-case",
        }
      }} />
    </div>
  );
}
