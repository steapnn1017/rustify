import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { HomeShowcase } from "@/components/home/HomeShowcase";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${site.name} — EU & US Rust cluster` },
  description: site.description,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeShowcase />
    </>
  );
}
