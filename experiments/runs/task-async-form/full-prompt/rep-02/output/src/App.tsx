import { AsyncRemoteForm } from "./AsyncRemoteForm";
import { ErrorBoundary } from "./ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary>
      <AsyncRemoteForm />
    </ErrorBoundary>
  );
}
