import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider } from 'next-themes';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from '@/config/wagmi';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MarketGridSkeleton } from '@/components/LoadingSkeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotFound from "./pages/NotFound";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Markets = lazy(() => import("./pages/Markets"));
const CreateMarket = lazy(() => import("./pages/CreateMarket"));
const MarketDetail = lazy(() => import("./pages/MarketDetail"));
const Portfolio = lazy(() => import("./pages/Portfolio"));

// Configure React Query with better defaults for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={{
              lightMode: lightTheme({
                accentColor: 'hsl(239 84% 67%)',
                accentColorForeground: 'white',
                borderRadius: 'medium',
              }),
              darkMode: darkTheme({
                accentColor: 'hsl(239 84% 67%)',
                accentColorForeground: 'white',
                borderRadius: 'medium',
              }),
            }}
          >
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <ErrorBoundary>
                      <Suspense fallback={<MarketGridSkeleton count={6} />}>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/markets" element={<Markets />} />
                          <Route path="/create" element={<CreateMarket />} />
                          <Route path="/market/:id" element={<MarketDetail />} />
                          <Route path="/portfolio" element={<Portfolio />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
