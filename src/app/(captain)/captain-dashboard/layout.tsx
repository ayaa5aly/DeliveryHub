import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tayar – Captain Dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}