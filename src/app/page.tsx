import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { About } from "@/components/sections/About";
import { AiPlanner } from "@/components/sections/AiPlanner";
import { Catalog } from "@/components/sections/Catalog";
import { Faq, FinalCta } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { Hero, StatsStrip } from "@/components/sections/Hero";
import { PagoBanner } from "@/components/PagoBanner";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { Levels } from "@/components/sections/Levels";
import { getActiveProducts } from "@/lib/catalog";

export default async function HomePage() {
  const products = await getActiveProducts();
  const fromPrice = products.length
    ? Math.min(...products.map((product) => product.priceArs))
    : null;
  const planner = products.find((product) => product.slug === "planificador-ia");

  return (
    <CartProvider products={products}>
      <Header />
      <main>
        <Hero fromPrice={fromPrice} />
        <StatsStrip />
        <Levels />
        <Catalog products={products} />
        <AiPlanner product={planner} />
        <About />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsappFloat />
      <PagoBanner />
    </CartProvider>
  );
}
