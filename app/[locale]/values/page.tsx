import type { Metadata } from "next";
import { ArrowRight, Mail } from "lucide-react";
import Navigation from "@/components/navigation";
import { Link } from "@/navigation";
import { routeAlternates } from "@/lib/i18n-routes";
import ValuesSectionArt from "./ValuesSectionArt";
import styles from "./values.module.css";

const title = "Our Values | IdleForest";
const description =
  "IdleForest's values: human rights, climate justice, peace, freedom, diversity, and a decentralized approach to shared natural resources.";
const canonical = "https://www.idleforest.com/values";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title,
    description,
    alternates: routeAlternates("/values", params.locale),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "IdleForest",
      type: "website",
      images: [
        {
          url: "/preview.png",
          width: 1280,
          height: 800,
          alt: "IdleForest values",
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

const claims = [
  {
    title: "Human rights are not optional.",
    body: [
      "At IdleForest, we stand up for human rights. That includes, in particular, women’s rights, the rights of the LGBTQIA+ community, Indigenous peoples, BIPOC, immigrants, and all marginalized communities.",
      "As citizens of the Global West, we are incredibly privileged, and we are trying our best to use that privilege in support of those who are not.",
    ],
  },
  {
    title: "Environmental justice is human justice.",
    body: [
      "The people who use the least of our earth’s resources have to endure the worst outcomes of climate change. As such, environmental justice is unequivocally bound to human justice.",
      "It is our responsibility to not only speak up, but actively make a tangible change for current and future generations.",
    ],
  },
  {
    title: "We choose peace, freedom, and diversity.",
    body: [
      "Wars, hate, greed, and overconsumerism kill people, animals, plants, the environment, and everything that makes our world a wonderful place.",
      "Apart from being sustainable, IdleForest is feminist, an ally to all those oppressed, and in favor of peace, freedom, justice, and diversity.",
    ],
  },
  {
    title: "Technology should serve the planet.",
    body: [
      "We strive to use modern technology in order to serve our planet, as opposed to those who ignore the fact that resources are limited in order to accumulate personal wealth.",
      "Natural resources, including breathable air and a place to live, belong to everyone on earth.",
    ],
  },
  {
    title: "The future is decentralized.",
    body: [
      "Under capitalism, owning a lot of resources and money comes with immense responsibility that should never be entirely up to those who benefit from that ownership.",
      "Therefore, we strongly believe in our decentralized approach.",
    ],
  },
];

const principles = [
  {
    label: "Public voice",
    text: "We will speak up where silence would protect comfort over people.",
  },
  {
    label: "Material action",
    text: "We measure our sustainability by tangible change, not by how elegantly we describe it.",
  },
  {
    label: "Partnership filter",
    text: "We carefully select partnerships to make sure we align on these world views.",
  },
  {
    label: "Community standards",
    text: "We will not tolerate hate speech or discrimination on our media platforms.",
  },
];

export default function ValuesPage() {
  return (
    <>
      <Navigation />
      <main className={styles.valuesPage}>
        <section className={styles.hero}>
          <ValuesSectionArt variant="collageTree" className={styles.heroCollageTreeArt} direction="left" priority />
          <ValuesSectionArt variant="whale" className={styles.introWhaleArt} direction="right" />
          <ValuesSectionArt variant="profile" className={styles.manifestoProfileArt} direction="right" />
          <ValuesSectionArt variant="peace" className={styles.principlesPeaceArt} direction="left" />
          <div className={`${styles.shell} ${styles.heroGrid}`}>
            <h1 className={styles.heroTitle}>Our values</h1>
            <h2 className={styles.headline} aria-label="Human justice. Climate justice. Together.">
              <span className={styles.headlineCard}>
                <span className={styles.headlineText}>Human justice.</span>
                <ValuesSectionArt variant="fists" className={styles.headlineFistsArt} direction="left" priority />
              </span>
              <span className={styles.headlineCard}>
                <span className={styles.headlineText}>Climate justice.</span>
                <ValuesSectionArt variant="rocket" className={styles.headlineRocketArt} direction="right" />
              </span>
              <span className={styles.headlineCard}>Together.</span>
            </h2>
            <div className={styles.poster} aria-label="IdleForest value statement">
              <p className={styles.posterLine}>
                We are <mark className={styles.highlightWord}>feminist</mark>.
              </p>
              <p className={styles.posterLine}>
                We are <mark className={styles.highlightWord}>allies</mark>.
              </p>
              <p className={styles.posterLine}>
                We are for <mark className={styles.highlightWord}>peace</mark>.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.introBand} aria-label="IdleForest values introduction">
          <div className={`${styles.shell} ${styles.introBandInner}`}>
            <p>
              IdleForest exists to turn unused digital capacity into climate action, but our work cannot be separated
              from the people most affected by the climate crisis.
            </p>
            <p>
              We believe sustainability without justice is incomplete. We believe technology without responsibility is
              dangerous.
            </p>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.manifesto}`} aria-label="IdleForest manifesto">
          {claims.map((claim) => (
            <article className={styles.claimBlock} key={claim.title}>
              <h2 className={styles.claimTitle}>{claim.title}</h2>
              <div className={styles.claimText}>
                {claim.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className={styles.principles} aria-label="How these values guide IdleForest">
          <div className={`${styles.shell} ${styles.principlesInner}`}>
            <h2>How this shows up.</h2>
            <ul className={styles.principlesList}>
              {principles.map((principle) => (
                <li key={principle.label}>
                  <strong>{principle.label}</strong>
                  <span>{principle.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.closing}`}>
          <div className={styles.closingPanel}>
            <h2>Privately and professionally.</h2>
            <div>
              <p>
                We live by these convictions privately and professionally. They shape how we build, whom we partner
                with, and how we moderate the spaces connected to IdleForest.
              </p>
            </div>
            <div className={styles.actions} aria-label="Related pages">
              <Link href="/transparency" className={`${styles.actionLink} ${styles.actionLinkPrimary}`}>
                See our transparency work
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/contact" className={`${styles.actionLink} ${styles.actionLinkSecondary}`}>
                Contact IdleForest
                <Mail aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
