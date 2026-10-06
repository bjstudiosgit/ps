import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Pack Society | Batch verification',description:'Check your Pack Society batch and find product details.',icons:{icon:'/favicon.svg'},robots:{index:false,follow:false}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
