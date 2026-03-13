import Link from "next/link";
import { Facebook, Youtube } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Replace the URLs below with your GMSA social media links (include https://)
const socialLinks = [
  { href: "https://www.facebook.com/share/1HF1LaF21c/?mibextid=wwXIfr", icon: Facebook, label: "Facebook" },
  { href: "https://youtube.com/@gmsauds-nycstudio?si=bWt4lKRMGPltZ7P7", icon: Youtube, label: "YouTube" },
  { href: "https://www.tiktok.com/@gmsa_udsnyc?_r=1&_t=ZS-94ZtrKDXh5g", icon: TikTokIcon, label: "TikTok" },
  { href: "https://t.me/gmsaudsnyc", icon: TelegramIcon, label: "Telegram" },
  { href: "https://whatsapp.com/channel/0029VasBsn7LSmbhxiszCM1g", icon: WhatsAppIcon, label: "WhatsApp" },
];

export function Footer() {
  return (
    <footer className="bg-gmsa-green-dark text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-white overflow-hidden shrink-0">
                <img src="/logo.png" alt="GMSA Logo" className="h-8 w-auto object-contain" />
              </span>
              <span className="font-bold text-lg">GMSA UDS NYC</span>
            </Link>
            <p className="text-white/90 text-sm">
              Ghana Muslim Students&apos; Association at the University for Development Studies, Nyankpala Campus.
            </p>
            <div className="mt-4">
              <p className="text-white/90 text-xs font-medium mb-2">Follow us</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300 ease-out"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/executives" className="text-white/90 hover:text-white">Executives</Link></li>
              <li><Link href="/events" className="text-white/90 hover:text-white">Events</Link></li>
              <li><Link href="/downloads" className="text-white/90 hover:text-white">Downloads</Link></li>
              <li><Link href="/donate" className="text-white/90 hover:text-white">Donate</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Contact</h3>
            <p className="text-white/90 text-sm">UDS Nyankpala Campus, Tamale, Ghana</p>
          </div>
        </div>
        <div className="border-t border-white/20 mt-6 pt-4 text-center text-sm text-white/80">
          © {new Date().getFullYear()} GMSA UDS NYC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
