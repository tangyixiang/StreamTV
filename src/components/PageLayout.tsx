import Navbar from './Navbar';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col text-slate-100">
      <Navbar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pt-20 pb-12">
        {children}
      </main>
    </div>
  );
}
