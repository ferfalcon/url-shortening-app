import bgBoostDesktopUrl from "../assets/landing/bg-boost-desktop.svg";
import bgBoostMobileUrl from "../assets/landing/bg-boost-mobile.svg";
import iconBrandRecognitionUrl from "../assets/landing/icon-brand-recognition.svg";
import iconDetailedRecordsUrl from "../assets/landing/icon-detailed-records.svg";
import iconFacebookUrl from "../assets/landing/icon-facebook.svg";
import iconFullyCustomizableUrl from "../assets/landing/icon-fully-customizable.svg";
import iconInstagramUrl from "../assets/landing/icon-instagram.svg";
import iconPinterestUrl from "../assets/landing/icon-pinterest.svg";
import iconTwitterUrl from "../assets/landing/icon-twitter.svg";
import illustrationWorkingUrl from "../assets/landing/illustration-working.svg";
import logoUrl from "../assets/landing/logo.svg";
import { LandingHeader } from "../components/landing-header";
import { CreateLinkPanel } from "../features/links/create-link-panel";

const ctaButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-[var(--color-cyan)] px-10 py-4 text-[15px] font-bold text-white transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]";

const statisticsCards = [
  {
    description:
      "Boost your brand recognition with each click. Generic links don't mean a thing. Branded links help instil confidence in your content.",
    iconUrl: iconBrandRecognitionUrl,
    offsetClassName: "md:mt-0",
    title: "Brand Recognition"
  },
  {
    description:
      "Gain insights into who is clicking your links. Knowing when and where people engage with your content helps inform better decisions.",
    iconUrl: iconDetailedRecordsUrl,
    offsetClassName: "md:mt-11",
    title: "Detailed Records"
  },
  {
    description:
      "Improve brand awareness and content discoverability through customizable links, supercharging audience engagement.",
    iconUrl: iconFullyCustomizableUrl,
    offsetClassName: "md:mt-[88px]",
    title: "Fully Customizable"
  }
] as const;

const footerSections = [
  {
    links: ["Link Shortening", "Branded Links", "Analytics"],
    title: "Features"
  },
  {
    links: ["Blog", "Developers", "Support"],
    title: "Resources"
  },
  {
    links: ["About", "Our Team", "Careers", "Contact"],
    title: "Company"
  }
] as const;

const socialIcons = [
  { alt: "", src: iconFacebookUrl },
  { alt: "", src: iconTwitterUrl },
  { alt: "", src: iconPinterestUrl },
  { alt: "", src: iconInstagramUrl }
] as const;

export function HomeRoute() {
  return (
    <>
      <LandingHeader />

      <main className="overflow-x-clip">
        <section className="bg-white">
          <div className="mx-auto flex max-w-[1110px] flex-col-reverse gap-10 px-6 pb-44 pt-2 md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-8 md:pb-40 md:pt-5">
            <div className="text-center md:text-left">
              <h1 className="text-[42px] leading-[48px] font-bold tracking-[-0.03em] text-[var(--color-very-dark-violet)] sm:text-[54px] sm:leading-[58px] md:max-w-[36rem] md:text-[80px] md:leading-[90px]">
                More than just shorter links
              </h1>
              <p className="mx-auto mt-4 max-w-[33rem] text-base leading-7 text-[var(--color-grayish-violet)] sm:text-lg sm:leading-8 md:mx-0 md:mt-1 md:text-[22px] md:leading-[36px]">
                Build your brand&apos;s recognition and get detailed insights on
                how your links are performing.
              </p>
              <a className={`${ctaButtonClassName} mt-8`} href="#shorten">
                Get Started
              </a>
            </div>

            <div className="relative">
              <img
                alt=""
                aria-hidden="true"
                className="w-[calc(100%+8rem)] max-w-none md:w-[733px] md:max-w-none md:translate-x-[72px]"
                src={illustrationWorkingUrl}
              />
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-surface)] pb-20 pt-0 md:pb-32">
          <div className="mx-auto max-w-[1110px] px-6">
            <div className="-mt-20 scroll-mt-20 md:-mt-[84px]" id="shorten">
              <CreateLinkPanel />
            </div>

            <div className="-mt-3 text-center md:-mt-1" id="features">
              <h2 className="text-[28px] leading-[48px] font-bold tracking-[-0.02em] text-[var(--color-very-dark-violet)] md:text-[40px]">
                Advanced Statistics
              </h2>
              <p className="mx-auto mt-3 max-w-[33.75rem] text-base leading-7 text-[var(--color-grayish-violet)] md:text-lg md:leading-8">
                Track how your links are performing across the web with our
                advanced statistics dashboard.
              </p>
            </div>

            <div className="relative mt-24 grid gap-24 md:mt-[100px] md:grid-cols-3 md:gap-8">
              <div className="absolute left-1/2 top-0 h-[calc(100%-7rem)] w-2 -translate-x-1/2 bg-[var(--color-cyan)] md:left-0 md:right-0 md:top-[9.5rem] md:h-2 md:w-auto md:translate-x-0" />

              {statisticsCards.map((card) => (
                <article
                  className={`relative rounded-[5px] bg-white px-8 pb-10 pt-0 text-center shadow-[0_10px_24px_rgba(58,48,84,0.04)] md:text-left ${card.offsetClassName}`}
                  key={card.title}
                >
                  <div className="flex justify-center md:justify-start">
                    <div className="-mt-11 grid size-[88px] place-items-center rounded-full bg-[var(--color-dark-violet)]">
                      <img alt="" aria-hidden="true" src={card.iconUrl} />
                    </div>
                  </div>

                  <h3 className="mt-8 text-[22px] font-bold text-[var(--color-very-dark-violet)]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[26px] text-[var(--color-grayish-violet)]">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[var(--color-dark-violet)]">
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover md:hidden"
            src={bgBoostMobileUrl}
          />
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
            src={bgBoostDesktopUrl}
          />

          <div
            className="relative mx-auto flex max-w-[1110px] flex-col items-center px-6 py-[90px] text-center md:py-14"
            id="boost"
          >
            <h2 className="text-[28px] leading-[48px] font-bold tracking-[-0.02em] text-white md:text-[40px]">
              Boost your links today
            </h2>
            <a className={`${ctaButtonClassName} mt-4`} href="#shorten">
              Get Started
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--color-very-dark-violet)]" id="resources">
        <div className="mx-auto flex max-w-[1110px] flex-col items-center gap-12 px-6 py-14 text-center md:flex-row md:items-start md:gap-0 md:text-left">
          <img
            alt="Shortly"
            className="h-8 w-auto brightness-0 invert"
            src={logoUrl}
          />

          <div className="grid gap-10 md:ml-auto md:grid-cols-3 md:gap-20">
            {footerSections.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-bold text-white">
                  {section.title}
                </h2>
                <ul className="mt-6 grid gap-2.5 text-[15px] text-[var(--color-gray)]">
                  {section.links.map((linkName) => (
                    <li key={linkName}>{linkName}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <ul
            aria-label="Social media"
            className="flex items-center gap-6 md:ml-[100px] md:self-start"
          >
            {socialIcons.map((icon, index) => (
              <li key={index}>
                <span className="block">
                  <img alt={icon.alt} src={icon.src} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
}
