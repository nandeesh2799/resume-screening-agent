"""
Generates 15 realistic, ATS-friendly PDF candidate resumes for ResumeRank.
Uses ReportLab with strict single-column ATS typography, standard headers,
and verified metadata for automated ATS parsers (pdfplumber, pypdf).
"""
import os
import shutil
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

RESUME_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "sample_resumes"

CANDIDATES = [
    {
        "filename": "Resume_Carlos_Mendez_FullStack.pdf",
        "name": "Carlos Mendez",
        "title": "Senior Full Stack Engineer",
        "contact": "carlos.mendez@dev.io | +1 (555) 234-5678 | San Francisco, CA | linkedin.com/in/carlos-mendez",
        "summary": "Results-oriented Senior Full Stack Engineer with 5+ years of professional software development experience architecting scalable distributed systems and high-traffic payment intelligence platforms. Proven track record leading agile engineering squads, building resilient Python (FastAPI/Django) microservices, and crafting reactive TypeScript web applications.",
        "skills": {
            "Languages": "Python, TypeScript, JavaScript, SQL, Bash",
            "Frameworks": "FastAPI, Django, React, Next.js, Node.js, Express",
            "Databases & Cache": "PostgreSQL, Redis, MongoDB, MySQL",
            "Cloud & DevOps": "AWS (EC2, S3, RDS), Docker, Kubernetes, CI/CD (GitHub Actions), Kafka",
            "Practices": "REST API Design, Microservices, Agile/Scrum, Unit Testing (Pytest, Jest)"
        },
        "experience": [
            {
                "role": "Senior Full Stack Engineer",
                "company": "Clip Financial Technologies",
                "dates": "2022 – Present (2 years)",
                "bullets": [
                    "Architected high-throughput payment processing APIs in Python (FastAPI) handling 1.2M daily transactions with 99.99% uptime.",
                    "Engineered real-time merchant analytics dashboard in React with TypeScript and Redis pub/sub streaming.",
                    "Containerized 12 microservices using Docker and orchestrated automated zero-downtime CI/CD deployments on AWS with GitHub Actions.",
                    "Mentored 4 software engineers, conducted code reviews, and championed Test-Driven Development (TDD)."
                ]
            },
            {
                "role": "Software Engineer",
                "company": "Konfio Enterprise Solutions",
                "dates": "2019 – 2022 (3 years)",
                "bullets": [
                    "Developed core loan underwriting service using Django REST Framework and PostgreSQL database clustering.",
                    "Constructed reusable React component UI design system adopted across 3 core product teams.",
                    "Integrated OAuth2, JWT authentication, and Open Banking APIs under strict SOC2 compliance standards."
                ]
            }
        ],
        "education": "Bachelor of Science in Software Engineering — National Autonomous University (UNAM), 2019"
    },
    {
        "filename": "Resume_James_Okafor_Backend.pdf",
        "name": "James Okafor",
        "title": "Senior Backend Systems Engineer",
        "contact": "james.okafor@cloudmail.io | +44 20 7946 0958 | London, UK | github.com/james-okafor",
        "summary": "Senior Backend Engineer with 5+ years of experience designing fault-tolerant distributed backends, RESTful APIs, and event-driven data streaming pipelines. Deep technical expertise in Python (FastAPI, Django), PostgreSQL optimization, Apache Kafka message queues, and AWS Kubernetes infrastructure.",
        "skills": {
            "Core Technologies": "Python, FastAPI, Django, PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, AWS",
            "Architecture": "Microservices, Distributed Systems, Event-Driven Architecture, REST API Design, GraphQL",
            "DevOps & Quality": "CI/CD (GitHub Actions, Jenkins), Terraform, Pytest, Linux Administration"
        },
        "experience": [
            {
                "role": "Senior Backend Developer",
                "company": "Nexus Pay Systems",
                "dates": "2021 – Present (3 years)",
                "bullets": [
                    "Engineered asynchronous payment ingestion pipeline using FastAPI, Kafka, and Redis caching serving 800 req/sec.",
                    "Optimized PostgreSQL query performance and indexed complex schema migrations, reducing P95 latency by 42%.",
                    "Managed AWS EKS Kubernetes clusters and authored Infrastructure as Code via Terraform."
                ]
            },
            {
                "role": "Backend Software Developer",
                "company": "Helios Cloud Networks",
                "dates": "2019 – 2021 (2 years)",
                "bullets": [
                    "Built secure REST APIs in Python/Django integrated with Stripe and PayPal billing gateways.",
                    "Configured CI/CD automated test pipelines in Jenkins reducing deployment cycle times by 35%."
                ]
            }
        ],
        "education": "Bachelor of Engineering in Computer Science — University of Lagos, 2019"
    },
    {
        "filename": "Resume_Raj_Patel_FullStack.pdf",
        "name": "Raj Patel",
        "title": "Lead Full Stack Software Engineer",
        "contact": "raj.patel@devconnect.com | +44 7700 900456 | London, UK | linkedin.com/in/raj-patel-dev",
        "summary": "Full Stack Engineer with 5+ years experience building cloud-native SaaS platforms. Specialized in React TypeScript frontends, FastAPI and Node.js microservices, PostgreSQL relational storage, and AWS containerization.",
        "skills": {
            "Languages": "Python, TypeScript, JavaScript, SQL, HTML5/CSS3",
            "Frameworks": "React, FastAPI, Django, Express.js, GraphQL",
            "Cloud & Data": "AWS (S3, RDS, EC2), PostgreSQL, Redis, Docker, Kubernetes, Git, CI/CD"
        },
        "experience": [
            {
                "role": "Full Stack Engineer",
                "company": "Stratum Intelligence",
                "dates": "2021 – Present (3 years)",
                "bullets": [
                    "Developed customer-facing dashboard in React and TypeScript with real-time WebSocket telemetry.",
                    "Created Python FastAPI backend microservices connected to PostgreSQL databases and Redis cache layer.",
                    "Automated end-to-end container builds and deployments to AWS using Docker and GitHub Actions."
                ]
            },
            {
                "role": "Software Developer",
                "company": "Vanguard Web Labs",
                "dates": "2019 – 2021 (2 years)",
                "bullets": [
                    "Implemented responsive UI components using React, Redux, and Tailwind CSS.",
                    "Built RESTful API endpoints in Django and integrated third-party payment gateways."
                ]
            }
        ],
        "education": "Bachelor of Science in Computer Science — Imperial College London, 2019"
    },
    {
        "filename": "Resume_Sarah_Chen_Senior_AI.pdf",
        "name": "Sarah Chen",
        "title": "Staff AI / Machine Learning Engineer",
        "contact": "sarah.chen@aiml-research.org | +1 (415) 890-1234 | San Francisco, CA",
        "summary": "Staff Machine Learning Engineer with 8+ years experience developing enterprise LLM pipelines, deep learning architectures, and high-throughput model inference endpoints. Strong background in PyTorch, NLP, Transformers, FastAPI, Docker, and Kubernetes on AWS.",
        "skills": {
            "Machine Learning": "PyTorch, TensorFlow, Transformers, Hugging Face, LLMs, NLP, Scikit-learn, Vector DBs",
            "Engineering": "Python, FastAPI, Docker, Kubernetes, Kafka, PostgreSQL, Redis, AWS, CI/CD, Git"
        },
        "experience": [
            {
                "role": "Staff AI Engineer",
                "company": "Anthropic Partner Lab",
                "dates": "2020 – Present (4 years)",
                "bullets": [
                    "Architected RAG inference service using Python, PyTorch, and vector databases processing 5M embeddings daily.",
                    "Deployed scalable GPU inference endpoints in Kubernetes (AWS EKS) with sub-50ms latency.",
                    "Published 2 research papers on transformer fine-tuning at top AI venues."
                ]
            },
            {
                "role": "Senior ML Engineer",
                "company": "Cognitive Scale AI",
                "dates": "2016 – 2020 (4 years)",
                "bullets": [
                    "Trained and deployed deep learning classification models serving 20M users.",
                    "Engineered streaming data ingestion pipelines using Apache Kafka and Spark."
                ]
            }
        ],
        "education": "Ph.D. in Computer Science (Machine Learning) — Stanford University, 2016"
    },
    {
        "filename": "Resume_Rachel_Kim_DevOps.pdf",
        "name": "Rachel Kim",
        "title": "Lead Cloud DevOps & Platform Engineer",
        "contact": "rachel.kim@cloudinfra.net | +1 (206) 555-8734 | Seattle, WA",
        "summary": "DevOps & SRE Engineer with 6+ years of experience scaling Kubernetes infrastructure, automating multi-region cloud pipelines, and managing observability. Expert in AWS, GCP, Terraform, Docker, Python scripting, and CI/CD.",
        "skills": {
            "Infrastructure": "Kubernetes, Docker, Terraform, Ansible, AWS (EKS, S3, RDS), GCP, Linux",
            "CI/CD & Observability": "GitHub Actions, Jenkins, Prometheus, Grafana, ELK Stack, Python, Bash, Go"
        },
        "experience": [
            {
                "role": "Lead Platform Engineer",
                "company": "Nordic Cloud Services",
                "dates": "2020 – Present (4 years)",
                "bullets": [
                    "Engineered multi-region AWS EKS Kubernetes clusters running 60+ microservices.",
                    "Automated full cloud provisioning using Terraform, reducing environment spin-up from days to 12 minutes.",
                    "Maintained 99.99% service availability with Prometheus alerts and Grafana dashboards."
                ]
            },
            {
                "role": "DevOps Engineer",
                "company": "Cascade Tech",
                "dates": "2018 – 2020 (2 years)",
                "bullets": [
                    "Built robust CI/CD pipelines in Jenkins and GitHub Actions for Python and Go services.",
                    "Administered Linux server fleet and enforced zero-trust network policies."
                ]
            }
        ],
        "education": "Bachelor of Science in Computer Engineering — University of Washington, 2018"
    },
    {
        "filename": "Resume_Aisha_Ibrahim_DataEngineer.pdf",
        "name": "Aisha Ibrahim",
        "title": "Senior Data & Streaming Platform Engineer",
        "contact": "aisha.ibrahim@data-pipeline.io | +1 (312) 555-4321 | Chicago, IL",
        "summary": "Senior Data Engineer with 5+ years of experience building real-time streaming architectures, distributed ETL pipelines, and modern data lakes. Specialized in Python, SQL, Apache Spark, Kafka, Airflow, Snowflake, and AWS.",
        "skills": {
            "Data & Streaming": "Python, SQL, Apache Spark, Apache Kafka, Apache Airflow, dbt, Snowflake, BigQuery",
            "Cloud & DevOps": "AWS (S3, Glue, EMR), GCP, Docker, Git, CI/CD, PostgreSQL"
        },
        "experience": [
            {
                "role": "Senior Data Engineer",
                "company": "Apex Data Intelligence",
                "dates": "2021 – Present (3 years)",
                "bullets": [
                    "Constructed real-time event streaming pipeline processing 10TB+ daily data using Kafka and Spark Streaming.",
                    "Orchestrated 80+ daily batch DAG workflows in Apache Airflow with automated data quality checks in dbt.",
                    "Migrated legacy warehouse to Snowflake on AWS, reducing analytics query times by 60%."
                ]
            },
            {
                "role": "Data Engineer",
                "company": "Omni Analytics",
                "dates": "2019 – 2021 (2 years)",
                "bullets": [
                    "Created Python ETL scripts extracting data from relational PostgreSQL databases and REST APIs.",
                    "Maintained data lake storage partitions on AWS S3."
                ]
            }
        ],
        "education": "Master of Science in Data Science — University of Illinois Urbana-Champaign, 2019"
    },
    {
        "filename": "Resume_Alex_Morrison_Frontend.pdf",
        "name": "Alex Morrison",
        "title": "Senior Frontend Engineer (React/TypeScript)",
        "contact": "alex.morrison@uidev.com | +1 (347) 555-6789 | New York, NY",
        "summary": "Frontend Specialist with 5+ years of experience engineering high-performance web applications in React, TypeScript, Next.js, and Tailwind CSS. Strong collaborator with backend teams, integrating REST and GraphQL APIs.",
        "skills": {
            "Frontend Core": "React, TypeScript, JavaScript, Next.js, HTML5, CSS3, Tailwind CSS, Redux Toolkit, WebSockets",
            "Tooling & Backend": "GraphQL, REST APIs, Node.js, Webpack, Vite, Jest, Git, Docker basics"
        },
        "experience": [
            {
                "role": "Senior Frontend Developer",
                "company": "PixelCraft Interactive",
                "dates": "2021 – Present (3 years)",
                "bullets": [
                    "Spearheaded React and TypeScript web app rewrite, achieving 98+ Google Lighthouse score.",
                    "Created responsive design component library utilized across 4 enterprise applications.",
                    "Connected complex state stores with backend REST and GraphQL endpoints."
                ]
            },
            {
                "role": "Frontend Developer",
                "company": "Bluefin Digital",
                "dates": "2019 – 2021 (2 years)",
                "bullets": [
                    "Developed dynamic client dashboard in React, JavaScript, and CSS Grid.",
                    "Collaborated with UX designers in Figma to implement pixel-perfect user experiences."
                ]
            }
        ],
        "education": "Bachelor of Arts in Computer Science & Media Studies — New York University, 2019"
    },
    {
        "filename": "Resume_Priya_Sharma_DataScientist.pdf",
        "name": "Priya Sharma",
        "title": "Senior Data Scientist & Analytics Specialist",
        "contact": "priya.sharma@analytics-hub.com | +1 (650) 555-9012 | Mountain View, CA",
        "summary": "Data Scientist with 5+ years of experience utilizing machine learning, statistical modeling, and data analytics to solve commercial optimization problems. Proficient in Python, SQL, Scikit-learn, Pandas, and BigQuery.",
        "skills": {
            "Data Science": "Python, SQL, Pandas, NumPy, Scikit-learn, Statsmodels, BigQuery, Tableau, Jupyter",
            "Engineering": "FastAPI, Docker, Git, AWS, PostgreSQL, Redis"
        },
        "experience": [
            {
                "role": "Senior Data Scientist",
                "company": "Quantum Metrics",
                "dates": "2021 – Present (3 years)",
                "bullets": [
                    "Developed churn prediction and customer lifetime value algorithms in Python and Scikit-learn.",
                    "Constructed SQL data models in Google BigQuery to power executive analytics dashboards.",
                    "Packaged predictive algorithms into lightweight FastAPI microservices."
                ]
            },
            {
                "role": "Data Analyst",
                "company": "Bay Data Partners",
                "dates": "2019 – 2021 (2 years)",
                "bullets": [
                    "Designed automated SQL reports and Tableau dashboards for finance and operations teams.",
                    "Conducted A/B testing analysis and hypothesis testing."
                ]
            }
        ],
        "education": "Master of Science in Statistics — Stanford University, 2019"
    },
    {
        "filename": "Resume_Nina_Petrov_Security.pdf",
        "name": "Nina Petrov",
        "title": "Cloud Security & DevSecOps Engineer",
        "contact": "nina.petrov@sec-ops.io | +1 (415) 555-7890 | Austin, TX",
        "summary": "Security Engineer with 4+ years experience securing AWS cloud environments, containerized Kubernetes workloads, and CI/CD pipelines. Proficient in Python scripting, Linux security, OAuth2, and automated vulnerability scanning.",
        "skills": {
            "Security & Cloud": "AWS Security, IAM, Kubernetes Security, Docker, Linux, Python, Bash, Terraform",
            "Compliance": "SOC2, OWASP Top 10, OAuth2, JWT, Vulnerability Assessment, CI/CD Security"
        },
        "experience": [
            {
                "role": "Cloud Security Engineer",
                "company": "Sentinel Defense Labs",
                "dates": "2022 – Present (2 years)",
                "bullets": [
                    "Implemented automated container vulnerability scanning in GitHub Actions CI/CD pipelines.",
                    "Configured AWS IAM least-privilege security policies and multi-account guardrails.",
                    "Automated threat detection and incident response workflows using Python and AWS Lambda."
                ]
            },
            {
                "role": "Security Analyst",
                "company": "CyberTrust Systems",
                "dates": "2020 – 2022 (2 years)",
                "bullets": [
                    "Conducted penetration testing and code audits against OWASP vulnerability standards.",
                    "Monitored security alerts in ELK SIEM and managed incident remediation."
                ]
            }
        ],
        "education": "Bachelor of Science in Cybersecurity & Information Systems — University of Texas at Austin, 2020"
    },
    {
        "filename": "Resume_Michael_Tran_JuniorDev.pdf",
        "name": "Michael Tran",
        "title": "Junior Full Stack Developer",
        "contact": "michael.tran@devmail.org | +1 (408) 555-1122 | San Jose, CA",
        "summary": "Enthusiastic Junior Developer with 1+ years of experience building modern web applications. Proficient in JavaScript, React, Python basics, HTML/CSS, and Git. Fast learner looking to grow in a collaborative agile engineering team.",
        "skills": {
            "Languages & Frameworks": "JavaScript, TypeScript basics, React, HTML5, CSS3, Python basics, Node.js basics",
            "Tools": "Git, GitHub, VS Code, REST APIs, PostgreSQL basics"
        },
        "experience": [
            {
                "role": "Junior Web Developer",
                "company": "Silicon Valley App Studio",
                "dates": "2023 – Present (1 year)",
                "bullets": [
                    "Built interactive landing pages and customer portals using React, HTML5, and CSS3.",
                    "Assisted senior engineers in writing Python backend scripts and debugging REST APIs.",
                    "Participated in daily scrum standups, code reviews, and unit test creation in Jest."
                ]
            }
        ],
        "education": "Bachelor of Science in Computer Science — San Jose State University, 2023"
    },
    {
        "filename": "Resume_Diana_Ross_ProductManager.pdf",
        "name": "Diana Ross",
        "title": "Senior Technical Product Manager",
        "contact": "diana.ross@prodmgmt.io | +1 (212) 555-3344 | Boston, MA",
        "summary": "Technical Product Manager with 6+ years experience leading cross-functional engineering teams, defining product roadmaps, and delivering B2B SaaS solutions. Strong understanding of software development lifecycles, Agile/Scrum, and user research.",
        "skills": {
            "Product & Strategy": "Product Roadmap, Agile/Scrum, User Stories, Jira, A/B Testing, User Research",
            "Technical Literacy": "SQL, Python basics, API Concepts, Data Analytics, Figma wireframing"
        },
        "experience": [
            {
                "role": "Senior Product Manager",
                "company": "Horizon Cloud Platforms",
                "dates": "2020 – Present (4 years)",
                "bullets": [
                    "Led sprint planning and backlog grooming for 2 engineering teams delivering core API services.",
                    "Authored detailed PRDs, user stories, and acceptance criteria for 15+ major feature releases.",
                    "Analyzed user engagement metrics using SQL queries to drive product enhancement priorities."
                ]
            },
            {
                "role": "Associate Product Manager",
                "company": "Beacon Interactive",
                "dates": "2018 – 2020 (2 years)",
                "bullets": [
                    "Coordinated user acceptance testing (UAT) and feature rollout communications.",
                    "Conducted customer discovery interviews and competitor market benchmarking."
                ]
            }
        ],
        "education": "Bachelor of Arts in Economics & Business Administration — Boston College, 2018"
    },
    {
        "filename": "Resume_Tom_Baker_UIDesigner.pdf",
        "name": "Tom Baker",
        "title": "Senior Product & UI/UX Designer",
        "contact": "tom.baker@designhub.net | +1 (303) 555-8899 | Denver, CO",
        "summary": "Creative UI/UX Product Designer with 6+ years experience crafting intuitive digital experiences, design systems, and responsive web/mobile interfaces. Expert in Figma, wireframing, and user research.",
        "skills": {
            "Design Tools": "Figma, Adobe Creative Suite (Illustrator, Photoshop), Sketch, InVision",
            "Methodologies": "User Research, Wireframing, Prototyping, Design Systems, HTML/CSS basics"
        },
        "experience": [
            {
                "role": "Lead UI/UX Designer",
                "company": "Creative Velocity Studios",
                "dates": "2020 – Present (4 years)",
                "bullets": [
                    "Designed end-to-end user flows, interactive wireframes, and prototypes for 8 mobile and web SaaS applications.",
                    "Established and maintained enterprise Figma design component library used across engineering and marketing.",
                    "Conducted usability testing sessions with 50+ enterprise users to validate interface workflows."
                ]
            },
            {
                "role": "UI Designer",
                "company": "Altitude Digital Media",
                "dates": "2018 – 2020 (2 years)",
                "bullets": [
                    "Created visual assets, marketing graphics, and responsive web mockups in Adobe Illustrator and Figma.",
                    "Collaborated with frontend developers to ensure design fidelity in production."
                ]
            }
        ],
        "education": "Bachelor of Fine Arts in Graphic & Digital Design — Rhode Island School of Design, 2018"
    },
    {
        "filename": "Resume_Emily_Zhang_ML_Engineer.pdf",
        "name": "Emily Zhang",
        "title": "Senior Machine Learning Engineer",
        "contact": "emily.zhang@deeplearning-ai.com | +1 (617) 555-4567 | Cambridge, MA",
        "summary": "Senior ML Engineer with 6+ years experience deploying deep learning models, natural language processing pipelines, and scalable APIs in production. Proficient in Python, PyTorch, FastAPI, Docker, and AWS cloud infrastructure.",
        "skills": {
            "AI & ML": "Python, PyTorch, TensorFlow, NLP, Transformers, LLMs, Scikit-learn, LangChain",
            "Infrastructure": "FastAPI, Docker, Kubernetes, AWS, PostgreSQL, Redis, CI/CD, Git"
        },
        "experience": [
            {
                "role": "Senior ML Engineer",
                "company": "Vector Cognitive Solutions",
                "dates": "2021 – Present (3 years)",
                "bullets": [
                    "Fine-tuned transformer models for domain-specific text summarization and semantic search.",
                    "Engineered low-latency FastAPI inference microservices packaged in Docker on AWS EKS.",
                    "Implemented Redis vector caching reducing average model response latency by 55%."
                ]
            },
            {
                "role": "Machine Learning Engineer",
                "company": "DataSphere AI",
                "dates": "2018 – 2021 (3 years)",
                "bullets": [
                    "Trained neural network models for predictive customer analytics using PyTorch and Scikit-learn.",
                    "Constructed automated data validation and training pipelines."
                ]
            }
        ],
        "education": "Master of Science in Computer Science (Artificial Intelligence) — MIT, 2018"
    },
    {
        "filename": "Resume_Marcus_Vance_SoftwareEngineer.pdf",
        "name": "Marcus Vance",
        "title": "Senior Software Engineer (Full Stack)",
        "contact": "marcus.vance@techdev.io | +1 (512) 555-9876 | Austin, TX",
        "summary": "Versatile Software Engineer with 6+ years experience architecting cloud applications in Python, React, TypeScript, and relational databases. Strong focus on API performance, clean code architecture, and automated continuous delivery.",
        "skills": {
            "Languages & Frameworks": "Python, Django, FastAPI, React, TypeScript, JavaScript, SQL, HTML5/CSS3",
            "Infrastructure & DB": "PostgreSQL, Redis, Docker, AWS (EC2, S3), Git, GitHub Actions, Linux"
        },
        "experience": [
            {
                "role": "Senior Software Engineer",
                "company": "CloudPeak Technologies",
                "dates": "2021 – Present (3 years)",
                "bullets": [
                    "Architected scalable backend APIs in Python (Django & FastAPI) supporting 2M+ active accounts.",
                    "Engineered performant frontend dashboards in React with TypeScript and Redux state management.",
                    "Configured GitHub Actions CI/CD workflows for automated unit testing and container deployment on AWS."
                ]
            },
            {
                "role": "Software Developer",
                "company": "LoneStar Web Systems",
                "dates": "2018 – 2021 (3 years)",
                "bullets": [
                    "Maintained core PostgreSQL database schemas and optimized complex analytical queries.",
                    "Developed RESTful integration services connecting CRM platforms with third-party billing systems."
                ]
            }
        ],
        "education": "Bachelor of Science in Computer Science — University of Texas at Austin, 2018"
    },
    {
        "filename": "Corrupted_Scan_Test_Doc.pdf",
        "is_corrupt": True
    }
]


def build_ats_pdf(candidate_data: dict, output_path: Path):
    """Build clean single-column ATS-friendly PDF using ReportLab."""
    if candidate_data.get("is_corrupt"):
        # Create minimal PDF with no extractable text to test OCR/scan error recovery
        doc = SimpleDocTemplate(str(output_path), pagesize=letter)
        doc.build([Paragraph("", ParagraphStyle('Empty', fontName='Helvetica', fontSize=8))])
        return

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch
    )

    styles = getSampleStyleSheet()

    # Custom ATS Typography Styles
    name_style = ParagraphStyle(
        'ATSName',
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=HexColor('#111827'),
        alignment=0,
        spaceAfter=2
    )

    title_style = ParagraphStyle(
        'ATSTitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=HexColor('#374151'),
        spaceAfter=2
    )

    contact_style = ParagraphStyle(
        'ATSContact',
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=HexColor('#4B5563'),
        spaceAfter=8
    )

    heading_style = ParagraphStyle(
        'ATSHeading',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=HexColor('#1F2937'),
        spaceBefore=8,
        spaceAfter=3,
        textTransform='uppercase'
    )

    body_style = ParagraphStyle(
        'ATSBody',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=HexColor('#1F2937'),
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'ATSBullet',
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=HexColor('#374151'),
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2
    )

    job_title_style = ParagraphStyle(
        'ATSJobTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=HexColor('#111827')
    )

    job_meta_style = ParagraphStyle(
        'ATSJobMeta',
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=HexColor('#4B5563'),
        spaceAfter=3
    )

    story = []

    # 1. Header (Name + Title + Contact)
    story.append(Paragraph(candidate_data["name"], name_style))
    story.append(Paragraph(candidate_data["title"], title_style))
    story.append(Paragraph(candidate_data["contact"], contact_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=HexColor('#D1D5DB'), spaceAfter=6, spaceBefore=0))

    # 2. Professional Summary
    story.append(Paragraph("Professional Summary", heading_style))
    story.append(Paragraph(candidate_data["summary"], body_style))

    # 3. Technical Skills
    story.append(Paragraph("Technical Skills", heading_style))
    for category, skills_list in candidate_data["skills"].items():
        skill_line = f"<b>{category}:</b> {skills_list}"
        story.append(Paragraph(skill_line, body_style))

    # 4. Professional Experience
    story.append(Paragraph("Professional Experience", heading_style))
    for job in candidate_data["experience"]:
        story.append(Paragraph(f"<b>{job['role']}</b> — {job['company']}", job_title_style))
        story.append(Paragraph(job["dates"], job_meta_style))
        for bullet in job["bullets"]:
            story.append(Paragraph(f"&bull; {bullet}", bullet_style))
        story.append(Spacer(1, 4))

    # 5. Education
    story.append(Paragraph("Education", heading_style))
    story.append(Paragraph(candidate_data["education"], body_style))

    doc.build(story)


def main():
    print(f"Generating ATS-friendly PDF resume dataset in: {RESUME_OUTPUT_DIR}")

    # Remove all existing files in sample_resumes/
    if RESUME_OUTPUT_DIR.exists():
        for item in RESUME_OUTPUT_DIR.iterdir():
            if item.is_file():
                item.unlink()
    else:
        RESUME_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for cand in CANDIDATES:
        out_file = RESUME_OUTPUT_DIR / cand["filename"]
        build_ats_pdf(cand, out_file)
        size_kb = out_file.stat().st_size / 1024
        print(f"  ✓ Generated: {cand['filename']:<42} ({size_kb:.1f} KB)")

    print(f"\n✨ Successfully generated {len(CANDIDATES)} 100% PDF ATS-friendly resumes!")


if __name__ == "__main__":
    main()
