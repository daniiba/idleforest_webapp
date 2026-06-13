import type { Metadata } from "next";
import { ArrowRight, ExternalLink, Leaf, SearchX, TreePine, Users } from "lucide-react";
import Navigation from "@/components/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/navigation";
import { canonicalUrl, routeAlternates } from "@/lib/i18n-routes";

export const dynamic = "force-dynamic";

const title = "IdleForest Partners";
const description =
  "Explore the companies partnered with IdleForest and join a partner forest to turn background activity into environmental support.";

type CompanyRecord = {
  id: string;
  name: string | null;
  slug: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  theme_color: string | null;
  is_invite_only: boolean | null;
};

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const path = "/partners";

  return {
    title,
    description,
    alternates: routeAlternates(path, params.locale),
    openGraph: {
      title,
      description,
      url: canonicalUrl(path, params.locale),
      siteName: "IdleForest",
      type: "website",
      images: [
        {
          url: "/preview.png",
          width: 1280,
          height: 800,
          alt: "IdleForest partners",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/preview.png"],
    },
  };
}

function normalizePartnerIdentity(value: string | null | undefined) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getWebsiteLink(website: string | null | undefined) {
  if (!website) return null;

  try {
    const url = new URL(website.match(/^https?:\/\//i) ? website : `https://${website}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hash = "";

    return {
      url: url.toString(),
      hostname: url.hostname.replace(/^www\./, ""),
    };
  } catch {
    return null;
  }
}

function shouldShowCompany(company: CompanyRecord) {
  const website = getWebsiteLink(company.website);
  const values = [
    normalizePartnerIdentity(company.name),
    normalizePartnerIdentity(company.slug),
    normalizePartnerIdentity(company.website),
    normalizePartnerIdentity(website?.hostname),
  ];

  return !values.some((value) => value.includes("hokentech") || value.includes("idleforest"));
}

export default async function PartnersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, website, description, logo_url, theme_color, is_invite_only")
    .order("name", { ascending: true });

  if (error) {
    console.error("Unable to load partners", error);
  }

  const partners = (data || []).filter(shouldShowCompany);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-brand-gray text-black">
        <section className="relative overflow-hidden bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
              <div className="max-w-4xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-bold uppercase text-brand-yellow">
                  <Leaf className="h-4 w-4" />
                  Partner forests
                </div>
                <h1 className="font-rethink-sans text-[44px] font-extrabold leading-[1.02] tracking-normal sm:text-6xl md:text-7xl">
                  Companies Partnered With IdleForest
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                  These partner forests connect everyday background activity to a specific company or environmental project.
                  Join one to direct your future IdleForest support there.
                </p>
              </div>
              <div className="rounded-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(11,16,31,1)]">
                <p className="font-rethink-sans text-5xl font-extrabold">{partners.length}</p>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-neutral-600">
                  active partners
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-12 md:py-16">
          {partners.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {partners.map((company) => {
                const website = getWebsiteLink(company.website);
                const href = company.slug ? `/c/${company.slug}` : null;
                const themeColor = company.theme_color || "#F7D94C";

                return (
                  <article
                    key={company.id}
                    className="flex min-h-[320px] flex-col justify-between rounded-lg border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          {company.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={company.logo_url}
                              alt=""
                              className="h-14 w-14 shrink-0 rounded-md border border-black/10 bg-white object-contain p-2"
                            />
                          ) : (
                            <div
                              className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-black/10"
                              style={{ backgroundColor: themeColor }}
                            >
                              <TreePine className="h-7 w-7 text-black" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h2 className="break-words font-rethink-sans text-2xl font-extrabold leading-tight">
                              {company.name || "Unnamed partner"}
                            </h2>
                            {website ? (
                              <a
                                href={website.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-flex items-center gap-1.5 break-all text-sm font-bold text-emerald-700 hover:text-brand-navy"
                              >
                                {website.hostname}
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <p className="mt-6 text-base leading-7 text-neutral-700">
                        {company.description ||
                          "This company is partnered with IdleForest through a shared forest where supporters can direct future app activity."}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {href ? (
                        <Link
                          href={href}
                          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-yellow px-5 py-3 text-sm font-extrabold text-black ring-2 ring-black transition hover:bg-white"
                        >
                          View forest <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : null}
                      <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-black px-5 py-3 text-sm font-extrabold text-black">
                        <Users className="h-4 w-4" />
                        {company.is_invite_only ? "Invite-only" : "Open to join"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-black bg-white p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <SearchX className="mx-auto h-10 w-10 text-brand-navy" />
              <h2 className="mt-4 font-rethink-sans text-3xl font-extrabold">No partners to show yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-neutral-700">
                Partner records are loaded from the database. Once a public partner is available, it will appear here.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
