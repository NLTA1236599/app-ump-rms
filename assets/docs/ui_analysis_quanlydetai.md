# UI Analysis: 2-QuanLyDeTai.tsx

## Overview
The `2-QuanLyDeTai.tsx` file defines a React component named `Overview`. It serves as a comprehensive dashboard for managing and analyzing research projects ("Quản lý đề tài"). The UI is built using modern React hooks, styled with Tailwind CSS, and utilizes several powerful libraries for data visualization and exporting.

## Key Features & Functionality
1. **Summary Statistics Cards**: Displays a responsive grid of 6 cards highlighting key metrics (Total Projects, Total Budget, Ongoing, Completed, Extended, Overdue).
2. **Data Filtering Sidebar**: A sticky sidebar allowing users to filter the overall dataset by Start Year, Project Status, Research Field, and Department.
3. **Data Visualization**:
   - **Fixed Charts**: A pie chart showing the distribution of project statuses, and a horizontal bar chart showing budget allocation by department.
   - **Dynamic Chart Builder**: An interactive section allowing users to select the chart type (Bar, Line, Pie), X-axis dimension (e.g., department, status), and Y-axis metric (e.g., count, budget) to dynamically explore the data.
4. **Chart Export & Expansion**:
   - Users can expand any chart into a fullscreen modal for detailed viewing.
   - Charts can be exported to Excel, which includes both the structured raw data and a visual snapshot (image) of the chart.
5. **AI Chat Assistant Widget**: A floating widget positioned in the bottom-left corner that provides a chat interface to a virtual assistant (powered by a Gemini service).

## UI Layout & Composition
- **Main Layout**: Uses a responsive flexbox/grid layout. On larger screens (`xl`), it splits into a main content area (charts and stats) and a right-aligned sidebar for filters (`w-full xl:w-80`).
- **Stats Section**: A responsive grid (`grid-cols-2 md:grid-cols-3 xl:grid-cols-6`) for displaying high-level metrics.
- **Charts Section**: 
  - Fixed charts are placed side-by-side on large screens (`lg:grid-cols-2`).
  - The dynamic chart builder occupies full width below the fixed charts.
- **Floating Elements**: The chat widget uses `fixed` positioning, and chart expansions use a fullscreen modal overlay (`fixed inset-0 z-[100] backdrop-blur-sm`).

## Design & Aesthetics (Tailwind CSS)
The component implements a highly polished, premium, and modern UI:
- **Shapes & Shadows**: Extensive use of large border-radiuses (`rounded-2xl`, `rounded-[24px]`, `rounded-[32px]`) and soft drop shadows (`shadow-sm`, `shadow-2xl`, custom colored shadows like `shadow-blue-100`) to create a modern card effect.
- **Colors**: 
  - A clean light-gray/white foundation (`bg-slate-50`, `bg-white`) combined with distinct, vibrant colors for statuses and charts (emerald, amber, red, purple, blue).
  - Use of gradients, specifically in the AI chat widget (`bg-gradient-to-br from-blue-600 to-indigo-800`).
- **Typography**: Emphasizes readability with careful use of font weights (`font-black`, `font-bold`), small tracking/uppercase for labels (`uppercase tracking-widest`), and subdued colors for secondary text (`text-slate-500`).
- **Interactivity & Animation**: Includes dynamic micro-animations such as `animate-fadeIn`, `animate-slideUp`, `animate-ping` (for the AI widget notification pulse), and smooth hover effects. Chart action buttons (zoom/export) elegantly reveal themselves on card hover (`group-hover:opacity-100`).

## External Libraries
- **`recharts`**: Core library for rendering all graphs (BarChart, LineChart, PieChart) and making them responsive.
- **`exceljs` & `file-saver`**: For building and downloading customized `.xlsx` files.
- **`html2canvas`**: Used to take screenshots of the DOM chart elements to embed them directly into the Excel export.

## Code Architecture
- Uses multiple React hooks (`useState`, `useMemo`, `useEffect`, `useRef`) for complex state management and performance optimization (recalculating data only when dependencies change).
- Data is processed robustly, handling missing values, parsing JSON strings for products, and extracting years from various date string formats.

## Overall Impression
The UI is heavily data-driven yet remains uncluttered due to the effective use of a sidebar for global filters and a modal for deep dives. The inclusion of a dynamic chart builder and a contextual AI assistant makes it a highly advanced, user-friendly, and visually "wow" dashboard.
