import { Benefits } from "@/components/Benefits";
import { HomeAboutSection } from "@/components/landing/HomeAboutSection";
import { HomeAnnouncementsSection } from "@/components/landing/HomeAnnouncementsSection";
import { HomeDirectionsSection } from "@/components/landing/HomeDirectionsSection";
import { HomeHallSection } from "@/components/landing/HomeHallSection";
import { HomePartiesSection } from "@/components/landing/HomePartiesSection";
import { HomePriceSection } from "@/components/landing/HomePriceSection";
import { HomeLocationSection } from "@/components/landing/HomeLocationSection";
import { HomeReviewsSection } from "@/components/landing/HomeReviewsSection";
import { HomeScheduleSection } from "@/components/landing/HomeScheduleSection";
import type { PartyEventCardData } from "@/components/PartyEventCard";
import { prisma } from "@/lib/db";
import { catalogToEventItems } from "@/lib/party-events";

export async function MarketingLandingSections({ bookHref = "/#book" }: { bookHref?: string }) {
  const [announcements, settings] = await Promise.all([
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.settings.get(),
  ]);

  const partyCards: PartyEventCardData[] = catalogToEventItems().map((event) => ({
    id: event.id,
    number: event.number,
    title: event.title,
    description: event.description,
    startsAt: new Date(event.startsAt),
    place: event.place,
    imageUrl: event.imageUrl,
  }));

  return (
    <>
      <HomeAboutSection />
      <HomeDirectionsSection />
      <HomeHallSection />
      <div id="benefits">
        <Benefits />
      </div>
      <HomePartiesSection events={partyCards} />
      <HomeAnnouncementsSection items={announcements} />
      <HomeScheduleSection bookHref={bookHref} />
      <HomePriceSection bookHref={bookHref} />
      <HomeReviewsSection />
      <HomeLocationSection hours={settings.hours} />
    </>
  );
}
