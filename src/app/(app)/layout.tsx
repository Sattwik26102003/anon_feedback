import Navbar from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster'; // Ensure this import is correct

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {children}
      <Toaster /> {/* Add this to enable toast notifications */}
    </div>
  );
}
