import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AboutPage() {
  return <PolicyPage title="About Us" body="8thCPCSalary.com is an independent salary and pension planning platform for Indian government employees, pensioners and aspirants. Our editorial approach prioritizes clear assumptions, transparent calculations and practical financial planning." />;
}

function PolicyPage({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Header />
      <main className="container-shell py-10">
        <article className="card p-6">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--saffron)]">Trust Page</p>
          <h1 className="mt-2 text-4xl font-black">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{body}</p>
          <p className="mt-5 text-sm font-semibold text-slate-500">Last updated: May 27, 2026</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
