export const profile = {
  fullName: "Mohit Nandan",
  email: "mohitnandan81825@gmail.com",
  phone: "9140151251",
  location: {
    city: "Kanpur",
    state: "Uttar Pradesh",
    country: "India",
    willingToRelocate: true,
  },
  linkedin: "https://linkedin.com/in/mohit-nandan-9982831a1",
  github: "https://github.com/mohit03nandan",

  education: {
    degree: "B.Tech Information Technology",
    institute: "Harcourt Butler Technology University, Kanpur",
    graduationYear: 2025,
    cgpa: 8.36,
  },

  currentRole: {
    title: "SDET - 1",
    company: "Infinite Locus Private Limited",
    location: "Gurugram",
    startedOn: "2025-03",
  },

  yearsOfExperience: 1.5,

  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "Java"],
    automation: ["Cypress", "Playwright", "Appium", "WebDriverIO"],
    api: ["Postman", "Newman", "REST Assured", "k6", "Grafana"],
    cicd: ["GitHub Actions", "Git", "Jira"],
    testingTypes: ["Automation", "Functional", "Regression", "API", "Mobile", "Performance"],
    platforms: ["Web", "MWeb", "Android", "iOS"],
    databases: ["MySQL"],
  },

  strengths: [
    "1000+ DSA problems solved (Leetcode, GFG, Codeforces)",
    "End-to-end test strategy ownership across web + mobile + API",
    "Built Cypress + Appium frameworks from scratch",
    "GitHub Actions CI/CD pipelines with parallel test execution",
  ],
} as const;

export type Profile = typeof profile;
