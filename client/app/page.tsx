import Link from "next/link";
import { BookOpen, Calendar, Image, FileText, MessageSquare, Heart, Users, Megaphone } from "lucide-react";
import { HeroSlideshow } from "@/components/HeroSlideshow";

const OFFER_ITEMS = [
  { href: "/executives", icon: Users, title: "Executive Board", desc: "Meet our leadership", iconColor: "#6366f1" },
  { href: "/announcements", icon: Megaphone, title: "Announcements", desc: "Latest updates", iconColor: "#f59e0b" },
  { href: "/events", icon: Calendar, title: "Events", desc: "Register for activities", iconColor: "#3b82f6" },
  { href: "/gallery", icon: Image, title: "Gallery", desc: "Photos and memories", iconColor: "#8b5cf6" },
  { href: "/downloads", icon: FileText, title: "Downloads", desc: "Timetables & materials", iconColor: "#0ea5e9" },
  { href: "/blog", icon: BookOpen, title: "Blog", desc: "Stories and articles", iconColor: "#d97706" },
  { href: "/donate", icon: Heart, title: "Donate", desc: "Support our projects", iconColor: "#ef4444" },
  { href: "/suggestions", icon: MessageSquare, title: "Suggestions", desc: "Share your ideas", iconColor: "#14b8a6" },
];

export default function HomePage() {
  return (
    <div>
      <HeroSlideshow />

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gmsa-green mb-6 text-center animate-fade-in-up">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OFFER_ITEMS.map(({ href, icon: Icon, title, desc, iconColor }, i) => (
            <Link
              key={href}
              href={href}
              className="card p-6 hover:shadow-md transition group animate-fade-in-up hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <Icon className="w-10 h-10 mb-3 group-hover:scale-110 transition" style={{ color: iconColor }} />
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gmsa-green mb-4">Support Our Projects</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Contribute to the GMSA Weekly GHS 2.00 Project or the Masjid Renovation Project.
          </p>
          <Link href="/donate" className="btn-primary inline-block hover:scale-105 transition">
            Donate Now
          </Link>
        </div>
      </section>
    </div>
  );
}
