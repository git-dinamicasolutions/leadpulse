import { createRootRouteWithContext, Outlet, HeadContent, Scripts } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'LeadPulse' },
    ],
  }),
  component: RootComponent,
});

import { QueryClientProvider } from '@tanstack/react-query';

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
