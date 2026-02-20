import { Outlet, createRootRoute, useSearch } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import '../index.css'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	const search = useSearch({ from: '__root__' }) as { debug?: string }
	const showDevtools = search.debug === 'true'

	return (
		<>
			<Outlet />
			{showDevtools && (
				<>
					<TanStackRouterDevtoolsPanel />
					<TanStackDevtools />
				</>
			)}
		</>
	)
}
