import Login from '../pages/Login';
import { useData } from '../context/DataContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useData();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121212', color: '#fff' }}>
                Yuklanmoqda...
            </div>
        );
    }

    if (!isAuthenticated) {
        // Show Login component if not authenticated
        return <Login />;
    }

    return children;
};

export default ProtectedRoute;
