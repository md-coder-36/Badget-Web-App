export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md px-6">
                {children}
            </div>
        </div>
    );
}
