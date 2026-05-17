import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-6xl font-bold mb-6">
          Plataforma do Sono
        </h1>

        <p className="text-zinc-400 text-lg mb-10 max-w-2xl">
          Educação digital sobre higiene do sono
          aplicada ao desempenho esportivo.
        </p>

        <Link
          href="/login"
          className="bg-white text-black px-8 py-4 rounded-2xl font-semibold"
        >
          Entrar na plataforma
        </Link>

      </div>

    </main>
  );
}