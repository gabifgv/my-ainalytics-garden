---
title: "The Retention Algorithm: Engineering an XGBoost People Analytics System to Predict Voluntary Turnover"
date: 2026-04-21
category: "MLOps"
flower_type: "tulip"
keyword: "PeopleAnalytics"
id: "03/01"
author: "Gabriella Pinheiro"
status: "Live 🌱"
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

The IBM HR Analytics dataset contains **1,470 employee records across 35 raw attributes**, representing a fictional company's workforce. The target variable is `Attrition` (voluntary exit: Yes/No). After removing non-predictive columns (`EmployeeNumber`, `Over18`, `EmployeeCount`, `StandardHours`), the working feature set is **31 variables**.

The dataset is structured, cross-sectional, and fully labeled — meaning no missing values, no time-series dependency, and no label noise. These properties make it well-suited for coursework but also more optimistic than real-world HR data, which typically has missingness, self-reporting bias, and evolving label definitions.

---

## Descriptive Statistics: What the Data Says Before the Model

Before training, understanding the marginal distributions of key variables is not optional — it is where the hypotheses come from.

**Target variable:**

| | Count | % |
|---|---|---|
| No Attrition (stays) | 1,233 | 83.9% |
| Attrition (exits) | 237 | 16.1% |

The **5.2:1 class ratio** is the central technical constraint of this project. Any evaluation metric that aggregates both classes (accuracy) will be misleading.

**Continuous variables — key statistics:**

| Variable | Mean | Median | Std Dev | Min | Max |
|---|---|---|---|---|---|
| Age | 36.9 | 36 | 9.1 | 18 | 60 |
| MonthlyIncome (USD) | 6,503 | 4,919 | 4,707 | 1,009 | 19,999 |
| YearsAtCompany | 7.0 | 5 | 6.1 | 0 | 40 |
| YearsWithCurrManager | 4.1 | 3 | 3.6 | 0 | 17 |
| TotalWorkingYears | 11.3 | 10 | 7.8 | 0 | 40 |
| TrainingTimesLastYear | 2.8 | 3 | 1.3 | 0 | 6 |
| DistanceFromHome | 9.2 | 7 | 8.1 | 1 | 29 |

High standard deviation on `MonthlyIncome` (4,707 on a mean of 6,503) indicates wide salary dispersion — the model needs to treat salary as a relative signal, not absolute. `YearsWithCurrManager` has a median of 3 with a long right tail, consistent with the literature on manager relationship stability as a retention factor.

**Categorical variables — attrition rate by group:**

| Variable | Group | Attrition Rate |
|---|---|---|
| OverTime | Yes | 30.5% |
| OverTime | No | 10.4% |
| MaritalStatus | Single | 25.5% |
| MaritalStatus | Married | 12.4% |
| MaritalStatus | Divorced | 10.1% |
| StockOptionLevel | 0 | 24.2% |
| StockOptionLevel | 1 | 11.3% |
| StockOptionLevel | 2 | 3.7% |
| StockOptionLevel | 3 | 8.6% |
| Department | Sales | 20.6% |
| Department | HR | 19.0% |
| Department | R&D | 13.8% |
| JobLevel | 1 (entry) | 26.3% |
| JobLevel | 5 (senior) | 4.8% |

Even without a model, these conditional distributions tell a coherent story: **overtime workers exit at nearly 3× the rate of non-overtime peers** (burnout signal). Single employees exit at 2× the married rate (lower anchoring costs). Employees with no stock options exit at 6.5× the rate of those at Level 2 (asset specificity effect). These patterns will surface again in feature importance — confirming that the model is learning interpretable economic signals, not noise.

**Ordinal satisfaction scales (1–4, where 1=Low, 4=Very High):**

| Scale | Mean | Attrition rate (score=1) | Attrition rate (score=4) |
|---|---|---|---|
| JobSatisfaction | 2.73 | 22.8% | 11.3% |
| EnvironmentSatisfaction | 2.72 | 25.4% | 13.0% |
| RelationshipSatisfaction | 2.71 | 20.6% | 13.0% |
| WorkLifeBalance | 2.76 | 31.2% | 17.5% |

Every satisfaction dimension shows the expected gradient: lower satisfaction correlates with higher exit rates. `WorkLifeBalance` shows the steepest gradient — employees at level 1 exit at 31.2%, roughly double the dataset average.

---

## The Pipeline: Step by Step

### Step 1 — Exploratory Data Analysis and Feature Engineering

Before any preprocessing, I mapped the attrition rate across each categorical variable and plotted distributions for all continuous features. The goal at this stage is to form hypotheses about which variables carry genuine predictive signal vs. noise.

Key EDA findings:
- `MonthlyRate`, `HourlyRate`, and `DailyRate` are three separate pay-related fields but show near-zero attrition differentiation — they appear to be internally inconsistent compensation records rather than true market salary proxies. `MonthlyIncome` is the only reliable compensation signal.
- `EmployeeCount`, `Over18`, and `StandardHours` are constants (value never varies) — zero predictive power, removed.
- `JobLevel` and `MonthlyIncome` are highly correlated (Pearson r ≈ 0.95) — kept both but noted collinearity for interpretation.

Encoding: all categorical variables (e.g., `Department`, `MaritalStatus`, `BusinessTravel`) were one-hot encoded. Ordinal scales (satisfaction scores, `JobLevel`, `StockOptionLevel`) were kept as integers — their ordinal nature carries information that dummy coding would destroy.

### Step 2 — Train/Test Split and Class Imbalance Handling

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.30, stratify=y, random_state=42
)
```

The `stratify=y` argument is non-negotiable: it ensures the 16.1% attrition proportion is preserved in both train and test sets. Without stratification, a random split could produce an unrepresentative test set, invalidating evaluation.

SMOTE (Synthetic Minority Oversampling Technique) was applied **inside the training pipeline only** — never on the test set and never before the split. This is the most common error in class imbalance handling:

```python
pipeline = Pipeline([
    ('smote', SMOTE(random_state=42)),
    ('clf', XGBClassifier(n_estimators=300, max_depth=6, learning_rate=0.1))
])
```

By encapsulating SMOTE inside a Pipeline, it only executes on the training fold during cross-validation. The test set always evaluates against the true class distribution — the realistic deployment condition.

### Step 3 — Model Selection and Comparison

Four models were trained and evaluated using 5-fold stratified cross-validation on the training set. Evaluation priority: **F1-Score** (harmonic mean of precision and recall) over accuracy. At a 16.1% minority class rate, accuracy is misleading — a model that predicts "No Attrition" for every observation achieves 83.9% accuracy without learning anything.

| Model | F1-Score | AUC-ROC | Precision | Recall |
|---|---|---|---|---|
| Logistic Regression | 0.393 | 0.711 | 0.401 | 0.385 |
| Random Forest (300 est., depth=10) | 0.396 | 0.712 | 0.390 | 0.402 |
| **XGBoost (300 est., depth=6, lr=0.1)** | **0.417** | **0.711** | **0.413** | **0.421** |
| Neural Network (MLP 64→32) | 0.299 | 0.596 | 0.312 | 0.287 |

XGBoost's margin over Random Forest is modest (F1 +0.021), but the **precision advantage (0.413 vs. 0.390) is strategically significant**. In a retention intervention context, false positives are expensive: each flagged employee who is not actually at risk consumes a retention action — a compensation review, a development conversation, a manager intervention. Higher precision means fewer wasted interventions.

The Neural Network underperformed significantly (F1 0.299), consistent with the principle that deep learning requires data volume to justify its complexity. At 1,470 rows, gradient boosting dominates.

### Step 4 — Threshold Optimization

XGBoost's default decision threshold is 0.5, calibrated for balanced classes. With a 16.1% minority, 0.5 is too conservative — it under-flags true attrition risk.

Custom threshold optimization: for each of the 5 CV folds, I evaluated F1-Score at thresholds from 0.1 to 0.9 in 0.01 increments, then averaged the optimal threshold across folds. The result was a threshold of **~0.35**, increasing recall (catching more real departures) without collapsing precision.

```python
thresholds = np.arange(0.1, 0.9, 0.01)
best_threshold = np.mean([
    thresholds[np.argmax([f1_score(y_val, proba >= t) for t in thresholds])]
    for _, (train_idx, val_idx) in enumerate(cv.split(X_train, y_train))
    ...
])
```

### Step 5 — Feature Importance Analysis

SHAP (SHapley Additive exPlanations) values provide model-agnostic feature attribution — each feature's contribution to a specific prediction, averaged across the dataset. The top predictors, ranked by mean absolute SHAP value:

1. **StockOptionLevel (9.7%)** — Equity ownership creates an economic stake in the organization. No stock options = no deferred compensation = lower switching cost. This is the **asset specificity** problem in labor economics: employees without firm-specific investment have no financial anchor.

2. **MonthlyIncome (6.3%)** — Below-market compensation is the most legible retention failure. The signal is relative, not absolute: an employee earning 15% below market is permanently in search mode regardless of their absolute number.

3. **JobSatisfaction (5.3%)** — Non-pecuniary compensation. Work content, autonomy, and impact offset salary gaps — until they don't. The 22.8% attrition rate at satisfaction level 1 vs. 11.3% at level 4 confirms the gradient.

4. **YearsWithCurrManager (4.9%)** — Manager relationship stability. The organizational behavior literature is consistent: people don't leave companies, they leave managers. Short manager tenure indicates instability, not just inexperience.

5. **RelationshipSatisfaction (4.4%)** — Lateral organizational bonds. High-performing technical teams have strong peer connections. When those fray, the signal appears here before it appears in exit interviews.

### Step 6 — Intervention Protocol Design (Deployment Proposal)

A model that lives in a notebook is an academic exercise. The production design generates **monthly employee risk scores** (probability of voluntary exit within 90 days) and routes high-risk employees to one of four intervention protocols based on the primary driver:

| Risk Driver | Intervention |
|---|---|
| No equity, high attrition probability | Stock option expansion proposal |
| Below-market income | Compensation benchmarking + adjustment review |
| High overtime, elevated risk | Workload redistribution + burnout prevention |
| Short manager tenure | Proactive manager coaching + stability plan |

Ethics note: algorithmic signals in HR contexts carry real risk — confirmation bias, discriminatory proxies embedded in historical data, dehumanizing reduction of individual complexity to a score. In this design, **the model flags risk; it does not determine action**. Human judgment remains in the loop. The algorithm informs the conversation; the manager conducts it.

---

## What the Features Tell You: Economics Disguised as HR Data

The feature importance ranking reads as a coherent economic narrative, not a list of statistical correlates. Stock options tie financial future to the organization. Market-competitive salary signals that the employer understands the employee's external value. Satisfaction measures capture the non-pecuniary dimension of the compensation bundle that economists have documented since the 1970s (Rosen, 1986 on compensating differentials).

The demographic patterns reinforce this reading. Single employees exit at twice the rate of married peers — lower anchoring costs means lower switching friction. Overtime workers exit at 3× the rate — the burnout premium is real and measurable. Department concentrations (Sales, HR) align with external labor market demand for those skills: more portable skills, more exit options.

What the model learns is not surprising to a labor economist. What it adds is precision: which specific employee, in which month, at what probability. That precision is what converts insight into intervention.

---

## The Economics of Retention Infrastructure

My MSc in Economics at UFF trained me in production function decomposition: output depends on capital, labor, and total factor productivity. A team's TFP includes tacit knowledge — institutional memory that lives in experienced professionals' heads and cannot be replicated by a new hire in 90 days.

Voluntary turnover destroys TFP. The retention algorithm is an **investment in TFP preservation**. The ROI case is simple: intervention cost × success rate vs. replacement cost × churn rate. For a senior Data Scientist at market rate in Brazil: annual salary ~R$200k, replacement cost ~R$300–400k. The model needs to prevent one senior departure per year to justify its operational cost. That is not a complex business case.

This project demonstrated that the technical components of people analytics — class-balanced gradient boosting, SHAP attribution, threshold optimization — are mature and accessible. The harder problems are organizational: data governance, manager adoption, ethical framework, and the discipline to treat the model's output as input to human judgment rather than a replacement for it.

The garden continues growing.
