import { notFound } from 'next/navigation';
import DemoProductArt from '@/components/demo-product-art';
import { demoProducts, getDemoProduct } from '@/lib/demo-products';
export function generateStaticParams() { return demoProducts.map(product => ({ code: product.code })); }
export default async function DemoProductPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const product = getDemoProduct(code);
  if (!product) notFound();
  return <div className="portal">
    <header className="masthead"><div className="brand">PACK<span>SOCIETY</span></div><span>Sample product</span></header>
    <main className="demo-main">
      <article className="demo-product">
        <DemoProductArt product={product} />
        <div>
          <p className="demo-eyebrow">Batch {product.code} · Sample</p>
          <h1>{product.name}</h1>
          <p>{product.details}</p>
          <p className="demo-note">This is placeholder content for previewing the product page layout.</p>
          <a className="demo-back" href="/">Try the batch journey</a>
        </div>
      </article>
    </main>
    <footer><div className="brand">PACK<span>SOCIETY</span></div><span>© {new Date().getFullYear()} Pack Society</span></footer>
  </div>;
}
