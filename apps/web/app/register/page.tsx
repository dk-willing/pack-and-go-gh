import { AuthForm } from "@/components/AuthForm";
import { Container } from "@/components/Container";

export default function RegisterPage() {
  return (
    <Container className="flex min-h-[calc(100vh-10rem)] max-w-lg items-center justify-center py-16">
      <div className="w-full rounded-2xl border border-navy-950/10 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
          Pack &amp; Go GH
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-ink-muted">
          Start planning reliable deliveries across Ghana.
        </p>
        <div className="mt-8">
          <AuthForm mode="register" />
        </div>
      </div>
    </Container>
  );
}
