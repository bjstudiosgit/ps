'use client';
import { useRouter } from 'next/navigation';
import DinoGame from '@/components/dino-game';

export default function Home() {
  const router = useRouter();
  return <DinoGame onGameOver={() => router.replace('/verify')} />;
}
