'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

export default function BatchProductImage({ src, name, code }: { src: string | null; name: string; code: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return <figure className="verified-product">
    {src && failedSrc !== src ? <Image
      src={src}
      alt={name + ' — batch ' + code}
      fill
      sizes="(max-width: 600px) calc(100vw - 84px), 480px"
      priority
      onError={() => setFailedSrc(src)}
    /> : <div className="product-placeholder" role="img" aria-label={'Image coming soon for ' + name + ', batch ' + code}>
      <Package size={56} strokeWidth={1.25} aria-hidden="true" />
      <span className="product-placeholder-title">Image coming soon</span>
      <span className="batch-code">{code}</span>
    </div>}
  </figure>;
}
