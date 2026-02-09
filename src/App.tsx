import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <>
      <Dashboard />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

export default App;
