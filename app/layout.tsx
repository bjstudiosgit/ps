import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Pack Society | By invitation',description:'Pack Society membership registration.',robots:{index:false,follow:false}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
