import useAuth from './hooks/useAuth';
import { NotificationProvider } from './context/NotificationContext';
import AppRouter from './routes/AppRouter';

function App() {
  const { user } = useAuth();

  return (
    <NotificationProvider key={user?.role ?? 'Employee'} role={user?.role ?? 'Employee'}>
      <AppRouter />
    </NotificationProvider>
  );
}

export default App;
