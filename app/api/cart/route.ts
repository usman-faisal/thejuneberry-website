import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  // clear cart
    const cookieStore = await cookies()
    cookieStore.set('cart', '', {
      expires: new Date(0)
    })

    return NextResponse.json({ success: true })
}