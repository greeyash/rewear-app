"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-2 p-4">
      <button onClick={() => router.push("/")}>
        <Image
          src="/logo-rewearr.png"
          alt="ReWear Logo"
          width={120}
          height={40}
        />
      </button>
    </nav>
  );
}
