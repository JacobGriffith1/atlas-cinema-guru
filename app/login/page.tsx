import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md space-y-6 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="text-neutral-300">
        You must sign in with GitHub to use Cinema Guru.
      </p>

      <form
        action={async () => {
          "use server"
          await signIn("github", { redirectTo: "/" })
        }}
      >
        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-100 px-4 py-2 font-medium text-neutral-950 hover:bg-neutral-200"
        >
          Continue with GitHub
        </button>
      </form>
    </main>
  )
}
