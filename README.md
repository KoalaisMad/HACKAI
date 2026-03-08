# Crisis Intelligence System

A real-time risk assessment and event monitoring dashboard for maritime activities, built with Next.js.

## Features

- **Global Risk Map** – Interactive map with ship markers and alert indicators (Tanker Security Alert, Storm Alerts, Missile Test)
- **Event Feed** – Chronological list of recent events with severity tags (High/Med) and activity chart
- **Risk & Oil Price Trend** – Dual-line chart showing risk and oil price over time with event markers
- **Shipping Status** – Key metrics (tankers in region, avg speed, reroutes) with mini map
- **Crisis Briefing** – Event summary, risk score, predicted impact, top factors, and audio briefing button (positioned above the Event Feed)
- **StraitWatch Assistant** – In-app chatbot powered by Google Gemini for questions about risk, events, and shipping

## Getting Started

**Frontend (required):** From the repo root:

```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Backend (optional, for auth, dashboard data, and StraitWatch Assistant chat + voice):**

```bash
cd Backend
cp .env.example .env
# Edit .env: set GEMINI_API_KEY (chat), ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (voice)
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `Frontend/.env.local` to use the backend. The StraitWatch Assistant (Gemini chat + ElevenLabs voice) only works when the backend is running and these keys are configured.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (line charts)
- **Lucide React** (icons)

## AI Intelligence & Voice Assistant

## Google Gemini AI 

### Purpose

The **StraitWatch Assistant** is an AI-powered chatbot that helps users understand maritime risks, geopolitical events, and shipping disruptions in real time. It translates complex data from multiple sources—such as news feeds, ML predictions, and shipping activity—into clear explanations and actionable insights.

### Implementation

**Backend**

File: `index.js`

- Uses the `@google/generative-ai` SDK  
- Model: **gemini-2.0-flash**  
- Endpoint: `POST /api/chat`

The backend receives a conversation history from the frontend and sends it to Gemini for processing. The system prompt configures the assistant with knowledge about:

- maritime shipping routes  
- geopolitical incidents  
- oil supply chain risks  
- StraitWatch risk scores  
- ML model predictions  

Gemini then generates a contextual response that explains the situation in natural language.

**Frontend**

File: `ChatBot.tsx`

- Sends user messages to `/api/chat`  
- Maintains conversation history  
- Displays messages in a conversational UI  
- Supports **voice input using the Web Speech API**

This allows users to interact with the system using natural language instead of navigating dashboards or raw datasets.

### Data Context

Gemini responses are augmented with summarized outputs from:

- machine learning risk prediction models  
- shipping traffic signals  
- global incident datasets  
- energy market indicators  

This ensures the assistant provides **data-grounded explanations rather than generic AI responses**.

---

## ElevenLabs 

### Purpose

To improve accessibility and safety, StraitWatch converts AI responses into **natural spoken briefings** using ElevenLabs.

This enables users—such as analysts, operators, or drivers—to **receive risk updates without needing to look at their screens**.

### Implementation

**Backend**

File: `index.js`

- Uses `@elevenlabs/elevenlabs-js`  
- Endpoint: `POST /api/tts`  
- Model: **eleven_multilingual_v2**

## Antigravity — AI Development Acceleration

During development, **Antigravity AI** played a key role in accelerating engineering workflows and maintaining code quality.

### Purpose

Antigravity assisted with debugging, development troubleshooting, and repository management, allowing the team to focus on building the core prediction market platform.

### Key Contributions

- Helped diagnose and fix backend integration issues across the AI pipeline
- Assisted with debugging API calls and data flow between services
- Provided guidance for implementing model integrations and chatbot logic

### Repository Recovery & Optimization

Antigravity also helped resolve critical repository issues that were blocking development:

- Resolved **complex Git divergence and rebase conflicts**
- Performed **history cleanup** to remove extremely large files
- Removed cached **GDELT data files exceeding 1GB**
- Restored the repository to a state where it could be successfully pushed to GitHub

This allowed the team to maintain a **clean, manageable codebase** and continue development without repository size limitations.
Input:

```json
{
  "text": "AI generated response",
  "voiceId": "optional"
}
```

---

## Solana — Decentralized Prediction Market

### Purpose

Solana powers the **decentralized prediction market** layer of the platform, allowing users to place tokenized bets on future oil price movements.

### Implementation

- Users can submit predictions on future oil prices
- Each prediction requires a certain number of tokens to participate
- Smart contracts record the prediction and lock tokens into the market

When prediction outcomes are evaluated:

- Users with **accurate predictions receive token rewards**
- Users with incorrect predictions lose their stake

This creates an **incentivized market-driven forecasting system**, where collective intelligence contributes to more accurate predictions.

---

## MongoDB Atlas — Data Storage & Prediction History

### Purpose

MongoDB Atlas provides the **primary database infrastructure** for storing user activity, prediction history, and system data.

### Implementation

MongoDB stores:

- User accounts and authentication data
- Prediction submissions from users
- Token bet records
- Timestamps for all predictions and bets
- Historical snapshots of oil price predictions generated by the system

These stored prediction snapshots allow the system to:

- Track prediction performance over time
- Validate outcomes of the prediction market
- Maintain a transparent historical record of forecasts

Using MongoDB Atlas enables **scalable, real-time data storage** while supporting rapid queries across user predictions and market activity.

---
## Models - Predictions
### Model Architecture

The platform’s predictive capabilities are supported by several custom machine learning models designed to forecast short-term oil price movements using both shipment traffic and news data.

For predictions based on news data, we performed structured feature engineering and leveraged the financial language model FinBERT to efficiently extract relevant signals from news articles. This approach enabled improved training efficiency and model accuracy. We also implemented a GARCH-X volatility model, which captures time-varying market volatility while incorporating exogenous news features. In addition, we trained a gradient boosting model using LightGBM to further enhance predictive performance. Model performance was evaluated using Root Mean Squared Error (RMSE) and the coefficient of determination (R²).

For shipment-traffic-based predictions, we trained multiple ensemble learning models including XGBoost, Random Forest, and Gradient Boosting. To better understand the relative importance of shipping-related features, we applied Principal Component Analysis (PCA) for dimensionality reduction and feature impact analysis. These models were also evaluated using RMSE and R² to assess predictive accuracy.

### Model Equations Reference

> Mathematical formulations for **FinBERT**, **GARCH-X**, **LightGBM**, **XGBoost**, **Gradient Boosting**, and **Random Forest**.

---

### 1. FinBERT

FinBERT is a BERT-based transformer fine-tuned on financial text for sentiment classification.

#### Tokenization & Embedding

$$\mathbf{h}_0 = \mathbf{E}_{\text{token}} + \mathbf{E}_{\text{segment}} + \mathbf{E}_{\text{position}}$$

#### Multi-Head Self-Attention (per layer $\ell$)

$$\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{softmax}\!\left(\frac{\mathbf{Q}\mathbf{K}^\top}{\sqrt{d_k}}\right)\mathbf{V}$$

$$\text{MultiHead}(\mathbf{H}) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)\,\mathbf{W}^O$$

$$\text{head}_i = \text{Attention}(\mathbf{H}\mathbf{W}_i^Q,\; \mathbf{H}\mathbf{W}_i^K,\; \mathbf{H}\mathbf{W}_i^V)$$

#### Feed-Forward Sub-layer

$$\text{FFN}(\mathbf{x}) = \max(0,\; \mathbf{x}\mathbf{W}_1 + \mathbf{b}_1)\,\mathbf{W}_2 + \mathbf{b}_2$$

#### Layer Normalization & Residual

$$\mathbf{h}_\ell = \text{LayerNorm}\!\left(\mathbf{h}_{\ell-1} + \text{SubLayer}(\mathbf{h}_{\ell-1})\right)$$

#### Classification Head (Sentiment)

$$\hat{y} = \text{softmax}\!\left(\mathbf{W}_c\,\mathbf{h}_L^{[\text{CLS}]} + \mathbf{b}_c\right)$$

$$\mathcal{L} = -\sum_{c} y_c \log \hat{y}_c \qquad \text{(cross-entropy)}$$

| Symbol | Description |
|--------|-------------|
| $d_k$ | Key/query dimension per head |
| $h$ | Number of attention heads |
| $\mathbf{h}_L^{[\text{CLS}]}$ | Final hidden state of the `[CLS]` token |
| $\hat{y}_c$ | Predicted probability for class $c$ (Positive / Neutral / Negative) |

---

### 2. GARCH-X

Extends GARCH by adding an exogenous variable $x_t$ to the conditional variance equation.

#### Mean Equation

$$r_t = \mu + \varepsilon_t$$

#### Variance Equation

$$\sigma_t^2 = \omega + \sum_{i=1}^{q} \alpha_i\,\varepsilon_{t-i}^2 + \sum_{j=1}^{p} \beta_j\,\sigma_{t-j}^2 + \gamma\,x_{t-1}$$

#### Error Term

$$\varepsilon_t = \sigma_t z_t, \qquad z_t \overset{iid}{\sim} \mathcal{N}(0,1)$$

#### Stationarity Condition

$$\sum_{i=1}^{q}\alpha_i + \sum_{j=1}^{p}\beta_j < 1$$

#### Common GARCH-X(1,1)

$$\sigma_t^2 = \omega + \alpha\,\varepsilon_{t-1}^2 + \beta\,\sigma_{t-1}^2 + \gamma\,x_{t-1}$$

| Symbol | Description |
|--------|-------------|
| $\omega > 0$ | Variance intercept |
| $\alpha_i \geq 0$ | ARCH (shock) coefficients |
| $\beta_j \geq 0$ | GARCH (persistence) coefficients |
| $\gamma$ | Exogenous variable coefficient |
| $x_{t-1}$ | Lagged exogenous input (e.g. VIX, realized variance) |

---

### 3. LightGBM

Gradient boosting using **leaf-wise** tree growth with histogram-based splitting.

#### Ensemble Prediction

$$\hat{y}_i = \sum_{k=1}^{K} f_k(\mathbf{x}_i), \qquad f_k \in \mathcal{F}$$

#### Objective Function

$$\mathcal{L} = \sum_{i=1}^{n} \ell\!\left(y_i,\, \hat{y}_i^{(t-1)} + f_t(\mathbf{x}_i)\right) + \Omega(f_t)$$

#### Regularization Term

$$\Omega(f) = \gamma T + \frac{1}{2}\lambda \sum_{j=1}^{T} w_j^2$$

#### Optimal Leaf Weight

$$w_j^* = -\frac{\sum_{i \in I_j} g_i}{\sum_{i \in I_j} h_i + \lambda}$$

#### Leaf-Wise Split Gain

$$\text{Gain} = \frac{1}{2}\left[\frac{\left(\sum_{i \in I_L} g_i\right)^2}{\sum_{i \in I_L} h_i + \lambda} + \frac{\left(\sum_{i \in I_R} g_i\right)^2}{\sum_{i \in I_R} h_i + \lambda} - \frac{\left(\sum_{i \in I} g_i\right)^2}{\sum_{i \in I} h_i + \lambda}\right] - \gamma$$

| Symbol | Description |
|--------|-------------|
| $g_i = \partial_{\hat{y}} \ell(y_i, \hat{y}_i)$ | First-order gradient |
| $h_i = \partial^2_{\hat{y}} \ell(y_i, \hat{y}_i)$ | Second-order gradient (Hessian) |
| $T$ | Number of leaves in tree $f_t$ |
| $w_j$ | Weight (output value) of leaf $j$ |
| $\lambda, \gamma$ | L2 and leaf-count regularization |

---

### 4. XGBoost

Gradient boosting with **level-wise** tree growth and explicit second-order Taylor expansion.

#### Ensemble Prediction

$$\hat{y}_i^{(t)} = \hat{y}_i^{(t-1)} + \eta\, f_t(\mathbf{x}_i)$$

#### Taylor-Expanded Objective

$$\mathcal{L}^{(t)} \approx \sum_{i=1}^{n}\left[g_i f_t(\mathbf{x}_i) + \frac{1}{2} h_i f_t^2(\mathbf{x}_i)\right] + \Omega(f_t)$$

#### Regularization Term

$$\Omega(f_t) = \gamma T + \frac{1}{2}\lambda \|\mathbf{w}\|^2 + \alpha \|\mathbf{w}\|_1$$

#### Optimal Leaf Weight

$$w_j^* = -\frac{G_j}{H_j + \lambda}, \qquad G_j = \sum_{i \in I_j} g_i,\quad H_j = \sum_{i \in I_j} h_i$$

#### Optimal Split Gain

$$\text{Gain} = \frac{1}{2}\left[\frac{G_L^2}{H_L+\lambda} + \frac{G_R^2}{H_R+\lambda} - \frac{(G_L+G_R)^2}{H_L+H_R+\lambda}\right] - \gamma$$

| Symbol | Description |
|--------|-------------|
| $\eta$ | Learning rate (shrinkage) |
| $\alpha$ | L1 regularization on leaf weights |
| $\lambda$ | L2 regularization on leaf weights |
| $\gamma$ | Minimum gain required to split |

---

### 5. Gradient Boosting

General framework: sequentially fit weak learners $h_t$ to **pseudo-residuals**.

#### Ensemble at Step $t$

$$F_t(\mathbf{x}) = F_{t-1}(\mathbf{x}) + \eta\, h_t(\mathbf{x})$$

#### Initialization

$$F_0(\mathbf{x}) = \arg\min_{\gamma} \sum_{i=1}^{n} \ell(y_i, \gamma)$$

#### Pseudo-Residuals (Negative Gradient)

$$r_{it} = -\left[\frac{\partial\, \ell(y_i, F(\mathbf{x}_i))}{\partial\, F(\mathbf{x}_i)}\right]_{F = F_{t-1}}$$

#### Fit Weak Learner & Line Search

$$h_t = \arg\min_{h} \sum_{i=1}^{n}\left(r_{it} - h(\mathbf{x}_i)\right)^2$$

$$\rho_t = \arg\min_{\rho} \sum_{i=1}^{n} \ell\!\left(y_i,\, F_{t-1}(\mathbf{x}_i) + \rho\, h_t(\mathbf{x}_i)\right)$$

#### Common Loss Functions

| Task | Loss $\ell(y, F)$ | Pseudo-Residual |
|------|-------------------|-----------------|
| Regression | $\tfrac{1}{2}(y - F)^2$ | $y - F$ |
| Classification | $\log(1 + e^{-yF})$ | $y - \sigma(F)$ |
| Quantile ($\tau$) | $\tau(y-F)_+ + (1-\tau)(F-y)_+$ | $\tau - \mathbf{1}[y < F]$ |

---

### 6. Random Forest

Ensemble of $B$ decision trees trained on **bootstrap samples** with **random feature subsets**.

#### Bootstrap Sampling

$$\mathcal{D}_b \sim \text{Bootstrap}(\mathcal{D}), \qquad b = 1, \ldots, B$$

#### Node Split Criterion

**Classification — Gini Impurity:**

$$G(t) = 1 - \sum_{c=1}^{C} p_{tc}^2$$

**Regression — Variance Reduction:**

$$\Delta = \text{Var}(S) - \frac{|S_L|}{|S|}\text{Var}(S_L) - \frac{|S_R|}{|S|}\text{Var}(S_R)$$

#### Ensemble Prediction

**Regression (average):**

$$\hat{y} = \frac{1}{B}\sum_{b=1}^{B} T_b(\mathbf{x})$$

#### Out-of-Bag (OOB) Error

$$\hat{\varepsilon}_{\text{OOB}} = \frac{1}{n}\sum_{i=1}^{n}\ell\!\left(y_i,\; \frac{1}{|\mathcal{B}_i|}\sum_{b \in \mathcal{B}_i} T_b(\mathbf{x}_i)\right)$$

where $\mathcal{B}_i = \{b : \mathbf{x}_i \notin \mathcal{D}_b\}$ is the set of trees that did **not** see observation $i$.

#### Feature Importance (Mean Decrease Impurity)

$$\text{FI}(j) = \frac{1}{B}\sum_{b=1}^{B}\sum_{t \in T_b : v(t)=j} p(t)\cdot\Delta_{\text{impurity}}(t)$$

| Symbol | Description |
|--------|-------------|
| $B$ | Number of trees |
| $m \leq p$ | Features sampled per split ($m \approx \sqrt{p}$ for classification, $p/3$ for regression) |
| $p(t)$ | Fraction of samples reaching node $t$ |
| $C$ | Number of classes |

