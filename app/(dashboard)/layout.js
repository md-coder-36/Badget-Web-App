import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayoutWrapper from '@/components/layout/DashboardLayout';

export default async function DashboardLayout({ children }) {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardLayoutWrapper user={session.user}>
            {children}
        </DashboardLayoutWrapper>
    );
}
