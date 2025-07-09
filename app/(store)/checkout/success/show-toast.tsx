'use client'
import { useEffect } from "react"
import { toast } from "sonner"

export default function ShowToast() {
    useEffect(() => {
        toast.success("Order placed successfully!", {
            description: "Thank you for your purchase. Your order is being processed.",
            duration: 5000,
            position: "top-right",
            style: {
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: "8px",
                padding: "16px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            },
        })
    }, [])
    return <></>
}