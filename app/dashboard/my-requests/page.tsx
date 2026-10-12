import { redirect } from 'next/navigation';

// Редирект на money-requests для совместимости
export default function MyRequestsPage() {
  redirect('/dashboard/money-requests');
}
