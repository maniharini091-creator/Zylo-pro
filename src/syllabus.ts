export interface SyllabusTopic {
  id: string;
  name: string;
  completed: boolean;
}

export interface SyllabusSubject {
  id: string;
  paperName: string;
  group: 1 | 2;
  marks: number;
  topics: SyllabusTopic[];
}

export const INBUILT_SYLLABUS: SyllabusSubject[] = [
  {
    id: "p1_accounting",
    paperName: "Paper 1: Advanced Accounting",
    group: 1,
    marks: 100,
    topics: [
      { id: "p1_t1", name: "Process of Accounting Standards & Role of NFRA", completed: false },
      { id: "p1_t2", name: "Framework for Preparation & Presentation of FS", completed: false },
      { id: "p1_t3", name: "Applicability of AS (AS 1 to 29)", completed: false },
      { id: "p1_t4", name: "Presentation & Disclosures of Financial Statements", completed: false },
      { id: "p1_t5", name: "Valuation of Inventory (AS 2) & PPE (AS 10)", completed: false },
      { id: "p1_t6", name: "Revenue Recognition (AS 9) & Gov Grants (AS 12)", completed: false },
      { id: "p1_t7", name: "Foreign Exchange (AS 11) & Borrowing Costs (AS 16)", completed: false },
      { id: "p1_t8", name: "Segment Reporting (AS 17) & Related Party (AS 18)", completed: false },
      { id: "p1_t9", name: "Leases (AS 19) & Earnings Per Share (AS 20)", completed: false },
      { id: "p1_t10", name: "Consolidation of Financial Statements (AS 21, 23, 27)", completed: false },
      { id: "p1_t11", name: "Amalgamation, Absorption & Reconstruction", completed: false },
      { id: "p1_t12", name: "Buyback of Securities & Underwriting of Shares", completed: false }
    ]
  },
  {
    id: "p2_law",
    paperName: "Paper 2: Corporate and Other Laws",
    group: 1,
    marks: 100,
    topics: [
      { id: "p2_t1", name: "Preliminary (Definitions under Companies Act, 2013)", completed: false },
      { id: "p2_t2", name: "Incorporation of Company & Incidental Matters", completed: false },
      { id: "p2_t3", name: "Prospectus and Allotment of Securities", completed: false },
      { id: "p2_t4", name: "Share Capital and Debentures", completed: false },
      { id: "p2_t5", name: "Acceptance of Deposits by Companies", completed: false },
      { id: "p2_t6", name: "Registration of Charges", completed: false },
      { id: "p2_t7", name: "Management and Administration (AGM, Resolutions)", completed: false },
      { id: "p2_t8", name: "Declaration and Payment of Dividend", completed: false },
      { id: "p2_t9", name: "Accounts of Companies & CSR", completed: false },
      { id: "p2_t10", name: "Audit and Auditors", completed: false },
      { id: "p2_t11", name: "Companies Incorporated Outside India", completed: false },
      { id: "p2_t12", name: "The General Clauses Act, 1897", completed: false },
      { id: "p2_t13", name: "Interpretation of Statutes & Deeds", completed: false },
      { id: "p2_t14", name: "Foreign Exchange Management Act, 1999 (FEMA)", completed: false }
    ]
  },
  {
    id: "p3_taxation",
    paperName: "Paper 3: Taxation",
    group: 1,
    marks: 100,
    topics: [
      { id: "p3_t1", name: "Income Tax: Basic Concepts & Tax Rates", completed: false },
      { id: "p3_t2", name: "Income Tax: Residence and Scope of Total Income", completed: false },
      { id: "p3_t3", name: "Income Tax: Incomes which do not form part of Total Income", completed: false },
      { id: "p3_t4", name: "Income Tax: Salaries (Heads of Income)", completed: false },
      { id: "p3_t5", name: "Income Tax: Income from House Property", completed: false },
      { id: "p3_t6", name: "Income Tax: Profits and Gains of Business or Profession (PGBP)", completed: false },
      { id: "p3_t7", name: "Income Tax: Capital Gains", completed: false },
      { id: "p3_t8", name: "Income Tax: Income from Other Sources", completed: false },
      { id: "p3_t9", name: "Income Tax: Clubbing of Income & Set-Off / Carry Forward of Losses", completed: false },
      { id: "p3_t10", name: "Income Tax: Deductions from Gross Total Income", completed: false },
      { id: "p3_t11", name: "Income Tax: Computation of Total Income, TDS, TCS & Advance Tax", completed: false },
      { id: "p3_t12", name: "GST: Introduction, Supply Under GST & Charge of GST", completed: false },
      { id: "p3_t13", name: "GST: Exemptions, Place, Time & Value of Supply", completed: false },
      { id: "p3_t14", name: "GST: Input Tax Credit (ITC), Registration & Tax Invoice", completed: false },
      { id: "p3_t15", name: "GST: Accounts, Records, Payment of Tax & Returns", completed: false }
    ]
  },
  {
    id: "p4_costing",
    paperName: "Paper 4: Cost and Management Accounting",
    group: 2,
    marks: 100,
    topics: [
      { id: "p4_t1", name: "Introduction to Cost and Management Accounting", completed: false },
      { id: "p4_t2", name: "Material Cost (EOQ, Inventory Valuation)", completed: false },
      { id: "p4_t3", name: "Employee Cost & Direct Expenses", completed: false },
      { id: "p4_t4", name: "Overheads - Absorption Costing Method", completed: false },
      { id: "p4_t5", name: "Activity Based Costing (ABC Method)", completed: false },
      { id: "p4_t6", name: "Cost Sheet & Cost Accounting Systems", completed: false },
      { id: "p4_t7", name: "Single, Job and Batch Costing", completed: false },
      { id: "p4_t8", name: "Process, Joint and By-Products Costing", completed: false },
      { id: "p4_t9", name: "Service Costing (Operating Costing)", completed: false },
      { id: "p4_t10", name: "Standard Costing & Variance Analysis", completed: false },
      { id: "p4_t11", name: "Marginal Costing & CVP Analysis", completed: false },
      { id: "p4_t12", name: "Budget and Budgetary Control", completed: false }
    ]
  },
  {
    id: "p5_audit",
    paperName: "Paper 5: Auditing and Ethics",
    group: 2,
    marks: 100,
    topics: [
      { id: "p5_t1", name: "Nature, Objective and Scope of Audit", completed: false },
      { id: "p5_t2", name: "Audit Strategy, Planning & Programming", completed: false },
      { id: "p5_t3", name: "Audit Documentation & Evidence (SA 230, 500)", completed: false },
      { id: "p5_t4", name: "Risk Assessment and Internal Control", completed: false },
      { id: "p5_t5", name: "Audit in an Automated Environment", completed: false },
      { id: "p5_t6", name: "Audit Sampling (SA 530)", completed: false },
      { id: "p5_t7", name: "Audit of Items of Financial Statements", completed: false },
      { id: "p5_t8", name: "Audit Report & Opinions (SA 700, 701, 705, 706)", completed: false },
      { id: "p5_t9", name: "Special Features of Audit of Different Entities", completed: false },
      { id: "p5_t10", name: "Audit of Banks (Statutory & Concurrent)", completed: false },
      { id: "p5_t11", name: "Professional Ethics & Code of Conduct", completed: false }
    ]
  },
  {
    id: "p6_fmsm",
    paperName: "Paper 6: Financial Management & Strategic Management",
    group: 2,
    marks: 100,
    topics: [
      { id: "p6_t1", name: "FM: Scope and Objectives of FM", completed: false },
      { id: "p6_t2", name: "FM: Types of Financing (Equity, Debt, Lease)", completed: false },
      { id: "p6_t3", name: "FM: Ratio Analysis & Financial Planning", completed: false },
      { id: "p6_t4", name: "FM: Cost of Capital (WACC, Marginal)", completed: false },
      { id: "p6_t5", name: "FM: Capital Structure Decisions & Theories", completed: false },
      { id: "p6_t6", name: "FM: Leverages (Operating, Financial, Combined)", completed: false },
      { id: "p6_t7", name: "FM: Capital Budgeting & Investment Decisions", completed: false },
      { id: "p6_t8", name: "FM: Dividend Decisions & Models", completed: false },
      { id: "p6_t9", name: "FM: Working Capital Management", completed: false },
      { id: "p6_t10", name: "SM: Introduction to Strategic Management", completed: false },
      { id: "p6_t11", name: "SM: Strategic Analysis - External Environment", completed: false },
      { id: "p6_t12", name: "SM: Strategic Analysis - Internal Environment", completed: false },
      { id: "p6_t13", name: "SM: Strategic Choices & Corporate Levels", completed: false },
      { id: "p6_t14", name: "SM: Strategy Implementation and Control", completed: false }
    ]
  }
];

export interface StudyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  targetDate: string;
  priority: "High" | "Medium" | "Low";
  status: "To Do" | "In Progress" | "Completed" | "Under Revision";
  notes?: string;
}

export interface UserLogin {
  name: string;
  identifier: string; // Email ID or Mobile number
  targetAttempt: string; // September 2026 attempt
}
