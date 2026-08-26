import type { Metadata } from "next";

import { InviteGenerator } from "@/components/InviteGenerator";

export const metadata: Metadata = {
  title: "Taklifnoma havolasini yaratish",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    nosnippet: true,
    noimageindex: true,
    "max-snippet": 0,
    "max-image-preview": "none",
    "max-video-preview": 0,
  },
};

export default function InvitePage() {
  return <InviteGenerator />;
}
