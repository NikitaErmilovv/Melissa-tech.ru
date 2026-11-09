import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "./Container";
import { publicAsset } from "@/lib/site";

export function HomeSpotlight() {
  return (
    <section className="bg-background py-14 md:py-20">
      <Container>
        <div className="home-spotlight grid overflow-hidden rounded-3xl border border-border bg-surface lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[17rem] sm:min-h-[22rem] lg:min-h-[28rem]">
            <Image
              src={publicAsset("/images/home-outdoor-dance.png")}
              alt="Пара танцует бачату на набережной в тёплый летний вечер"
              fill
              className="object-cover object-[center_25%]"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:via-black/5 lg:to-black/35"
              aria-hidden
            />
            <p className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] tracking-wide text-white backdrop-blur-sm">
              Open Air · Михайловская набережная
            </p>
          </div>

          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            <p className="label-caps">Живой танец</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-foreground md:text-4xl">
              Бачата, которую чувствуешь на улице и в зале
            </h2>
            <p className="prose-body mt-5 max-w-md">
              Вечерние классы, тематические вечеринки и open air у воды — Aliento это не только техника,
              но и настроение, музыка и люди рядом.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/schedule" className="btn btn-primary btn-sm">
                Расписание занятий
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 text-sm text-accent-300 link-underline"
              >
                Вечеринки сезона
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
