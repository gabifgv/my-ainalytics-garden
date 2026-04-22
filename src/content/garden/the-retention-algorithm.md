---
title: "The Retention Algorithm: Engineering an XGBoost People Analytics System to Predict Voluntary Turnover"
date: 2026-04-21
category: "MLOps"
flower_type: "tulip"
keyword: "PeopleAnalytics"
id: "0003"
author: "Gabriella Pinheiro"
excerpt: "A rigorous people analytics case study — how I built a production-ready XGBoost pipeline to predict employee voluntary turnover, and what the feature importance ranking reveals about the true economics of retention."
---

## Academic Context

This project was developed as the final assignment for the **Projetos Aplicados** discipline of my MBA in AI & Analytics at FGV. The objective was to apply the full supervised learning pipeline — from exploratory analysis through production design — to a real-world HR problem using a publicly available benchmark dataset.

The dataset used is the **IBM HR Analytics Employee Attrition & Performance** dataset, widely adopted in applied ML coursework for its realistic structure and well-documented variables. It does not reflect FGV's internal HR data, nor was it applied to any real organization's workforce. The intervention protocols described at the end represent a deployment design proposal — what a production system built on this model could do — not an active system.

---

## The Cost Equation That Changes Everything

People analytics is not HR's new toy. It is a response to a measurable business failure. When a professional leaves voluntarily, the organization incurs a replacement cost estimated at **1.5× to 2× their annual salary** — factoring in recruitment, onboarding, productivity loss during the ramp period, and knowledge transfer decay. For specialized roles (Data Scientist, MLOps Engineer, senior researcher), a single unexpected departure carries operational disruption far exceeding any recruitment line item.

The question is not whether turnover is costly. The question is whether it is **predictable** — and if predictable, whether it is preventable. This is the hypothesis this project was designed to test.

---

## The Dataset: IBM HR Analytics Benchmark

The IBM HR Analytics dataset contains **1,470 employee records across 35 raw attributes**. The target variable is `Attrition` (voluntary exit: Yes/No). After removing non-predictive constants (`EmployeeNumber`, `Over18`, `EmployeeCount`, `StandardHours`), the working feature set is **31 variables**.

The dataset is structured, cross-sectional, and fully labeled — no missing values, no time-series dependency. These properties make it well-suited for coursework but more optimistic than real-world HR data, which typically carries missingness, self-reporting bias, and evolving label definitions.

---

## Descriptive Statistics: What the Data Says Before the Model

Understanding marginal distributions before training is not optional — it is where the hypotheses come from.

**Target variable distribution**

<div class="attrition-split">
  <div class="attrition-split-segment" style="width: 83.9%; background: #7a8c71;">No Attrition — 1,233 employees (83.9%)</div>
  <div class="attrition-split-segment" style="width: 16.1%; background: #d97a8a;">Attrition — 237 (16.1%)</div>
</div>

The **5.2:1 class ratio** is the central technical constraint of this project. Any metric that aggregates both classes (accuracy) will be misleading — a model that always predicts "stays" scores 83.9% without learning anything.

**Continuous variables**

| Variable | Mean | Median | Std Dev | Range |
|---|---|---|---|---|
| Age | 36.9 | 36 | 9.1 | 18–60 |
| MonthlyIncome (USD) | 6,503 | 4,919 | 4,707 | 1,009–19,999 |
| YearsAtCompany | 7.0 | 5 | 6.1 | 0–40 |
| YearsWithCurrManager | 4.1 | 3 | 3.6 | 0–17 |
| TotalWorkingYears | 11.3 | 10 | 7.8 | 0–40 |
| TrainingTimesLastYear | 2.8 | 3 | 1.3 | 0–6 |
| DistanceFromHome | 9.2 | 7 | 8.1 | 1–29 |

High standard deviation on `MonthlyIncome` (4,707 on a mean of 6,503) signals wide salary dispersion — the model treats compensation as a relative signal, not absolute. `YearsWithCurrManager` has a median of 3 with a long right tail, consistent with literature on manager relationship stability as a retention factor.

**Attrition rate by categorical group**

<div class="stat-bars">
  <div class="stat-bar-group">
    <span class="stat-bar-group-label">Overtime</span>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Yes</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 87%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">30.5%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">No</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 30%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">10.4%</span>
    </div>
  </div>

  <div class="stat-bar-group">
    <span class="stat-bar-group-label">Marital Status</span>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Single</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 73%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">25.5%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Married</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 35%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">12.4%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Divorced</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 29%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">10.1%</span>
    </div>
  </div>

  <div class="stat-bar-group">
    <span class="stat-bar-group-label">Stock Option Level</span>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Level 0 (no equity)</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 69%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">24.2%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Level 1</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 32%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">11.3%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Level 2</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 11%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">3.7%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Level 3</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 25%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">8.6%</span>
    </div>
  </div>

  <div class="stat-bar-group">
    <span class="stat-bar-group-label">Department</span>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Sales</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 59%; background: #c48b52;"></div></div>
      <span class="stat-bar-value">20.6%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Human Resources</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 54%; background: #c48b52;"></div></div>
      <span class="stat-bar-value">19.0%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">R&D</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 39%; background: #c48b52;"></div></div>
      <span class="stat-bar-value">13.8%</span>
    </div>
  </div>

  <div class="stat-bar-group">
    <span class="stat-bar-group-label">Job Level</span>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Level 1 (entry)</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 75%; background: #827397;"></div></div>
      <span class="stat-bar-value">26.3%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Level 5 (senior)</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 14%; background: #827397;"></div></div>
      <span class="stat-bar-value">4.8%</span>
    </div>
  </div>
</div>

Even without a model, these conditional distributions form a coherent narrative. Overtime workers exit at nearly **3× the rate** of non-overtime peers (burnout signal). Employees with no stock options exit at **6.5× the rate** of Level 2 holders (asset specificity effect). Entry-level employees exit at **5.5× the rate** of senior employees. These patterns will resurface in feature importance — confirming the model learns interpretable economic signals, not noise.

**Satisfaction scales — attrition at score extremes (1=Low, 4=Very High)**

<div class="stat-bars">
  <div class="stat-bar-group">
    <span class="stat-bar-group-label">Attrition rate at score 1 vs score 4</span>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Job Satisfaction ①</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 65%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">22.8%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Job Satisfaction ④</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 32%; background: #7a8c71;"></div></div>
      <span class="stat-bar-value">11.3%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Environment Sat. ①</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 73%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">25.4%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Environment Sat. ④</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 37%; background: #7a8c71;"></div></div>
      <span class="stat-bar-value">13.0%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Work-Life Balance ①</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 89%; background: #d97a8a;"></div></div>
      <span class="stat-bar-value">31.2%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">Work-Life Balance ④</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 50%; background: #7a8c71;"></div></div>
      <span class="stat-bar-value">17.5%</span>
    </div>
  </div>
</div>

Every satisfaction dimension shows the expected gradient. `WorkLifeBalance` carries the steepest slope — employees at score 1 exit at 31.2%, roughly double the dataset average.

---

## The Pipeline: Step by Step

### Step 1 — Exploratory Data Analysis and Feature Engineering

Before any preprocessing, I mapped the attrition rate across each categorical variable and plotted distributions for all continuous features. Key EDA decisions:

- `MonthlyRate`, `HourlyRate`, and `DailyRate` show near-zero attrition differentiation — internally inconsistent records, not true market signals. `MonthlyIncome` is the only reliable compensation proxy.
- `EmployeeCount`, `Over18`, `StandardHours` are constants — removed.
- `JobLevel` and `MonthlyIncome` are highly correlated (Pearson r ≈ 0.95) — kept both, noted collinearity for interpretation.
- Ordinal scales (satisfaction scores, `JobLevel`, `StockOptionLevel`) kept as integers — ordinal information would be destroyed by dummy coding.

### Step 2 — Train/Test Split and Class Imbalance Handling

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.30, stratify=y, random_state=42
)
```

`stratify=y` ensures the 16.1% attrition rate is preserved in both splits. SMOTE is applied **inside the training pipeline only** — the most common class imbalance error is applying it before the split, leaking synthetic minority observations into the test set and destroying evaluation validity:

```python
pipeline = Pipeline([
    ('smote', SMOTE(random_state=42)),
    ('clf', XGBClassifier(n_estimators=300, max_depth=6, learning_rate=0.1))
])
```

By encapsulating SMOTE inside a `Pipeline`, it executes only on the training fold during cross-validation. The test set always evaluates against the true class distribution.

### Step 3 — Model Selection and Comparison

Four models evaluated via 5-fold stratified cross-validation. Priority metric: **F1-Score** (harmonic mean of precision and recall), not accuracy.

<table class="chart-table">
  <thead>
    <tr>
      <th>Model</th>
      <th>F1-Score</th>
      <th>AUC-ROC</th>
      <th>Precision</th>
      <th>Recall</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Logistic Regression</td>
      <td>0.393</td>
      <td>0.711</td>
      <td>0.401</td>
      <td>0.385</td>
    </tr>
    <tr>
      <td>Random Forest (300 est., depth=10)</td>
      <td>0.396</td>
      <td>0.712</td>
      <td>0.390</td>
      <td>0.402</td>
    </tr>
    <tr class="row-highlight">
      <td>XGBoost (300 est., depth=6, lr=0.1)</td>
      <td>0.417</td>
      <td>0.711</td>
      <td>0.413</td>
      <td>0.421</td>
    </tr>
    <tr>
      <td>Neural Network (MLP 64→32)</td>
      <td>0.299</td>
      <td>0.596</td>
      <td>0.312</td>
      <td>0.287</td>
    </tr>
  </tbody>
</table>

XGBoost's margin over Random Forest is modest (F1 +0.021), but the **precision advantage (0.413 vs. 0.390)** is strategically relevant: false alarms are expensive. Each flagged employee who is not at risk consumes a retention action — a compensation review, a manager intervention, a development conversation. Precision controls the cost of acting on the wrong signal.

The Neural Network underperformed significantly (F1 0.299), consistent with the principle that deep learning requires volume to justify complexity. At 1,470 rows, gradient boosting dominates.

### Step 4 — Threshold Optimization

XGBoost's default threshold of 0.5 was calibrated for balanced classes. With 16.1% minority, it under-flags true attrition risk. Custom optimization: for each CV fold, evaluate F1-Score across thresholds from 0.1 to 0.9 in 0.01 increments, then average the optimal threshold across folds. Result: **~0.35**, increasing recall without collapsing precision.

### Step 5 — Feature Importance (SHAP)

SHAP (SHapley Additive exPlanations) provides model-agnostic feature attribution — each feature's average contribution to the prediction.

<div class="stat-bars">
  <div class="stat-bar-group">
    <span class="stat-bar-group-label">Mean absolute SHAP value — top predictors</span>
    <div class="stat-bar-row">
      <span class="stat-bar-label">StockOptionLevel</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 100%; background: #c48b52;"></div></div>
      <span class="stat-bar-value">9.7%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">MonthlyIncome</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 65%; background: #c48b52;"></div></div>
      <span class="stat-bar-value">6.3%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">JobSatisfaction</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 55%; background: #c48b52;"></div></div>
      <span class="stat-bar-value">5.3%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">YearsWithCurrManager</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 50%; background: #c48b52;"></div></div>
      <span class="stat-bar-value">4.9%</span>
    </div>
    <div class="stat-bar-row">
      <span class="stat-bar-label">RelationshipSatisfaction</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 45%; background: #c48b52;"></div></div>
      <span class="stat-bar-value">4.4%</span>
    </div>
  </div>
</div>

**StockOptionLevel (9.7%)** — Equity ownership creates an economic stake in the organization's future. No stock options = lower switching cost. The **asset specificity** problem in labor economics: employees without firm-specific financial investment have no deferred compensation anchor.

**MonthlyIncome (6.3%)** — Below-market compensation is the most legible retention failure. The signal is relative: an employee earning 15% below market is permanently in active search mode regardless of the absolute number.

**JobSatisfaction (5.3%)** — Non-pecuniary compensation. Work content, autonomy, and impact offset salary gaps — until they don't.

**YearsWithCurrManager (4.9%)** — Manager relationship stability. The organizational behavior literature is consistent: people don't leave companies, they leave managers.

**RelationshipSatisfaction (4.4%)** — Lateral organizational bonds. When peer connections fray, the signal appears here before it appears in exit interviews.

### Step 6 — Intervention Protocol Design (Deployment Proposal)

A model that lives in a notebook is an academic exercise. The production design generates **monthly employee risk scores** (probability of voluntary exit within 90 days) and routes high-risk employees to targeted interventions based on the primary risk driver:

| Primary Driver | Intervention Protocol |
|---|---|
| No equity + high risk | Stock option expansion proposal |
| Below-market income | Compensation benchmarking + adjustment review |
| High overtime + elevated risk | Workload redistribution + burnout prevention |
| Short manager tenure | Proactive manager coaching + stability plan |

**Ethics note:** the model flags risk — it does not determine action. Human judgment remains in the loop at every step. The algorithm informs the conversation; the manager conducts it.

---

## The Economics of Retention Infrastructure

My MSc in Economics at UFF trained me in production function decomposition: output depends on capital, labor, and total factor productivity. A team's TFP includes tacit knowledge — institutional memory that lives in experienced professionals' heads and cannot be replicated by a new hire in 90 days.

Voluntary turnover destroys TFP. The retention algorithm is an **investment in TFP preservation**. The ROI case is simple: for a senior Data Scientist at market rate in Brazil (annual salary ~R$200k, replacement cost ~R$300–400k), the model needs to prevent one senior departure per year to justify its full operational cost. That is not a complex business case.

What this project demonstrated is that the technical components — class-balanced gradient boosting, SHAP attribution, threshold optimization — are mature and accessible. The harder problems are organizational: data governance, manager adoption, ethical framework, and the discipline to treat the model's output as input to human judgment rather than a replacement for it.

The garden continues growing.
