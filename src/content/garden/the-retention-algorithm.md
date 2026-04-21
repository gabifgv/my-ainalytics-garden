---
title: "The Retention Algorithm: Engineering an XGBoost People Analytics System to Predict Voluntary Turnover"
date: 2026-04-21
category: "MLOps"
flower_type: "Tulip"
keyword: "PeopleAnalytics"
id: "21/04/2026"
author: "Gabriella Pinheiro"
status: "Live 🌱"
excerpt: "A rigorous people analytics case study — how I built a production-ready XGBoost pipeline to predict employee voluntary turnover, and what the feature importance ranking reveals about the true economics of retention."
---

## The Cost Equation That Changes Everything

People analytics is not HR's new toy. It is a response to a measurable business failure. When a professional leaves voluntarily, the organization incurs a replacement cost estimated at **1.5× to 2× their annual salary** — factoring in recruitment, onboarding, productivity loss during the ramp period, and knowledge transfer decay. For a team of 13 at a high-complexity data organization like FGV, a single unexpected departure in a specialized role (Data Scientist, MLOps Engineer) carries operational disruption far exceeding any recruitment line item.

The question is not whether turnover is costly. The question is whether it is **predictable** — and if predictable, whether it is preventable. This is the hypothesis the `portfolio-ml` people analytics project was designed to test.

---

## Why XGBoost Won (And Why I Almost Chose Random Forest)

The model comparison evaluated four classifiers on a dataset of **1,470 employees across 31 features**, with a voluntary turnover rate of **16.1%** (237 exits). The class imbalance was the first technical challenge: with a 5.2:1 majority/minority ratio, a naive classifier can achieve 83.9% accuracy by simply predicting "stays" for every observation. Accuracy is not the metric that matters here. **F1-Score is**.

Results after threshold optimization:

| Model | F1-Score | AUC-ROC |
|---|---|---|
| Logistic Regression | 0.393 | 0.711 |
| Random Forest (300 trees, depth=10) | 0.396 | 0.712 |
| **XGBoost (300 est., depth=6, lr=0.1)** | **0.417** | **0.711** |
| Neural Network (MLP 64→32) | 0.299 | 0.596 |

XGBoost's margin over Random Forest is modest (F1 +0.021), but the precision advantage (0.413 vs. ~0.390) is strategically relevant: in a retention intervention context, **false alarms are expensive**. Each flagged employee who is not actually at risk consumes a retention action — a compensation review, a development conversation, a manager intervention. Precision controls for the cost of acting on the wrong signal.

The Neural Network underperformed significantly (F1 0.299), which aligns with the general principle that deep learning requires data volume to justify its complexity. At 1,470 rows, gradient boosting dominates.

---

## The Class Imbalance Architecture: Where Most Projects Go Wrong

The SMOTE implementation deserves its own section because this is where most data science projects introduce subtle but consequential errors.

SMOTE (Synthetic Minority Oversampling Technique) generates synthetic minority observations by interpolating between existing minority samples in feature space. The critical constraint: **SMOTE must be applied exclusively to the training set**. If you apply SMOTE before the train/test split — a common mistake — synthetic observations from the test set leak into training data, inflating performance metrics and destroying the validity of your evaluation.

The pipeline architecture:

```python
# CORRECT: SMOTE inside CV fold, never on test set
pipeline = Pipeline([
    ('smote', SMOTE(random_state=42)),
    ('clf', XGBClassifier(...))
])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
```

The 70/30 stratified split preserves the original 16.1% turnover proportion in the test set. This is the **realistic evaluation condition** — you are testing how the model performs against the true population distribution, not an artificially balanced one.

Threshold optimization followed: custom 5-fold cross-validation to identify the decision threshold that maximizes F1-Score per fold, then averaging. This is more robust than using the default 0.5 threshold, which was calibrated for balanced classes.

---

## What the Features Tell You: Economics Disguised as HR Data

Feature importance from the Random Forest (which shares most signal structure with XGBoost) ranks the predictors:

1. **Stock Options (9.7%)** — Equity ownership creates an economic stake in the organization's future. No stock options = no deferred compensation = lower switching cost. From an economic theory standpoint, this is the **asset specificity** problem: employees without equity have no firm-specific investment to protect.

2. **Salary (6.3%)** — Below-market compensation is the most legible retention failure. The signal here is not absolute salary level — it is relative competitiveness. An employee earning R$15k in a market where equivalent roles pay R$18k is permanently in search mode.

3. **Job Satisfaction (5.3%)** — This is the variable economists call **non-pecuniary compensation**. Satisfaction with work content, autonomy, and impact is a real form of compensation that offsets salary gaps — until it isn't.

4. **Time With Current Manager (4.9%)** — The organizational behavior literature has a phrase for this: *people don't leave companies, they leave managers*. A data team whose Data Scientists rotate through multiple managers within 18 months shows consistently higher attrition than a stable, high-trust manager relationship.

5. **Relationship Satisfaction (4.4%)** — Workplace culture as a retention mechanism. High-performing data teams have strong lateral bonds (peer learning, technical respect, collaborative debugging). When those bonds fray, the signal appears here.

The demographic patterns are equally informative: single employees exit at nearly twice the rate of married peers (reduced anchoring costs), while overtime workers show 3–4× higher exit rates (burnout premium). Sales and R&D departments concentrate exits — both roles with high external labor market demand and portable skills.

---

## From Model to Intervention: Closing the MLOps Loop

A turnover prediction model that lives in a notebook is not a people analytics system. It is an academic exercise. The `portfolio-ml` project was designed with deployment in mind.

The production artifact generates **monthly employee risk scores** (probability of voluntary exit in the next 90 days). These scores feed four targeted intervention protocols:

- **High-risk, no equity**: Stock option expansion proposal for operational roles
- **High-risk, below-market salary**: Compensation benchmarking and adjustment review
- **High-risk, high overtime**: Workload redistribution and burnout prevention protocols
- **High-risk, low manager tenure**: Proactive manager coaching and stability intervention

The ethics of this matter. As a Data Lead managing 13 professionals, I am acutely aware that algorithmic decision-making in HR contexts carries risks of confirmation bias and discriminatory proxies. The model flags risk — it does not determine action. **Human judgment remains in the loop**. The algorithm informs the conversation; the manager conducts it.

---

## The Economics of Retention Infrastructure

My MSc in Economics at UFF trained me in production function decomposition: output depends on capital, labor, and total factor productivity (TFP). A team's TFP includes tacit knowledge — the institutional memory that lives in experienced professionals' heads and cannot be replicated by a new hire in 90 days.

Voluntary turnover destroys TFP. The retention algorithm is an **investment in TFP preservation**. And like any investment, it needs a return calculation: intervention cost × success rate vs. replacement cost × churn rate.

For a senior Data Scientist at market rate: annual salary ~R$200k. Replacement cost: R$300–400k (recruitment, onboarding, ramp-up productivity loss). Monthly model run cost: negligible. The ROI case requires preventing a single senior departure per year.

That is not a complex business case. It is the simplest equation in people management.

The garden continues growing.
