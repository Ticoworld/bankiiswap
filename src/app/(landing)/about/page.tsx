import { redirect } from 'next/navigation';

/**
 * About page now redirects to /home
 * The new /home page serves as our comprehensive marketing landing page
 */
export default function AboutPage() {
  redirect('/home');
}
