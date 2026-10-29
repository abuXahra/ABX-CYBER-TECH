/** Approved seed records. Services/FAQ text is drawn from the PRD; nothing here is a client, project or testimonial. */
export const SEED_SERVICES = [
  {
    name: "Website Development", slug: "website-development", icon: "globe", order: 0,
    shortDescription: "Responsive, functional websites built around your goals.",
    description: "<p>We build fast, responsive and maintainable websites that are designed around your business goals and the people who use them.</p>",
    features: ["Responsive across phones, tablets and desktops", "Content you can keep up to date", "Built for speed and search visibility"],
  },
  {
    name: "Website Design", slug: "website-design", icon: "tag", order: 1,
    shortDescription: "Modern, attractive, user-friendly digital experiences.",
    description: "<p>We design clean, modern interfaces that reflect your brand and make it easy for visitors to find what they need and take action.</p>",
    features: ["Brand-aligned visual design", "Clear navigation and layout", "Accessible, mobile-first interfaces"],
  },
  {
    name: "Website Redesign", slug: "website-redesign", icon: "refresh-cw", order: 2,
    shortDescription: "Give an existing website a fresh, professional look.",
    description: "<p>If your current website feels dated or hard to use, we can refresh its design and structure while keeping what already works.</p>",
    features: ["Modernised look and feel", "Improved structure and usability", "Better performance on mobile"],
  },
  {
    name: "App Development", slug: "app-development", icon: "smartphone", order: 3,
    shortDescription: "Custom Android and iOS applications tailored to your needs.",
    description: "<p>We develop custom mobile applications for Android and iOS that are tailored to your processes and your customers.</p>",
    features: ["Android and iOS applications", "Designed around your workflow", "Maintainable, well-structured code"],
  },
  {
    name: "E-commerce & Web Apps", slug: "ecommerce-web-apps", icon: "shopping-cart", order: 4,
    shortDescription: "Online stores, booking systems, management platforms and more.",
    description: "<p>We build online stores and custom web applications, from booking systems to management platforms, that help you operate and sell online.</p>",
    features: ["Online stores", "Booking and management systems", "Custom web applications"],
  },
] as const;

/** Draft answers for the owner to confirm; they avoid specific numbers, prices or guarantees. */
export const SEED_FAQS = [
  { order: 0, question: "What services does ABX CYBER TECH offer?",
    answer: "We offer website development, website design, website redesign, app development, and e-commerce and web apps." },
  { order: 1, question: "How long does it take to complete a project?",
    answer: "It depends on the scope, features and content involved. After you tell us about your project through the Contact Us page, we agree a realistic schedule with you before work begins." },
  { order: 2, question: "Do you work with businesses outside Abuja?",
    answer: "Yes. We are based in Abuja, and we can collaborate with businesses elsewhere remotely. Contact us to discuss your project." },
  { order: 3, question: "Can you help redesign my existing website?",
    answer: "Yes. Our Website Redesign service gives an existing website a fresh, professional look while keeping what already works." },
  { order: 4, question: "How do I get started?",
    answer: "Visit the Contact Us page and tell us about your idea. We will get back to you to discuss the next steps." },
] as const;

export const SEED_PAGES = [
  ["home", "Home"], ["about", "About Us"], ["services", "Services"], ["portfolio", "Portfolio"],
  ["blog", "Blog"], ["contact", "Contact"], ["privacy", "Privacy Policy"], ["terms", "Terms of Service"],
] as const;
