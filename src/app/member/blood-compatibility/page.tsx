// This file is deprecated and has been moved to /blood-compatibility
// Please use the new location instead

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedBloodCompatibilityPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/blood-compatibility');
    }, [router]);

    return null;
} 