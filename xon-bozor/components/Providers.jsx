"use client";
import dynamic from "next/dynamic";
import { CartProvider } from "@/lib/cartContext";

const ToastContainer = dynamic(() => import("./ToastContainer"), { ssr: false });
const FloatingBottomNav = dynamic(() => import("./FloatingBottomNav"), { ssr: false });

export default function Providers({ children }) {
  return (
    <CartProvider>
      {children}
      <FloatingBottomNav />
      <ToastContainer />
    </CartProvider>
  );
}

