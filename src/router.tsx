import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';

export const queryClient = new QueryClient();

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    context: {
      queryClient,
    },
  });
}

export const getRouter = createRouter;

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
