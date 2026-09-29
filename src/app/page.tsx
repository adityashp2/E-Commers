import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import HeroSection from '@/components/landing/HeroSection';
import TentangSection from '@/components/landing/TentangSection';
import ProdukUnggulanSection from '@/components/landing/ProdukUnggulanSection';
import GaleriSection from '@/components/landing/GaleriSection';
import ReviewSection from '@/components/landing/ReviewSection';
import KontakSection from '@/components/landing/KontakSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TentangSection />
        <ProdukUnggulanSection />
        <GaleriSection />
        <ReviewSection />
        <KontakSection />
      </main>
      <Footer />
    </>
  );
}
