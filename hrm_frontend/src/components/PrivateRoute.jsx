import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, role }) {
  const { role: userRole } = useAuth()

  if (!userRole) return <Navigate to="/login" replace />
  if (role && userRole !== role) return <Navigate to={`/${userRole}/dashboard`} replace />
  return children
}
