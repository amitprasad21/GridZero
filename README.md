# Grid Zero – Solar Shadow Analysis & Efficiency Estimation Tool

**Grid Zero** is a production-ready, premium-quality 3D Solar Shadow Analysis and Performance Forecasting application. Built for engineers, project developers, and site assessors, it models surrounding structures, projects astronomical sun paths, and computes real-time shading and mismatch losses on solar panel tables with high precision.

---

## ⚡ Key Features

*   **Astronomical Sun Positioning**: Integrates standard celestial math (`SunCalc`) to project sun position based on date, time, latitude, and longitude. Includes preset locations (e.g. Los Angeles, Tokyo, Sydney) and automatic time-lapse playback.
*   **Manual Mode override**: Direct azimuth and elevation slider controls for testing arbitrary sun conditions.
*   **Analytical CPU Raycasting Engine**: A sub-millisecond raytracer that checks obstruction for 100 sample points on each solar panel at 60 FPS, ensuring zero WebGL read-back lag.
*   **Edge Occlusion Factor (EOF)**: A custom engineering metric that evaluates shading proximity to panel borders to model cell mismatch losses accurately.
*   **Electrical Substring Simulation**: Simulates bypass diode activation in three separate substrings per panel for realistic, non-linear shading performance loss.
*   **Premium Interactive Viewport**: Responsive 3D scene built on React Three Fiber, OrbitControls, and clean shadows, featuring an overlay grid indicating exact shadow points.
*   **Dual Light/Dark Theme**: A glassmorphic theme dashboard that seamlessly adapts from dark mode to a premium light theme.
*   **Data Export**: Built-in CSV and JSON dataset exporters that download raw simulated panel parameters and hourly forecasts.

---

## 🏗️ Folder Structure & Architecture

Grid Zero is structured around strict SOLID design principles and separation of concerns:

```
src/
├── app/                  # Next.js App Router root layout, global stylesheet, and page shell
├── components/
│   ├── scene/            # 3D canvas and React Three Fiber models (Building, WaterTank, SolarTable)
│   ├── controls/         # Control panels (Sun/Time settings, Obstacle dimension sliders)
│   ├── analytics/        # KPI metrics cards, Recharts time-series forecast, and report exporters
│   └── ui/               # Radix UI primitives and utility icons
├── store/                # Zustand global state (tables, obstacles, sun data, recalculation loop)
├── types/                # Strict TypeScript typings for all core entities
├── utils/                # Pure mathematical engines (Sun calculations, raycasting, EOF, efficiency)
```

---

## 📐 Mathematical Methodology

### 1. Sun Positioning
Using coordinates and date/time, the sun's position is calculated in horizontal coordinates (altitude and azimuth). These angles are projected into a 3D unit direction vector $\vec{S}$:
*   $X = \cos(\text{altitude}) \cdot \sin(\text{azimuth})$
*   $Y = \sin(\text{altitude})$
*   $Z = -\cos(\text{altitude}) \cdot \cos(\text{azimuth})$

*(Where $+Y$ is Up, $+X$ is East, and $-Z$ is North. When altitude $\le 0$, the sun is below the horizon, and direct output is zero).*

### 2. Ray-Obstacle Intersection
To evaluate shading, 100 points $P$ on each panel's surface are ray-traced: $\vec{R}(t) = P + t\vec{S}$ for $t > 0.0001$:
*   **Building (AABB)**: Ray intersects the building if the slab overlaps in X, Y, and Z intervals for $t > 0$.
*   **Water Tank (Cylinder)**: Projects coordinates onto the XZ plane to solve for the quadratic intersection with the circle $(X - C_x)^2 + (Z - C_z)^2 \le R^2$. If the ray enters the cylinder, the vertical coordinates ($Y$) at entry and exit times are checked against the height limit $[0, H]$.

### 3. Edge Occlusion Factor (EOF)
Edge shading has a disproportionate effect on series-connected cells. We define proximity weight $W(u, v)$ for point coordinates $(u, v) \in [0, 1] \times [0, 1]$ relative to panel edges:
$$d(u, v) = \min(u, 1-u, v, 1-v)$$
$$W(u, v) = 1.0 - 2 \cdot d(u, v)$$
$$\text{EOF} = \frac{\sum_{p \in \text{shaded}} W(p)}{\sum_{p \in \text{all}} W(p)} \times 100\%$$

**EOF Classification**:
*   $\text{EOF} < 15\%$: **Low Risk**
*   $15\% \le \text{EOF} < 40\%$: **Medium Risk**
*   $\text{EOF} \ge 40\%$: **High Risk**

### 4. Bypass Diode & Efficiency Calculations
Standard solar panels feature bypass diodes separating three vertical substrings (left, middle, right thirds).
1.  **Substring Shading**: Calculate the percentage of shaded points in each third of the panel ($S_{\text{left}}, S_{\text{mid}}, S_{\text{right}}$).
2.  **Diode Activation**: If shading in a substring $> 5\%$, its bypass diode triggers. Its output drops to $10\%$. If $100\%$ shaded, it drops to $0\%$. Otherwise, it outputs $1.0 - S_{\text{sub}}$.
3.  **Overall Panel Efficiency**:
    $$\text{Eff}_{\text{base}} = \frac{\text{Eff}_{\text{left}} + \text{Eff}_{\text{mid}} + \text{Eff}_{\text{right}}}{3}$$
    $$\text{Efficiency} = \text{Eff}_{\text{base}} \times (1.0 - \text{EOF} \cdot 0.5) \times 100\%$$

---

## 🛠️ Setup & Local Development

### Prerequisites
*   Node.js (v18+)
*   npm

### Installation
1.  Install dependencies:
    ```bash
    npm install --legacy-peer-deps
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification & Builds
To verify code quality and build standard production bundles:
```bash
# Run ESLint validation
npm run lint

# Compile and build production Next.js app
npm run build
```

---

## 📋 Assumptions & Limitations

*   **Ideal Diffuse Sky**: Shading model focuses purely on direct beam solar radiation. Diffuse solar radiation (scattered light from sky) and albedo reflections are simplified.
*   **Flat Surface Plane**: Ground is assumed to be a flat plane ($Y = 0$). Complex terrains/slopes are not simulated.
*   **No Tilt Adjustments**: Solar arrays are simulated with a fixed tilt angle of $15^\circ$ facing South.
*   **Static Obstacles**: Obstacles are static unless manually repositioned via sliders. Intermittent shadow casters (e.g. tree swaying, passing clouds) are not modeled.

---

## 🚀 Deployment (Vercel)

This application is ready to deploy directly to Vercel without server configurations (as all logic resides on the client):
1.  Push the repository to GitHub.
2.  Import the project into the [Vercel Dashboard](https://vercel.com).
3.  Keep default Next.js build settings and click **Deploy**.
