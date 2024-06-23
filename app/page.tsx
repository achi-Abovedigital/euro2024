import Hero from "@/components/Hero";
import Test from "@/components/Test";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center gap-6">
      <div className="flex min-h-screen items-center justify-center gap-6">
        <Test />

        {/* <Link
          href="/123"
          className="bg-blue-500 text-white text-4xl rounded-md p-2"
        >
          address 1
        </Link>
        <Link
          href="/12"
          className="bg-blue-500 text-white text-4xl rounded-md p-2"
        >
          address 2
        </Link> */}
      </div>
      {/* <Hero /> */}
    </main>
  );
}
