import { redirect } from 'next/navigation'

export default function Home() {
  // El middleware maneja la redirección, pero como respaldo:
  redirect('/login')
}
