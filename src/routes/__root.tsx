import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import '../index.css'
import { TanStackDevtools } from '@tanstack/react-devtools'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	return (
		<>
			<Outlet />
			<TanStackRouterDevtoolsPanel />
			<TanStackDevtools />
		</>
	)
}
