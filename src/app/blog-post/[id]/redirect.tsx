import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function BlogPostRedirect() {
  const params = useParams();
  const id = params?.id as string;
  
  redirect(`/blog/${id}`);
} 