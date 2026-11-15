import { AuthProvider } from '@/features/auth/AuthProvider'
import { ForgotPasswordPage, LoginPage } from '@/pages/LoginPage'
import { PendingAccountPage } from '@/pages/PendingAccountPage'

export default function AuthPages({ page }: { page: 'login'|'forgot'|'pending' }) {
  return <AuthProvider>{page==='login'?<LoginPage/>:page==='forgot'?<ForgotPasswordPage/>:<PendingAccountPage/>}</AuthProvider>
}
