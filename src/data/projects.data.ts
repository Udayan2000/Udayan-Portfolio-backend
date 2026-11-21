import { Project, Service } from '../types/portfolio';

export const PROJECTS_DATA: Project[] = [
  // 1. Website Development
  {
    id: "apex-creative",
    title: "ApexStudio Creative & Marketing Platform",
    category: "website-development",
    categoryLabel: "Website Development",
    year: "2024",
    role: "Lead Web Developer & Consultant",
    tagline: "Sub-second corporate agency website with custom dynamic interactions & 99 Core Web Vitals",
    description: "Built a high-performance marketing website for a creative consultancy featuring sub-second page loads, interactive case-study transitions, and full technical SEO architecture.",
    features: [
      "Custom responsive layout designed for high conversion across mobile, tablet & desktop",
      "Interactive case-study showcase with animated filter categories & smooth transitions",
      "Full on-page technical SEO architecture, structured metadata & sub-second page loads"
    ],
    outcome: "+88% increase in organic client inquiries within 60 days of launch",
    technologies: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Vercel"],
    demoUrl: "https://example.com/apex-studio",
    slug: "apex-creative-platform",
    featured: true
  },
  {
    id: "strata-advisory",
    title: "Strata Capital Executive Advisory Website",
    category: "website-development",
    categoryLabel: "Website Development",
    year: "2024",
    role: "Full-Stack Web Developer",
    tagline: "Ultra-fast corporate firm website with interactive advisory team bios & booking pipeline",
    description: "Engineered a clean, corporate web presence for a boutique investment advisory firm with integrated private consultation scheduling and dynamic client testimonial sliders.",
    features: [
      "Instant calendar booking integration synced with Google Calendar and WhatsApp triggers",
      "Interactive partner bios with downloadable executive briefs & thought leadership reports",
      "Security-hardened contact inquiry form with spam protection & instant email routing"
    ],
    outcome: "Generated 34 qualified investor consultation calls in the first month",
    technologies: ["Next.js 16", "TypeScript", "Tailwind CSS", "Nodemailer", "Cloudflare"],
    demoUrl: "https://example.com/strata-advisory",
    slug: "strata-capital-advisory",
    featured: true
  },

  // 2. Ecommerce Website
  {
    id: "velo-luxe",
    title: "VeloLuxe Direct-to-Consumer Storefront",
    category: "ecommerce",
    categoryLabel: "Ecommerce Website",
    year: "2024",
    role: "Lead Ecommerce Engineer",
    tagline: "Headless e-commerce platform with sub-second Stripe checkout & inventory tracking",
    description: "Designed and developed a custom direct-to-consumer store for a luxury activewear brand. Built with a sub-second shopping cart, dynamic product filters, and real-time inventory tracking.",
    features: [
      "Frictionless 1-click cart slide-over with instant Stripe credit card & Apple Pay checkout",
      "Dynamic colorway swatch picker & interactive size recommendations for buyers",
      "Automated stock level indicators with 'Limited Stock' urgency alerts"
    ],
    outcome: "Reduced checkout abandonment by 38% and tripled mobile transaction volume",
    technologies: ["Next.js 16", "Stripe API", "TypeScript", "Tailwind CSS", "Zustand"],
    demoUrl: "https://example.com/velo-luxe",
    slug: "velo-luxe-storefront",
    featured: true
  },
  {
    id: "nordic-roast",
    title: "Nordic Roast Artisan Coffee Subscriptions",
    category: "ecommerce",
    categoryLabel: "Ecommerce Website",
    year: "2024",
    role: "Ecommerce Specialist",
    tagline: "Custom recurring subscription coffee club platform with customer portal",
    description: "Engineered a bespoke recurring coffee subscription store enabling customers to customize grind type, delivery frequency, and manage recurring Stripe billing seamlessly.",
    features: [
      "Interactive 3-step 'Build Your Subscription Box' quiz for personalized taste profiles",
      "Self-serve client portal to pause, skip, or modify monthly coffee deliveries without support tickets",
      "Automated email & SMS notifications for upcoming billing and courier dispatch tracking"
    ],
    outcome: "Scaled to 1,200+ active monthly subscribers within 90 days",
    technologies: ["React 19", "Next.js", "Stripe Subscriptions", "Tailwind CSS", "Node.js"],
    demoUrl: "https://example.com/nordic-roast",
    slug: "nordic-roast-subscriptions"
  },

  // 3. Wordpress
  {
    id: "beacon-health",
    title: "Beacon Health & Medical Center Portal",
    category: "wordpress",
    categoryLabel: "Wordpress",
    year: "2024",
    role: "Senior WordPress Engineer",
    tagline: "Custom WordPress theme without slow page builders for healthcare network",
    description: "Architected a custom, ultra-fast WordPress site for a multi-specialty medical clinic. Engineered bespoke Gutenberg blocks so staff can update doctors and clinic timings with zero code.",
    features: [
      "Bespoke Gutenberg block suite giving non-technical staff an intuitive drag-and-drop editor",
      "Interactive doctor directory filterable by medical specialty, location & availability",
      "Sub-second load times with Google Core Web Vitals score of 98 on mobile devices"
    ],
    outcome: "Cut page load time from 4.8s down to 0.6s and doubled appointment requests",
    technologies: ["Custom WordPress Theme", "PHP 8.3", "Gutenberg Blocks", "REST API", "Tailwind"],
    demoUrl: "https://example.com/beacon-health",
    slug: "beacon-health-center"
  },
  {
    id: "zenith-insights",
    title: "Zenith Business Media & Publication Hub",
    category: "wordpress",
    categoryLabel: "Wordpress",
    year: "2024",
    role: "WordPress Architect",
    tagline: "Editorial publication platform handling 500k monthly readers with instant search",
    description: "Engineered an editorial digital magazine for a financial publication. Features live category feeds, instant search, and newsletter integration with custom WordPress REST API caching.",
    features: [
      "Instant keyword search and category filtering across 3,000+ archived business articles",
      "Integrated newsletter signup pop-under synced directly with Mailchimp & ConvertKit",
      "Custom reading-time estimator, social sharing buttons & related article recommendation engine"
    ],
    outcome: "Boosted average time on page by 42% and reached 500,000 monthly pageviews",
    technologies: ["WordPress Headless", "MySQL", "PHP 8", "Redis Cache", "TypeScript"],
    demoUrl: "https://example.com/zenith-insights",
    slug: "zenith-business-publication"
  },

  // 4. App Development
  {
    id: "cloud-fleet",
    title: "FleetPulse Logistics Tracking App",
    category: "app-development",
    categoryLabel: "App Development",
    year: "2024",
    role: "Lead Full-Stack App Engineer",
    tagline: "Live real-time delivery tracking & route dispatch web application",
    description: "Developed a real-time web application for logistics dispatchers to monitor fleet vehicles, manage driver shifts, and calculate optimal delivery turnaround times on an interactive map.",
    features: [
      "Live GPS fleet map with color-coded vehicle statuses (In Transit, Delivering, Idle)",
      "Instant push notification alerts when drivers complete deliveries or report roadside delays",
      "Driver shift schedule manager with automated SMS dispatch alerts"
    ],
    outcome: "Saved 18 hours per week in dispatch calls and reduced late deliveries by 29%",
    technologies: ["React 19", "Node.js", "Express", "Socket.io", "Mapbox GL", "PostgreSQL"],
    demoUrl: "https://example.com/fleetpulse",
    slug: "fleetpulse-logistics-app"
  },
  {
    id: "care-flow",
    title: "CareFlow Clinic Patient Scheduling App",
    category: "app-development",
    categoryLabel: "App Development",
    year: "2024",
    role: "Full-Stack Application Developer",
    tagline: "Patient self-booking & appointment management progressive web application",
    description: "Engineered an intuitive progressive web app for patients to book consultations, fill medical intake questionnaires beforehand, and receive automated WhatsApp reminders.",
    features: [
      "Step-by-step patient appointment booking wizard with real-time doctor availability slots",
      "Digital intake form builder that securely saves patient details before clinic visits",
      "Automated WhatsApp & SMS appointment confirmation reminders 24 hours prior"
    ],
    outcome: "Reduced patient no-show rate from 24% to under 4% in the first quarter",
    technologies: ["Next.js 16", "Express.js", "Prisma ORM", "Twilio API", "Tailwind CSS"],
    demoUrl: "https://example.com/careflow",
    slug: "careflow-clinic-app"
  },

  // 5. Product
  {
    id: "saas-launchpad",
    title: "OmniDesk Customer Support SaaS Product",
    category: "product",
    categoryLabel: "Product",
    year: "2024",
    role: "Founding Product Engineer",
    tagline: "Multi-channel unified customer inbox SaaS product for growing online brands",
    description: "Built a full SaaS web product that aggregates customer conversations from email, live chat, and WhatsApp into a single collaborative team inbox with canned responses.",
    features: [
      "Unified team inbox consolidating customer inquiries across WhatsApp, Email & Live Chat",
      "Collision detection preventing multiple team members from replying to the same customer ticket",
      "Keyboard shortcut canned responses & automated greeting triggers for common questions"
    ],
    outcome: "Adopted by 45+ e-commerce merchants with 99.9% application uptime",
    technologies: ["Next.js 16", "Node.js", "PostgreSQL", "Tailwind CSS", "Redis"],
    demoUrl: "https://example.com/omnidesk",
    slug: "omnidesk-support-saas"
  },
  {
    id: "metric-pulse",
    title: "MetricPulse Financial Analytics Platform",
    category: "product",
    categoryLabel: "Product",
    year: "2024",
    role: "Senior Frontend & Product Engineer",
    tagline: "Executive financial dashboard with automated revenue forecasting & cashflow charts",
    description: "Designed and built an executive analytics SaaS dashboard that connects with Stripe and QuickBooks to display real-time MRR, churn rate, and future cash flow projections.",
    features: [
      "Clean interactive visual charts for Monthly Recurring Revenue (MRR), Net Churn & LTV",
      "One-click PDF executive report generator formatted for board meetings and investors",
      "Custom threshold alerts notifying founders of abnormal subscriber cancellations"
    ],
    outcome: "Helped 80+ founders track over $14M in recurring revenue with zero manual spreadsheets",
    technologies: ["React 19", "Chart.js", "Node.js", "Express", "Tailwind CSS"],
    demoUrl: "https://example.com/metricpulse",
    slug: "metricpulse-financial-platform"
  },

  // 6. Agentic AI
  {
    id: "agentic-support",
    title: "NexusAgent Autonomous Customer Support AI",
    category: "ai",
    categoryLabel: "Agentic AI",
    year: "2024",
    role: "AI Solutions Architect",
    tagline: "Autonomous AI support agent that resolves customer inquiries without human intervention",
    description: "Engineered an autonomous AI agent integrated into client websites. Capable of reading internal help docs, looking up order statuses via API, and answering complex customer queries.",
    features: [
      "Trained on proprietary company knowledge bases & FAQs with zero hallucination guardrails",
      "Direct API integration to look up real-time order tracking numbers & shipping updates",
      "Smart human handoff protocol when an inquiry requires senior staff intervention"
    ],
    outcome: "Autonomously resolved 74% of common customer support tickets with 4.8/5 CSAT rating",
    technologies: ["LangChain", "OpenAI API", "Pinecone Vector DB", "Node.js", "Next.js"],
    demoUrl: "https://example.com/nexus-ai",
    slug: "nexus-agent-ai"
  },
  {
    id: "docu-mind",
    title: "DocuMind Intelligent Contract Analysis AI",
    category: "ai",
    categoryLabel: "Agentic AI",
    year: "2024",
    role: "AI Full-Stack Developer",
    tagline: "Document intelligence agent that extracts key legal terms & risk factors from PDFs",
    description: "Developed an AI document workflow agent for legal and real estate teams. Automatically scans uploaded vendor agreements, highlights risky liability clauses, and generates executive summaries.",
    features: [
      "Instant PDF document drag-and-drop analysis with clause-by-clause risk scoring",
      "Interactive Q&A chat allowing lawyers to ask plain-English questions about 100-page agreements",
      "Automated summary export with extracted key renewal dates, payment terms & liabilities"
    ],
    outcome: "Reduced legal review turnaround from 3 days to under 15 minutes per agreement",
    technologies: ["Python", "FastAPI", "Next.js 16", "OpenAI Embeddings", "Tailwind CSS"],
    demoUrl: "https://example.com/documind",
    slug: "documind-contract-ai"
  }
];

export const SERVICES_DATA: Service[] = [
  {
    id: "website-development",
    title: "Website Development",
    tagline: "High-converting, ultra-fast business websites built to turn visitors into clients.",
    description: "Custom-crafted modern websites engineered for speed, mobile responsiveness, and high conversion rates. Built from scratch with clean code, sub-second page loads, and zero bloated templates.",
    idealFor: "Founders & businesses needing a fast, high-converting digital presence",
    deliverables: [
      "Pixel-perfect responsive design across mobile, tablet & desktop",
      "Sub-second load times with 98+ Google PageSpeed Core Web Vitals",
      "Interactive lead-capture forms, booking systems & WhatsApp triggers",
      "Complete on-page SEO setup, meta tags & production domain launch"
    ],
    technologies: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Vercel"],
    turnaround: "1 - 3 weeks",
    highlight: "High Demand"
  },
  {
    id: "ecommerce-development",
    title: "Ecommerce Website Development",
    tagline: "Frictionless online storefronts engineered to maximize sales & average order value.",
    description: "Headless and custom e-commerce stores designed to give your customers an ultra-fast shopping experience. Features streamlined checkouts, automated inventory management, and zero lag.",
    idealFor: "Brands and retailers wanting to sell products online with higher conversion rates",
    deliverables: [
      "Custom product catalog, collections & category filter architecture",
      "1-Click slide-over cart with instant Stripe / PayPal / Apple Pay checkout",
      "Automated order confirmation emails & customer order history dashboard",
      "Inventory management, promo codes & conversion rate optimization"
    ],
    technologies: ["Shopify Liquid", "Next.js Commerce", "Stripe API", "Tailwind CSS", "Zustand"],
    turnaround: "2 - 4 weeks",
    highlight: "Conversion Focused"
  },
  {
    id: "wordpress-development",
    title: "WordPress Site Development",
    tagline: "Tailor-made, easy-to-edit WordPress platforms without sluggish page builders.",
    description: "Bespoke WordPress architectures engineered for business owners. I create clean, secure custom themes and intuitive admin dashboards so your team can easily update content without touching a line of code.",
    idealFor: "Content teams, e-commerce stores & brands wanting no-code content management",
    deliverables: [
      "Custom WordPress theme & modern Gutenberg block system",
      "Intuitive client control panel with custom fields (ACF Pro)",
      "Speed optimization: Caching, image CDN & sub-second loading",
      "Complete security hardening, automated backups & SSL setup"
    ],
    technologies: ["WordPress", "PHP 8", "Custom Gutenberg", "ACF Pro", "MySQL", "Tailwind"],
    turnaround: "1 - 3 weeks"
  },
  {
    id: "app-development",
    title: "App & Web Application Development",
    tagline: "Custom interactive web applications, client portals & operational software tools.",
    description: "Robust full-stack web applications tailored to your business operations. From interactive customer portals to dispatch dashboards, I build scalable software that automates manual work.",
    idealFor: "Startups, logistics firms & companies needing custom workflow software",
    deliverables: [
      "Full-stack web application with secure user authentication (JWT/OAuth)",
      "Interactive real-time dashboards, data tables & live filters",
      "Custom REST / GraphQL APIs integrated with third-party tools",
      "Scalable database architecture (PostgreSQL/MongoDB) with automated migrations"
    ],
    technologies: ["React 19", "Next.js", "Node.js", "Express", "PostgreSQL", "Prisma"],
    turnaround: "3 - 6 weeks",
    highlight: "Full-Stack"
  },
  {
    id: "product-engineering",
    title: "SaaS Product Engineering",
    tagline: "Turning product ideas and MVPs into scalable, market-ready SaaS applications.",
    description: "End-to-end MVP engineering for founders. I handle architecture, database design, subscription billing with Stripe, multi-tenant setups, and smooth user onboarding from day one.",
    idealFor: "Founders looking to launch an MVP or redesign an existing SaaS platform",
    deliverables: [
      "Full MVP software architecture built for scale & easy feature expansion",
      "Stripe recurring billing, tiered pricing plans & client billing portal",
      "Role-based access control (RBAC), team workspaces & audit logs",
      "CI/CD deployment pipeline on AWS or Vercel with zero-downtime releases"
    ],
    technologies: ["Next.js App Router", "TypeScript", "Tailwind CSS", "Stripe Billing", "Supabase", "AWS"],
    turnaround: "4 - 8 weeks"
  },
  {
    id: "agentic-ai",
    title: "Agentic AI & Workflow Automation",
    tagline: "Autonomous AI agents and smart automations that eliminate manual repetitive work.",
    description: "Integrate powerful LLMs and autonomous agents directly into your business. From intelligent document processing to 24/7 customer support agents that interact with your company database.",
    idealFor: "Businesses wanting to automate support, data extraction & operational workflows",
    deliverables: [
      "Custom autonomous AI agent trained on your company knowledge base",
      "Semantic vector search (RAG) for instant document & contract intelligence",
      "Automated webhooks connecting AI with your CRM, Slack & WhatsApp",
      "Guardrails & fallback protocols ensuring zero hallucinations & high reliability"
    ],
    technologies: ["OpenAI API", "Anthropic Claude", "LangChain", "Pinecone", "Python", "Node.js"],
    turnaround: "2 - 4 weeks",
    highlight: "Cutting-Edge"
  }
];
