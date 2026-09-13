import { redirect } from 'next/navigation';

interface AppIndexPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AppIndexPage({ params }: AppIndexPageProps) {
  const { slug } = await params;
  redirect(`/app/${slug}/inicio`);
}
