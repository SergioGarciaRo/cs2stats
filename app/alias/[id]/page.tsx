"use client"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AliasPage({ params }: any) {
  const router = useRouter()
  useEffect(() => {
    router.replace(`/profiles/${params.id}`)
  }, [params.id])
  return <div>Redirecting to profile {params.id}…</div>
}
