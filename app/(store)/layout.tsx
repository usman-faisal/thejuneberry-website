import Navbar from "@/components/navigation"
import { CartProvider } from "@/lib/cart-context"


export default function storeLayout({children} : {children: React.ReactNode}) {
    return (
        <CartProvider>
            <Navbar />
          <main>{children}</main>
        </CartProvider>
  )
}