export const preferences = {
  targetTitles: [
    "SDET",
    "SDET-1",
    "SDET-2",
    "Software Development Engineer in Test",
    "Test Automation Engineer",
    "QA Automation Engineer",
    "Senior QA Engineer",
    "QA Engineer",
    "SDE-1",
    "Software Engineer",
    "Software Development Engineer",
  ],

  keywordsMustHaveAny: [
    "automation",
    "cypress",
    "playwright",
    "appium",
    "selenium",
    "testing",
    "sdet",
    "quality",
    "typescript",
    "javascript",
  ],

  keywordsExclude: [
    "manual testing only",
    "10+ years",
    "director",
    "principal",
    "staff",
    "unpaid",
    "internship",
    "night shift",
    "us shift",
    "voice process",
    "sales",
  ],

  locations: {
    modes: ["remote", "hybrid", "onsite"] as const,
    preferredCities: [
      "Gurugram",
      "Gurgaon",
      "Delhi",
      "Noida",
      "Bangalore",
      "Bengaluru",
      "Hyderabad",
      "Pune",
      "Mumbai",
      "Chennai",
      "Kanpur",
      "Remote",
    ],
    anyIndianCityOk: true,
  },

  compensation: {
    currentLpa: 9,
    minExpectedLpa: 12,
    idealExpectedLpa: 13,
    negotiable: true,
  },

  experienceRange: {
    minYears: 0,
    maxYears: 4,
    declareYears: 1.5,
  },

  boards: {
    linkedin: true,
    naukri: true,
    instahyre: true,
    wellfound: true,
    cutshort: true,
    indeed: true,
  },

  runtime: {
    maxApplicationsPerRun: 8,
    minFitScoreToApply: 65,
    minFitScoreToSurface: 45,
    delayBetweenAppsMs: [45_000, 120_000] as [number, number],
  },

  excludeCompanies: [
    "Infinite Locus",
  ],
} as const;

export type Preferences = typeof preferences;
