"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StakePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/earn");
  }, [router]);

  return null;
}
