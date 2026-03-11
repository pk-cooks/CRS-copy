/**
 * Stores one "primary career opportunity" per completed course.
 * Shape: { [courseId: number]: { role: string; description: string } }
 */
const STORAGE_KEY = "learnedCareers";

export interface CareerEntry {
  role: string;
  description: string;
}

type LearnedCareersMap = Record<number, CareerEntry>;

export const getLearnedCareersMap = (): LearnedCareersMap => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

/**
 * Returns a deduplicated list of career entries across all completed courses.
 * Deduplication is by role name so the same role doesn't appear twice.
 */
export const getLearnedCareers = (): CareerEntry[] => {
  const map = getLearnedCareersMap();
  const seen = new Set<string>();
  const result: CareerEntry[] = [];
  for (const entry of Object.values(map)) {
    if (!seen.has(entry.role)) {
      seen.add(entry.role);
      result.push(entry);
    }
  }
  return result;
};

/** Called when a course is marked completed. */
export const addLearnedCareer = (courseId: number, career: CareerEntry): void => {
  if (!career.role) return;
  const map = getLearnedCareersMap();
  map[courseId] = career;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

/** Called when a course is unmarked — removes that course's career contribution. */
export const removeLearnedCareer = (courseId: number): void => {
  const map = getLearnedCareersMap();
  delete map[courseId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

/**
 * Unique, skill-specific career descriptions.
 * Each entry is tailored to what that role actually does.
 */
const SKILL_DESCRIPTIONS: Record<string, string> = {
  // Databases
  "SQL":            "Design and query relational databases to power data-driven applications and optimise complex reporting pipelines.",
  "PostgreSQL":     "Work with advanced relational databases for transactional systems, analytics, and high-consistency production workloads.",
  "MySQL":          "Build and maintain structured databases for web applications, e-commerce platforms, and business intelligence systems.",
  "MongoDB":        "Architect flexible NoSQL databases for scalable, document-oriented applications and real-time data workloads.",
  "Redis":          "Build ultra-fast caching layers, real-time leaderboards, and pub/sub messaging systems using in-memory data structures.",
  "Elasticsearch":  "Implement distributed full-text search, log analytics, and observability pipelines across large-scale datasets.",
  "Cassandra":      "Design fault-tolerant, distributed databases built for high write-throughput and global scalability.",

  // Programming Languages
  "Python":         "Develop automation scripts, data pipelines, backend APIs, and ML models using one of the world's most versatile languages.",
  "JavaScript":     "Create dynamic, interactive web experiences and full-stack applications across the entire modern web ecosystem.",
  "TypeScript":     "Write safer, self-documenting code with static typing for large-scale frontend and backend applications.",
  "Java":           "Build enterprise-grade backend systems, microservices, and Android applications with one of the most battle-tested languages.",
  "Go":             "Develop blazing-fast, concurrent backend services and CLI tools for cloud-native and systems-level engineering.",
  "Rust":           "Engineer memory-safe, high-performance systems software for infrastructure, game engines, and embedded devices.",
  "C++":            "Write performance-critical software for game development, robotics, graphics engines, and OS-level systems.",
  "Kotlin":         "Build modern Android applications and server-side JVM services with concise, expressive syntax.",
  "Swift":          "Develop polished, high-performance iOS and macOS applications for the Apple ecosystem.",
  "PHP":            "Build dynamic web servers, CMS platforms, and APIs powering a significant share of the global internet.",
  "Ruby":           "Create elegant, developer-friendly web applications and automation tools with a focus on rapid prototyping.",

  // Web & Frontend
  "React":          "Build component-driven, high-performance user interfaces for modern single-page applications at scale.",
  "Vue":            "Develop lightweight, progressive web UIs with an approachable framework ideal for fast iteration.",
  "Angular":        "Engineer enterprise-scale SPAs with a comprehensive framework backed by a powerful CLI and dependency injection.",
  "HTML":           "Structure semantic, accessible web content that forms the backbone of every website and web application.",
  "CSS":            "Craft polished visual designs, responsive layouts, and micro-animations that elevate user experience.",
  "Node.js":        "Develop scalable server-side applications, REST APIs, and real-time services entirely in JavaScript.",
  "Next.js":        "Ship production-ready full-stack React applications with SSR, SSG, and edge deployment out of the box.",

  // DevOps & Cloud
  "Docker":         "Containerise and ship applications consistently from development through production with platform-independent builds.",
  "Kubernetes":     "Orchestrate containerised workloads at scale, enabling auto-scaling, self-healing, and zero-downtime deployments.",
  "AWS":            "Architect and deploy resilient, cost-optimised cloud infrastructure across compute, storage, and networking on Amazon Web Services.",
  "Azure":          "Leverage Microsoft's cloud platform to build, deploy, and manage enterprise applications with deep Active Directory integration.",
  "GCP":            "Build scalable cloud solutions using Google's global infrastructure, BigQuery, and AI/ML-native services.",
  "Cloud Computing":"Design and manage scalable cloud infrastructure to deliver highly available, globally distributed applications.",
  "Linux":          "Administer and automate Linux servers that underpin the vast majority of the world's production infrastructure.",
  "Terraform":      "Define and provision cloud infrastructure as code for repeatable, version-controlled environment management.",

  // Data & AI
  "Machine Learning": "Build predictive models and intelligent pipelines that enable systems to learn from data and automate complex decisions.",
  "Deep Learning":    "Design multi-layer neural networks for image recognition, natural language understanding, and generative AI.",
  "Data Analysis":    "Uncover trends, outliers, and insights in complex datasets to inform product decisions and business strategy.",
  "Data Science":     "Apply statistical modelling, ML, and domain knowledge to extract actionable value from raw data at scale.",
  "Statistics":       "Validate hypotheses, run A/B tests, and interpret data confidently using rigorous statistical reasoning.",
  "NLP":              "Build systems that understand, generate, and classify human language for chatbots, search, and summarisation.",
  "TensorFlow":       "Train and deploy machine learning models at production scale using Google's industry-leading open-source framework.",
  "PyTorch":          "Research and prototype cutting-edge deep learning models with a flexible, Pythonic framework favoured in academia.",
  "Joins":            "Master relational data retrieval by combining tables efficiently, the cornerstone of every professional database role.",

  // Networking & Security
  "Cybersecurity":  "Protect systems and data from threats through penetration testing, threat modelling, and security engineering.",
  "Networking":     "Design and troubleshoot reliable, secure network architectures for enterprise and cloud environments.",
};

/**
 * Derives the ONE major career opportunity from a course's first skill.
 * Returns a unique, role-specific title and description.
 */
export const deriveCareer = (skill: string, courseTitle: string): CareerEntry => {
  const role = skill ? `${skill} Specialist` : "Industry Professional";

  // Case-insensitive lookup for the description
  const key = Object.keys(SKILL_DESCRIPTIONS).find(
    (k) => k.toLowerCase() === skill.toLowerCase()
  );

  const description = key
    ? SKILL_DESCRIPTIONS[key]
    : `Leverage your ${skill || courseTitle} skills to build real-world solutions and advance in specialised technology roles.`;

  return { role, description };
};
