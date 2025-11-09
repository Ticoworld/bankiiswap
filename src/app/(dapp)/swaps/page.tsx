// This route has been removed in the BankiiSwap minimal surface.
// Redirect to /swap to keep navigation coherent.
import { redirect } from 'next/navigation'

export default function SwapsPage() {
  redirect('/swap')
}
