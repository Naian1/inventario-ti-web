import Link from 'next/link';

export default function Home() {
  return (
    <main className="content">
      <h1 className="text-2xl font-bold">Inventário TI</h1>
      <p className="mt-4">
        <Link href="/painel" className="text-blue-600 hover:underline dark:text-blue-400">
          Ir para o Painel
        </Link>
      </p>
    </main>
  );
}
