import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about/')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">About</h1>
      <p className="text-slate-600">
        Esta é uma página de exemplo. Crie novas pastas em /src/app para adicionar mais rotas.
      </p>
    </div>
  );
}
