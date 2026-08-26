import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page" data-testid="not-found-state">
      <section>
        <p className="eyebrow">Nikoh to‘yimiz</p>
        <h1>Taklifnoma topilmadi</h1>
        <p>Havola to‘liq va to‘g‘ri ekanini tekshiring.</p>
        <Link href="/">Bosh sahifaga qaytish</Link>
      </section>
    </main>
  );
}
