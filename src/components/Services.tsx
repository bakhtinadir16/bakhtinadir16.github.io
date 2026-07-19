import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";

const SERVICES = [
  {
    number: "01",
    title: "Software Development",
    description:
      "Desktop apps, websites and e-commerce stores — designed, built and shipped end to end with AI-accelerated workflows. From idea to a product your customers can use.",
  },
  {
    number: "02",
    title: "Video Editing",
    description:
      "Promotional edits and social-first formats that stop the scroll. Cut, paced and delivered on deadline — made to turn viewers into buyers.",
  },
  {
    number: "03",
    title: "Design & Branding",
    description:
      "Logos and brand visuals that make a store feel like a brand — clean, memorable and consistent everywhere your customers see you.",
  },
];

const Services = () => (
  <section className="py-16 md:py-24">
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
      <SectionHeader
        eyebrow="What I do"
        title={
          <>
            Built to <span className="font-display italic">convert</span>
          </>
        }
        subtext="Three ways I help businesses stand out, ship faster and sell more."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {SERVICES.map((service, i) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: i * 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            viewport={{ once: true, margin: "-100px" }}
            className="group relative rounded-3xl"
          >
            <span className="absolute -inset-[1px] rounded-3xl accent-gradient-animated opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-surface rounded-3xl p-7 md:p-8 flex flex-col gap-4 transition-transform duration-500 group-hover:-translate-y-1">
              <span className="text-4xl font-display italic text-muted/60">
                {service.number}
              </span>
              <h3 className="text-xl md:text-2xl text-text-primary">
                {service.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {service.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Services;
