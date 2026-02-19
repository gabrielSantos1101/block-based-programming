import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
	component: HomePage,
})

function HomePage() {
	return (
		<main className="page">
			<section className="space-y-4">
				<div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground ring-1 ring-border">
					<span className="h-2 w-2 rounded-full bg-emerald-400"></span>
					<span className="ml-2">Stack pronto</span>
				</div>
				<div className="space-y-2">
					<h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
						Vite + TanStack Router + Tailwind v4
					</h1>
					<p className="text-lg text-muted-foreground">
						App Router file-based, estilizado com Tailwind CSS 4 e componentes
						shadcn.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<Button>Botão padrão</Button>
					<Button variant="secondary">Secundário</Button>
					<Button variant="ghost">Ghost</Button>
				</div>
			</section>
		</main>
	)
}
