export const profile = {
  email: "sreevishnu0506@gmail.com",
  phone: "9717277745",
  name: "Sree Vishnu Raju Dommaraju",
  title: "Senior Generative AI Engineer",
  linkedin: "https://www.linkedin.com/in/sreevishnurajud/",
};
export const capabilities = [
  [
    "Agentic AI",
    "Reasoning with boundaries.",
    "Design stateful workflows with explicit tools, typed outputs, checkpoints, and human review.",
    "LLMs, Gemini, Llama, LangChain, LangGraph, tool calling, ReAct-style workflows, multi-agent systems, A2A concepts, MCP-style interfaces, structured outputs, guardrails, human-in-the-loop",
  ],
  [
    "LLM & Retrieval",
    "Knowledge with provenance.",
    "Connect retrieval, context selection, and citations so answers can be inspected.",
    "Embeddings, semantic/hybrid retrieval, FAISS, Pinecone, Vertex AI Vector Search, reranking, metadata filtering, chunking, contextual grounding, document intelligence",
  ],
  [
    "ML, NLP & Evaluation",
    "Evidence before intuition.",
    "Evaluate models and retrieval against defined tasks, failure modes, and representative datasets.",
    "Python, PyTorch, TensorFlow, scikit-learn, XGBoost, MLflow, RAGAS, TruLens, model evaluation, feature engineering, forecasting, classification",
  ],
  [
    "Cloud & MLOps",
    "Operations are architecture.",
    "Build repeatable delivery paths with observable services and deliberate infrastructure boundaries.",
    "GCP / Vertex AI, AWS, Azure, Docker, Kubernetes, Terraform, GitHub Actions, Jenkins, CI/CD, observability",
  ],
  [
    "Backend & Data",
    "Dependable foundations.",
    "Connect APIs, events, and distributed processing with explicit contracts and resilient execution.",
    "FastAPI, REST APIs, Python, Java/Spring Boot, PostgreSQL, MongoDB, Redis, Kafka, Spark, PySpark, distributed pipelines",
  ],
  [
    "Product Integration",
    "Make intelligence usable.",
    "Expose system state, meaningful controls, and clear recovery paths in user-facing AI workflows.",
    "React, TypeScript, HTML/CSS, AI-integrated applications, user-facing agent workflows",
  ],
];
export const concepts = [
  {
    name: "Multi-Agent Knowledge Orchestrator",
    kind: "AGENTIC SYSTEMS",
    problem:
      "Coordinate specialized agents without losing control of context or decisions.",
    stages: [
      "User query",
      "Router / planner",
      "Retrieval agent",
      "Validation agent",
      "Reasoning agent",
      "Governance / guardrails",
      "Response",
    ],
    stack: [
      "Python",
      "FastAPI",
      "LangGraph",
      "Vertex AI / Gemini",
      "Vector retrieval",
      "Observability",
    ],
    decision:
      "Explicit state and bounded handoffs make execution inspectable; orchestration adds latency and requires careful retry boundaries.",
    reliability:
      "Validate tool outputs, limit execution steps, and checkpoint human-review decisions.",
    sample: "A fictional team asks: how should a document be reviewed?",
    result:
      "Planner selects retrieval; validators inspect evidence; reasoning produces a response with a review checkpoint.",
  },
  {
    name: "Grounded RAG Intelligence Engine",
    kind: "RETRIEVAL & KNOWLEDGE",
    problem:
      "Turn scattered documents into answers that retain their source context.",
    stages: [
      "Document ingestion",
      "Preprocessing",
      "Semantic chunking",
      "Embeddings",
      "Hybrid / vector search",
      "Reranking",
      "Cited response",
      "Evaluation",
    ],
    stack: [
      "Python",
      "LangChain",
      "Pinecone / FAISS",
      "Vertex AI",
      "RAGAS / TruLens",
    ],
    decision:
      "Hybrid retrieval balances lexical precision and semantic coverage; reranking improves context selection at an added inference cost.",
    reliability:
      "Filter access before retrieval, version document indexes, and evaluate citation support.",
    sample: "Fictional handbook, section 2: “Drafts require a reviewer.”",
    result:
      "Retrieved chunk → reranked evidence → answer: drafts need review [Handbook §2].",
  },
  {
    name: "Responsible AI Governance Layer",
    kind: "POLICY & TRUST",
    problem:
      "Apply explicit policy boundaries throughout an AI request lifecycle.",
    stages: [
      "Request classification",
      "Policy checks",
      "Sensitive-data handling",
      "Retrieval constraints",
      "Response validation",
      "Audit telemetry",
    ],
    stack: [
      "FastAPI",
      "RBAC",
      "Guardrails",
      "Structured outputs",
      "Observability",
    ],
    decision:
      "Layered policy checks offer clearer control than a single prompt; rules need versioning and evaluation to avoid overblocking.",
    reliability:
      "Minimize retained data, fail closed on access errors, and audit decisions. This concept makes no compliance certification claim.",
    sample: "Fictional request includes a restricted document identifier.",
    result:
      "Restricted scenario: access check blocks retrieval; the response asks for an authorized source.",
  },
  {
    name: "Real-Time ML Risk Analytics",
    kind: "STREAMING & INFERENCE",
    problem:
      "Inspect anomalous synthetic events through a traceable inference path.",
    stages: [
      "Streaming ingestion",
      "Feature processing",
      "Model inference",
      "Decisioning",
      "Monitoring",
    ],
    stack: [
      "Kafka",
      "PySpark",
      "Python",
      "scikit-learn / XGBoost",
      "Kubernetes",
      "Prometheus / Grafana",
    ],
    decision:
      "Streaming features reduce processing delay but introduce state, ordering, and training-serving consistency challenges.",
    reliability:
      "Track feature freshness, model drift, and uncertain predictions; route ambiguous events for review.",
    sample: "Synthetic events: E-101 / feature 0.12; E-102 / feature 0.91.",
    result:
      "E-101: routine pattern. E-102: review candidate. Illustrative rules, not a trained risk model.",
  },
  {
    name: "Cloud-Native Model Operations Platform",
    kind: "DELIVERY & OPERATIONS",
    problem: "Make model delivery repeatable, observable, and reversible.",
    stages: [
      "Experiment tracking",
      "CI validation",
      "Container build",
      "Deployment",
      "Monitoring",
      "Evaluation feedback",
    ],
    stack: [
      "MLflow",
      "Docker",
      "Kubernetes",
      "Terraform",
      "GitHub Actions",
      "Cloud monitoring",
    ],
    decision:
      "Versioned artifacts and declarative infrastructure improve reproducibility; staged rollout requires additional orchestration.",
    reliability:
      "Gate releases on evaluation, use health checks, and retain rollback artifacts.",
    sample: "Fictional model revision: candidate-03.",
    result:
      "Simulated lifecycle: evaluation passed → artifact built → staged rollout → health checks → feedback.",
  },
  {
    name: "Intelligent Document Processing Pipeline",
    kind: "DATA & DOCUMENTS",
    problem:
      "Transform heterogeneous documents into consistent, searchable records.",
    stages: [
      "Ingestion",
      "Parsing",
      "Normalization",
      "Enrichment",
      "Indexing",
      "Query interface",
    ],
    stack: [
      "Python",
      "Spark / PySpark",
      "Cloud storage",
      "Search indexes",
      "FastAPI",
    ],
    decision:
      "Independent processing stages simplify replay and scaling; schema evolution and duplicate handling need explicit contracts.",
    reliability:
      "Use idempotent ingestion, quarantine parse failures, and preserve source provenance.",
    sample: 'Synthetic document: { title: " Field guide ", revision: "02" }.',
    result:
      "Parsed → normalized title “Field guide” → revision 2 → indexed with synthetic source provenance.",
  },
];
export const experience = [
  [
    "2023–Present",
    "Senior Generative AI Engineer",
    "Enterprise Healthcare AI",
    "Agentic workflows, multi-agent orchestration, RAG knowledge systems, secure cloud deployment, evaluation, and observability.",
  ],
  [
    "2021–2023",
    "AI/ML Engineer",
    "Financial Technology",
    "Risk modeling, scalable inference, streaming data, feature engineering, and production monitoring.",
  ],
  [
    "2018–2021",
    "Senior Data Scientist",
    "Public Sector Analytics",
    "Distributed processing, predictive analytics, Azure data platforms, and secure analytics pipelines.",
  ],
  [
    "2016–2018",
    "Python Backend Developer",
    "Retail Technology",
    "API engineering, SQL optimization, event-driven integration, and data pipelines.",
  ],
  [
    "2014–2016",
    "Full Stack Developer",
    "Healthcare Software",
    "Java and Python web services, relational data systems, and responsive interfaces.",
  ],
];
export const scenarios = {
  knowledge: {
    name: "Knowledge Orchestration",
    stages: [
      [
        "User Query",
        "Receive a fictional question: how should a draft document be reviewed?",
      ],
      [
        "Router Agent",
        "Select a bounded retrieval workflow and the tools allowed for this request.",
      ],
      [
        "Retrieval / Tools",
        "Retrieve authorized synthetic handbook section 2: drafts require a reviewer.",
      ],
      [
        "Reason / Validate",
        "Check that the proposed answer is supported by the selected evidence.",
      ],
      [
        "Guardrails",
        "Validate access policy and response structure; retain only the required context.",
      ],
      [
        "Response",
        "Return the synthetic answer with citation [Handbook §2] and a review checkpoint.",
      ],
    ],
  },
  review: {
    name: "Multi-Agent Review",
    stages: [
      ["Plan", "Split a fictional document review into bounded tasks."],
      ["Research", "Retrieve synthetic review guidelines."],
      ["Validate", "Check the selected evidence and tool output schema."],
      ["Review", "Route a disputed interpretation to a human checkpoint."],
      ["Respond", "Return the proposed summary with the review requirement."],
    ],
  },
  inference: {
    name: "ML Inference Pipeline",
    stages: [
      ["Ingest", "Receive synthetic event E-102."],
      ["Features", "Validate feature schema and freshness."],
      [
        "Infer",
        "Apply a deterministic illustrative threshold to feature 0.91.",
      ],
      [
        "Decide",
        "Mark the event as a review candidate, not an automated rejection.",
      ],
      ["Monitor", "Record synthetic decision provenance and feature state."],
    ],
  },
};
