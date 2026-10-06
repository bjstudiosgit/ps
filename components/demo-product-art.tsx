import type { DemoProduct } from '@/lib/demo-products';
export default function DemoProductArt({ product }: { product: DemoProduct }) {
  const number = String(product.number).padStart(2, '0');
  return <svg className="demo-art" role="img" aria-label={'Placeholder artwork for ' + product.name} viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="440" rx="18" fill={product.accent} />
    <circle cx="470" cy="87" r="110" fill={product.colour} opacity=".13" />
    <circle cx="90" cy="400" r="165" fill={product.colour} opacity=".13" />
    <rect x="188" y="58" width="224" height="314" rx="17" fill={product.colour} />
    <rect x="205" y="75" width="190" height="280" rx="10" fill="white" opacity=".14" />
    <path d="M224 168h152M224 286h152" stroke="white" strokeWidth="3" opacity=".68" />
    <text x="300" y="132" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="17" letterSpacing="4">SAMPLE</text>
    <text x="300" y="253" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="90">{number}</text>
    <text x="300" y="325" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="19">PRODUCT {number}</text>
  </svg>;
}
