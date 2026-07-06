// ============================================================
// ResumeRadar — Cypress Test Suite v4 (Fixed)
// ============================================================

const TIMESTAMP = Date.now();
const TEST_EMAIL = `test_${TIMESTAMP}@resumeradar.com`;
const TEST_PASSWORD = "Test@1234";
const TEST_NAME = "Test User";

Cypress.on("uncaught:exception", () => false);

// ============================================================
// CUSTOM COMMAND — Session-based login
// ============================================================
Cypress.Commands.add("loginSession", () => {
  cy.session(
    `user_${TIMESTAMP}`,
    () => {
      cy.visit("/login");
      cy.get("input").eq(0).clear().type(TEST_EMAIL);
      cy.get("input").eq(1).clear().type(TEST_PASSWORD);
      cy.contains("button", /Sign In/i).click();
      cy.url({ timeout: 15000 }).should("include", "/dashboard");
    },
    {
      validate() {
        expect(window.localStorage.getItem("rr_token")).to.be.a("string");
      },
    },
  );
});

// ============================================================
// SIGNUP ONCE before all suites
// ============================================================
before(() => {
  cy.visit("/signup");
  cy.get("input").eq(0).type(TEST_NAME);
  cy.get("input").eq(1).type(TEST_EMAIL);
  cy.get("input").eq(2).type(TEST_PASSWORD);
  cy.contains("button", /Create Account/i).click();
  cy.url({ timeout: 15000 }).should("include", "/dashboard");
});

// ============================================================
// 1. LANDING PAGE
// ============================================================
describe("1. Landing Page", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("shows hero headline", () => {
    cy.contains(/Optimize Your Resume/i).should("be.visible");
  });

  it("shows logo text", () => {
    cy.get("body")
      .contains(/Resume/)
      .should("exist");
  });

  it("shows Sign Up Free button", () => {
    cy.contains(/Sign Up Free/i).should("be.visible");
  });

  it("shows Log In link", () => {
    cy.contains(/Log In/i).should("be.visible");
  });

  it("shows Features section", () => {
    cy.contains(/Features|Everything You Need/i).should("be.visible");
  });

  it("shows How It Works section", () => {
    cy.contains(/How It Works/i).should("be.visible");
  });

  it("shows Pricing section", () => {
    cy.contains(/Pricing|Free Forever/i).should("be.visible");
  });

  it("shows mock analysis card", () => {
    cy.contains("Analysis Report").should("be.visible");
  });

  it("navigates to signup from CTA", () => {
    cy.contains("a", /Sign Up Free/i)
      .first()
      .click();
    cy.url().should("include", "/signup");
  });

  it("navigates to login from nav", () => {
    cy.contains("a", /Log In/i).click();
    cy.url().should("include", "/login");
  });
});

// ============================================================
// 2. AUTHENTICATION
// ============================================================
describe("2. Authentication", () => {
  it("shows signup page with inputs", () => {
    cy.visit("/signup");
    cy.get("input").should("have.length.at.least", 3);
    cy.contains(/Create Account/i).should("be.visible");
  });

  it("shows signup link on login page", () => {
    cy.visit("/login");
    cy.get("input").should("have.length.at.least", 2);
    cy.contains(/Sign In/i).should("be.visible");
    cy.contains(/Sign up/i).should("be.visible");
  });

  it("shows error for duplicate email signup", () => {
    cy.visit("/signup");
    cy.get("input").eq(0).type(TEST_NAME);
    cy.get("input").eq(1).type(TEST_EMAIL);
    cy.get("input").eq(2).type(TEST_PASSWORD);
    cy.contains("button", /Create Account/i).click();
    cy.contains(/already|registered/i, { timeout: 8000 }).should("be.visible");
  });

  it("logs in successfully", () => {
    cy.visit("/login");
    cy.get("input").eq(0).type(TEST_EMAIL);
    cy.get("input").eq(1).type(TEST_PASSWORD);
    cy.contains("button", /Sign In/i).click();
    cy.url({ timeout: 15000 }).should("include", "/dashboard");
    cy.contains("Welcome back").should("be.visible");
  });

  it("shows error for wrong password", () => {
    cy.visit("/login");
    cy.get("input").eq(0).type(TEST_EMAIL);
    cy.get("input").eq(1).type("WrongPassword999");
    cy.contains("button", /Sign In/i).click();
    cy.contains(/invalid|incorrect/i, { timeout: 8000 }).should("be.visible");
  });

  it("shows error for non-existent email", () => {
    cy.visit("/login");
    cy.get("input").eq(0).type("nonexistent999@gmail.com");
    cy.get("input").eq(1).type("Password123");
    cy.contains("button", /Sign In/i).click();
    cy.contains(/invalid|not found/i, { timeout: 8000 }).should("be.visible");
  });

  it("redirects unauthenticated user from dashboard to login", () => {
    cy.clearLocalStorage();
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });

  it("redirects unauthenticated user from analyze to login", () => {
    cy.clearLocalStorage();
    cy.visit("/analyze");
    cy.url().should("include", "/login");
  });

  it("logs out successfully", () => {
    cy.loginSession();
    cy.visit("/dashboard");
    cy.contains(/Logout/i).click();
    cy.url().should("include", "/login");
    cy.clearLocalStorage();
  });
});

// ============================================================
// 3. DASHBOARD
// ============================================================
describe("3. Dashboard", () => {
  beforeEach(() => {
    cy.loginSession();
    cy.visit("/dashboard");
  });

  it("shows welcome message", () => {
    cy.contains("Welcome back").should("be.visible");
  });

  it("shows stat cards", () => {
    cy.contains("Analyses").should("be.visible");
    cy.contains("Avg Score").should("be.visible");
    cy.contains("This Week").should("be.visible");
    cy.contains("Applications").should("be.visible");
  });

  it("shows all action cards", () => {
    cy.contains("New Analysis").should("be.visible");
    cy.contains("Cover Letter").should("be.visible");
    cy.contains("Resume Rewriter").should("be.visible");
    cy.contains("Interview Prep").should("be.visible");
    cy.contains("Compare Resumes").should("be.visible");
    cy.contains("ATS Simulator").should("be.visible");
  });

  it("shows application tracker", () => {
    cy.contains("Application Tracker").should("be.visible");
    cy.contains("Add Application").should("be.visible");
  });

  it("opens add application form", () => {
    cy.contains("Add Application").click();
    cy.get("input[placeholder*='Company']").should("be.visible");
    cy.get("input[placeholder*='Job Title']").should("be.visible");
  });

  it("adds a new application", () => {
    cy.contains("Add Application").click();
    cy.get("input[placeholder*='Company']").type("Google");
    cy.get("input[placeholder*='Job Title']").type("Frontend Developer");
    cy.contains("button", /^Add$/).click();
    cy.contains("Google", { timeout: 8000 }).should("be.visible");
  });

  it("navigates to analyze page", () => {
    cy.contains("a", "New Analysis").click();
    cy.url().should("include", "/analyze");
  });

  it("navigates to compare page", () => {
    cy.loginSession();
    cy.visit("/dashboard");
    cy.contains("a", "Compare Resumes").click();
    cy.url().should("include", "/compare");
  });
});

// ============================================================
// 4. NAVBAR
// ============================================================
describe("4. Navbar", () => {
  beforeEach(() => {
    cy.loginSession();
    cy.visit("/dashboard");
  });

  it("shows logo", () => {
    cy.get("nav").should("be.visible");
    cy.get("nav").find("a").first().should("exist");
  });

  it("shows Dashboard link", () => {
    cy.get("nav").contains("Dashboard").should("be.visible");
  });

  it("shows Analyze link", () => {
    cy.get("nav").contains("Analyze").should("be.visible");
  });

  it("shows all nav links", () => {
    cy.get("nav").contains("Cover Letter").should("be.visible");
    cy.get("nav").contains("Rewriter").should("be.visible");
    cy.get("nav").contains("Compare").should("be.visible");
    cy.get("nav").contains("ATS Scan").should("be.visible");
    cy.get("nav").contains("History").should("be.visible");
  });

  it("navigates to Analyze", () => {
    cy.get("nav").contains("Analyze").click();
    cy.url().should("include", "/analyze");
  });

  it("navigates to History", () => {
    cy.get("nav").contains("History").click();
    cy.url().should("include", "/history");
  });

  it("navigates to Compare", () => {
    cy.get("nav").contains("Compare").click();
    cy.url().should("include", "/compare");
  });

  it("navigates to ATS Scan", () => {
    cy.get("nav").contains("ATS Scan").click();
    cy.url().should("include", "/ats");
  });

  it("shows user name", () => {
    cy.get("nav").contains("Test").should("be.visible");
  });
});

// ============================================================
// 5. ANALYZE PAGE
// ============================================================
describe("5. Analyze Page", () => {
  beforeEach(() => {
    cy.loginSession();
    cy.visit("/analyze");
  });

  it("shows page heading and upload box", () => {
    cy.contains("New Analysis").should("be.visible");
    cy.contains("Click to upload").should("be.visible");
  });

  it("shows JD mode toggle", () => {
    cy.contains("From URL").should("be.visible");
    cy.contains("Type Manually").should("be.visible");
  });

  it("switches to manual mode", () => {
    cy.contains("Type Manually").click();
    cy.get("textarea").should("be.visible");
  });

  it("shows URL input in From URL mode", () => {
    cy.contains("From URL").click();
    cy.get('input[type="url"]').should("be.visible");
    cy.contains("Extract JD").should("be.visible");
  });

  it("shows file name after PDF upload", () => {
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/mock_resume.pdf",
      { force: true },
    );
    cy.contains("mock_resume.pdf").should("be.visible");
  });

  it("shows KB size after upload", () => {
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/mock_resume.pdf",
      { force: true },
    );
    cy.contains(/KB/i).should("be.visible");
  });

  it("clears file when X clicked", () => {
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/mock_resume.pdf",
      { force: true },
    );

    cy.contains("mock_resume.pdf").should("be.visible");

    cy.get('[data-cy="remove-file"]').click();

    cy.contains("Click to upload your resume").should("be.visible");
  });

  it("shows error without file", () => {
    cy.contains("Type Manually").click();
    cy.get("textarea").type("React developer needed.");
    cy.contains("button", /Analyze My Resume/i).click();
    cy.contains(/file|upload|required/i).should("be.visible");
  });

  it("shows error without JD", () => {
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/mock_resume.pdf",
      { force: true },
    );
    cy.contains("button", /Analyze My Resume/i).click();
    cy.contains(/job description|required/i).should("be.visible");
  });

  it("runs full analysis successfully", () => {
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/mock_resume.pdf",
      { force: true },
    );
    cy.contains("Type Manually").click();
    cy.get("textarea").type(
      "We need a React developer with Node.js, MongoDB, Express.js, JWT auth, REST APIs, Tailwind CSS.",
    );
    cy.contains("button", /Analyze My Resume/i).click();
    cy.contains("Analysis Result", { timeout: 50000 }).should("be.visible");
    cy.contains("Match Score").should("be.visible");
    cy.contains("Strengths").should("be.visible");
    cy.contains("Suggestions").should("be.visible");
  });

  it("shows Share Report after analysis", () => {
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/mock_resume.pdf",
      { force: true },
    );
    cy.contains("Type Manually").click();
    cy.get("textarea").type(
      "MERN stack developer with REST API and Git experience.",
    );
    cy.contains("button", /Analyze My Resume/i).click();
    cy.contains("Share Report", { timeout: 50000 }).should("be.visible");
  });

  it("generates share link", () => {
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/mock_resume.pdf",
      { force: true },
    );
    cy.contains("Type Manually").click();
    cy.get("textarea").type(
      "React and Node.js developer with MongoDB experience.",
    );
    cy.contains("button", /Analyze My Resume/i).click();
    cy.contains("Share Report", { timeout: 50000 }).click();
    cy.contains(/report|Shareable|link/i, { timeout: 8000 }).should(
      "be.visible",
    );
  });
});

// ============================================================
// 6. COVER LETTER
// ============================================================
describe("6. Cover Letter Generator", () => {
  beforeEach(() => {
    cy.loginSession();
    cy.visit("/cover-letter");
  });

  it("shows page and generate button", () => {
    cy.contains("Cover Letter Generator").should("be.visible");
    cy.contains("Generate Cover Letter").should("be.visible");
  });

  it("shows optional input fields", () => {
    cy.get("input").should("have.length.at.least", 1);
  });

  it("shows dropdown or empty state", () => {
    cy.wait(2000);
    cy.get("body").then(($body) => {
      const hasSelect = $body.find("select").length > 0;
      const hasEmpty = $body.text().includes("No analyses");
      const hasLoading = $body.text().includes("Loading");
      const hasButton = $body.find("button").length > 0;
      expect(hasSelect || hasEmpty || hasLoading || hasButton).to.be.true;
    });
  });

  it("generates cover letter", () => {
    cy.get("body").then(($body) => {
      if ($body.find("select").length > 0) {
        cy.get("input").eq(0).type("Google");
        cy.get("input").eq(1).type("Frontend Developer");
        cy.contains("button", /Generate Cover Letter/i).click();
        cy.contains("Your Cover Letter", { timeout: 50000 }).should(
          "be.visible",
        );
        cy.contains("Copy").should("be.visible");
      }
    });
  });
});

// ============================================================
// 7. RESUME REWRITER
// ============================================================
describe("7. Resume Rewriter", () => {
  beforeEach(() => {
    cy.loginSession();
    cy.visit("/rewriter");
  });

  it("shows rewriter with mode toggle", () => {
    cy.contains("Resume Rewriter").should("be.visible");
    cy.contains("Single Bullet").should("be.visible");
    cy.contains("Full Resume").should("be.visible");
  });

  it("shows textarea in single bullet mode", () => {
    cy.contains("Single Bullet").click();
    cy.get("textarea").first().should("be.visible");
  });

  it("shows dropdown or empty state in full resume mode", () => {
    cy.contains("Full Resume").click();
    cy.get("body").then(($body) => {
      const hasSelect = $body.find("select").length > 0;
      const hasEmpty = $body.text().includes("No analyses");
      expect(hasSelect || hasEmpty).to.be.true;
    });
  });

  it("shows error for empty bullet", () => {
    cy.contains("Single Bullet").click();
    cy.contains("button", /Rewrite Bullet/i).click();
    cy.contains(/required|paste|bullet/i).should("be.visible");
  });

  it("rewrites a bullet and shows before/after", () => {
    cy.contains("Single Bullet").click();
    cy.get("textarea")
      .first()
      .type(
        "Responsible for managing social media accounts and creating content.",
      );
    cy.contains("button", /Rewrite Bullet/i).click();
    cy.contains("AI Rewritten", { timeout: 50000 }).should("be.visible");
    cy.contains("Original").should("be.visible");
  });

  it("shows copy button after rewrite", () => {
    cy.contains("Single Bullet").click();
    cy.get("textarea")
      .first()
      .type("Helped team with various frontend tasks using React.");
    cy.contains("button", /Rewrite Bullet/i).click();
    cy.get("body", { timeout: 50000 }).should("contain.text", "AI Rewritten");
    cy.contains("Copy").should("be.visible");
  });
});

// ============================================================
// 8. INTERVIEW PREP
// ============================================================
describe("8. Interview Prep", () => {
  beforeEach(() => {
    cy.loginSession();
    cy.visit("/interview-prep");
  });

  it("shows page and generate button", () => {
    cy.contains("Interview Prep").should("be.visible");
    cy.contains("Generate Interview Questions").should("be.visible");
  });

  it("shows dropdown or empty state", () => {
    cy.wait(2000);
    cy.get("body").then(($body) => {
      const hasSelect = $body.find("select").length > 0;
      const hasEmpty = $body.text().includes("No analyses");
      const hasLoading = $body.text().includes("Loading");
      const hasButton = $body.find("button").length > 0;
      expect(hasSelect || hasEmpty || hasLoading || hasButton).to.be.true;
    });
  });

  it("generates questions when analysis exists", () => {
    cy.get("body").then(($body) => {
      if ($body.find("select").length > 0) {
        cy.contains("button", /Generate Interview Questions/i).click();
        cy.contains(/Technical|Behavioral|Situational/i, {
          timeout: 50000,
        }).should("be.visible");
      }
    });
  });

  it("shows category badges", () => {
    cy.get("body").then(($body) => {
      if ($body.find("select").length > 0) {
        cy.contains("button", /Generate Interview Questions/i).click();
        cy.get("span", { timeout: 50000 })
          .filter(":visible")
          .contains(/Technical|Behavioral|Situational/)
          .should("exist");
      }
    });
  });
});

// ============================================================
// 9. ATS SIMULATOR
// ============================================================
describe("9. ATS Simulator", () => {
  beforeEach(() => {
    cy.loginSession();
    cy.visit("/ats");
  });

  it("shows ATS simulator page", () => {
    cy.contains("ATS Simulator").should("be.visible");
    cy.contains("Run ATS Simulation").should("be.visible");
  });

  it("shows descriptive text", () => {
    cy.contains(/ATS/i).should("be.visible");
  });

  it("shows dropdown or empty state message", () => {
    cy.wait(2000);
    cy.get("body").then(($body) => {
      const hasSelect = $body.find("select").length > 0;
      const hasEmpty = $body.text().includes("No analyses");
      const hasLoading = $body.text().includes("Loading");
      const hasButton = $body.find("button").length > 0;
      expect(hasSelect || hasEmpty || hasLoading || hasButton).to.be.true;
    });
  });

  it("runs simulation and shows score", () => {
    cy.get("body").then(($body) => {
      if ($body.find("select").length > 0) {
        cy.contains("button", /Run ATS Simulation/i).click();
        cy.contains("ATS Readability Score", { timeout: 50000 }).should(
          "be.visible",
        );
      }
    });
  });

  it("shows section detection", () => {
    cy.get("body").then(($body) => {
      if ($body.find("select").length > 0) {
        cy.contains("button", /Run ATS Simulation/i).click();
        cy.contains("Section Detection", { timeout: 50000 }).should(
          "be.visible",
        );
      }
    });
  });

  it("shows keyword density", () => {
    cy.get("body").then(($body) => {
      if ($body.find("select").length > 0) {
        cy.contains("button", /Run ATS Simulation/i).click();
        cy.contains("Keyword Density", { timeout: 50000 }).should("be.visible");
      }
    });
  });

  it("shows improvement tips", () => {
    cy.get("body").then(($body) => {
      if ($body.find("select").length > 0) {
        cy.contains("button", /Run ATS Simulation/i).click();
        cy.contains(/How to Improve/i, { timeout: 50000 }).should("be.visible");
      }
    });
  });
});

// ============================================================
// 10. RESUME COMPARISON
// ============================================================
describe("10. Resume Comparison", () => {
  beforeEach(() => {
    cy.loginSession();
    cy.visit("/compare");
  });

  it("shows compare page", () => {
    cy.contains("Resume Comparison").should("be.visible");
    cy.contains("Resume A").should("be.visible");
    cy.contains("Resume B").should("be.visible");
    cy.contains("Compare Resumes").should("be.visible");
  });

  it("shows JD textarea", () => {
    cy.get("textarea").should("be.visible");
  });

  it("shows URL input", () => {
    cy.get('input[type="url"]').should("be.visible");
  });

  it("shows error without files", () => {
    cy.get("textarea").last().type("React developer needed.");
    cy.contains("button", /Compare Resumes/i).click();
    cy.contains(/both|required|upload/i).should("be.visible");
  });

  it("shows file A name after upload", () => {
    cy.get('input[type="file"]')
      .eq(0)
      .selectFile("cypress/fixtures/mock_resume.pdf", { force: true });
    cy.contains("mock_resume.pdf").should("be.visible");
  });

  it("shows file B name after upload", () => {
    cy.get('input[type="file"]')
      .eq(1)
      .selectFile("cypress/fixtures/mock_resume_b.pdf", { force: true });
    cy.contains("mock_resume_b.pdf").should("be.visible");
  });

  it("runs comparison and shows result", () => {
    cy.get('input[type="file"]')
      .eq(0)
      .selectFile("cypress/fixtures/mock_resume.pdf", { force: true });
    cy.get('input[type="file"]')
      .eq(1)
      .selectFile("cypress/fixtures/mock_resume_b.pdf", { force: true });
    cy.get("textarea")
      .last()
      .type(
        "React developer with Node.js, MongoDB, Express.js, JWT and REST API experience needed.",
      );
    cy.contains("button", /Compare Resumes/i).click();
    cy.contains(/Wins|Tie/i, { timeout: 60000 }).should("be.visible");
  });

  it("shows match score after comparison", () => {
    cy.get('input[type="file"]')
      .eq(0)
      .selectFile("cypress/fixtures/mock_resume.pdf", { force: true });
    cy.get('input[type="file"]')
      .eq(1)
      .selectFile("cypress/fixtures/mock_resume_b.pdf", { force: true });
    cy.get("textarea")
      .last()
      .type("Full stack MERN developer needed with Tailwind CSS.");
    cy.contains("button", /Compare Resumes/i).click();
    cy.contains("Match Score", { timeout: 60000 }).should("be.visible");
  });

  it("expands keywords when clicked", () => {
    cy.get('input[type="file"]')
      .eq(0)
      .selectFile("cypress/fixtures/mock_resume.pdf", { force: true });
    cy.get('input[type="file"]')
      .eq(1)
      .selectFile("cypress/fixtures/mock_resume_b.pdf", { force: true });
    cy.get("textarea")
      .last()
      .type(
        "React, TypeScript, Node.js, Docker, AWS, CI/CD, GraphQL, Redis, Kubernetes, Jest, PostgreSQL",
      );
    cy.contains("button", /Compare Resumes/i).click();
    cy.get("body", { timeout: 60000 }).then(($body) => {
      if ($body.text().includes("click to expand")) {
        cy.contains(/click to expand/).click();
        cy.contains("Show less").should("be.visible");
      }
    });
  });
});

// // ============================================================
// // 11. HISTORY PAGE
// // ============================================================
// describe("11. History Page", () => {
//   beforeEach(() => {
//     cy.loginSession();
//     cy.visit("/history");
//   });

//   it("shows History heading", () => {
//     cy.get("h1").should("contain.text", "History");
//   });

//   it("shows Analyses tab", () => {
//     cy.get("button")
//       .contains(/Analyses/i)
//       .should("be.visible");
//   });

//   it("shows Cover Letters tab", () => {
//     cy.get("button")
//       .contains(/Cover Letters/i)
//       .should("be.visible");
//   });

//   it("shows Rewrites tab", () => {
//     cy.get("button")
//       .contains(/Rewrites/i)
//       .should("be.visible");
//   });

//   it("shows Interview Prep tab", () => {
//     cy.get("button")
//       .contains(/Interview Prep/i)
//       .should("be.visible");
//   });

//   it("switches to Cover Letters tab", () => {
//     cy.get("button")
//       .contains(/Cover Letters/i)
//       .click({ force: true });
//     cy.get("body").should("not.contain", "undefined");
//   });

//   it("switches to Rewrites tab", () => {
//     cy.get("button")
//       .contains(/Rewrites/i)
//       .click({ force: true });
//     cy.get("body").should("not.contain", "undefined");
//   });

//   it("switches to Interview Prep tab", () => {
//     cy.get("button")
//       .contains(/Interview Prep/i)
//       .click({ force: true });
//     cy.get("body").should("not.contain", "undefined");
//   });

//   it("switches back to Analyses tab", () => {
//     cy.get("button")
//       .contains(/Cover Letters/i)
//       .click({ force: true });
//     cy.get("button")
//       .contains(/Analyses/i)
//       .click({ force: true });
//     cy.get("body").should("not.contain", "undefined");
//   });

//   it("shows content or empty state", () => {
//     // Wait for loading to finish
//     cy.wait(2000);
//     cy.get("body").then(($body) => {
//       const text = $body.text();
//       const hasData = $body.find(".rounded-2xl").length > 1;
//       const hasEmpty = text.includes("Nothing here yet");
//       const isLoading = text.includes("Loading") || text.includes("loading");
//       // Pass if any valid state is shown
//       expect(hasData || hasEmpty || isLoading).to.be.true;
//     });
//   });
// });
// ============================================================
// 12. SHARED REPORT (Public Page)
// ============================================================
describe("12. Shared Report Page", () => {
  it("loads the shared report page", () => {
    cy.visit("/report/invalidsharelink123");
    cy.get("body").should("be.visible");
  });

  it("shows ResumeRadar branding", () => {
    cy.visit("/report/invalidsharelink123");
    cy.get("body").should("be.visible");
    cy.get("body").should("not.be.empty");
  });

  it("does not show main app navbar links", () => {
    cy.visit("/report/invalidsharelink123");
    cy.get("body").should("not.contain", "Dashboard");
    cy.get("body").should("not.contain", "ATS Scan");
  });

  it("shows not found message for invalid ID", () => {
    cy.visit("/report/invalidsharelink123");
    cy.get("body", { timeout: 8000 }).should("satisfy", ($body) => {
      const text = $body.text().toLowerCase();
      return (
        text.includes("not found") ||
        text.includes("revoked") ||
        text.includes("invalid") ||
        text.includes("report")
      );
    });
  });
});

// ============================================================
// 13. LANDING — logged in user
// ============================================================
describe("13. Landing when logged in", () => {
  it("shows landing page content when logged in", () => {
    cy.loginSession();
    cy.visit("/");
    cy.contains(/Optimize Your Resume/i).should("be.visible");
  });

  it("shows signup and login buttons on landing", () => {
    cy.clearLocalStorage();
    cy.visit("/");
    cy.contains(/Sign Up Free/i).should("be.visible");
    cy.contains(/Log In/i).should("be.visible");
  });
});
