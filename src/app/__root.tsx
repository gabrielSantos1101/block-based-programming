import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, Outlet, useSearch } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import '../index.css';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const search = useSearch({ from: '__root__' }) as { debug?: string };
  const showDevtools = search.debug === 'true';

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
  );
}
