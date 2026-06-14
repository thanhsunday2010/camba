import Link from "next/link";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { getFooterSettings } from "@/lib/site/get-footer-settings";
import { renderCopyright } from "@/lib/site/footer";
import { Mail, MapPin, Phone } from "lucide-react";

export async function SiteFooter() {
  const footer = await getFooterSettings();

  return (
    <footer className="mt-auto border-t-2 border-purple-100 bg-gradient-to-b from-white to-purple-50/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-purple-700">
              <CambaMascot size="sm" mood="happy" className="rounded-xl shadow-sm" />
              <span className="text-xl kid-gradient-text">Camba</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {footer.brandDescription}
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {footer.contactEmail && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-purple-500" />
                  <a href={`mailto:${footer.contactEmail}`} className="hover:text-purple-700 hover:underline">
                    {footer.contactEmail}
                  </a>
                </p>
              )}
              {footer.contactPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-purple-500" />
                  <a href={`tel:${footer.contactPhone}`} className="hover:text-purple-700 hover:underline">
                    {footer.contactPhone}
                  </a>
                </p>
              )}
              {footer.address && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                  <span>{footer.address}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:col-span-8 lg:grid-cols-3">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-purple-800">
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-purple-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-purple-100 pt-6 text-center text-sm text-muted-foreground">
          {renderCopyright(footer.copyright)}
        </div>
      </div>
    </footer>
  );
}
