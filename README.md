# Dot-to-Dot Studio ✨

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An intuitive, powerful, and fast web-based tool for creating professional dot-to-dot activities from any image. Perfect for content creators, educators, and parents.


---

## 🚀 Live Demo

**Try it now! The application is live at:**

### [Dot to Dot Studio](https://halmousama.github.io/dot-to-dot-studio/)

---

## 🌟 Key Features

-   **Multi-Project Workspace:** Upload and switch between multiple images in a single session.
-   **Intelligent Auto-Generation:** A smart "Magic Wand" algorithm (powered by OpenCV.js) to create an initial set of points automatically.
-   **Full Manual Control:** A complete suite of tools to add, delete, move, and re-sequence points with precision.
-   **Advanced Performance:** Built for speed with a Web Worker-powered generation engine and a highly optimized canvas, ensuring a smooth experience even with complex images.
-   **Real-time Customization:** Instantly change the appearance of dots, numbers, and paths with a modern, non-intrusive control panel.
-   **Flexible Export Options:** Export your work as PNG, JPEG, or export all projects at once into a single PDF or ZIP file.
-   **Modern UX/UI:** Features like dark mode, interactive scrubbing inputs, and keyboard shortcuts make the creation process a breeze.

---

## 🛠️ Tech Stack

This project is built with a modern, high-performance tech stack:

-   **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
-   **Canvas Rendering:** [Konva.js](https://konvajs.org/) & [react-konva](https://github.com/konvajs/react-konva)
-   **State Management:** React Context API with `useReducer`
-   **Image Processing:** [OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html) (in a Web Worker)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Deployment:** [GitHub Pages](https://pages.github.com/)

---

## 💻 Running Locally

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/halmousama/dot-to-dot-studio.git
    cd dot-to-dot-studio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## 🔮 Future Plans

This project is actively being improved. Some of the features planned for the future include:
-   [ ] **Advanced Algorithm Controls:** Expose more OpenCV parameters (like Canny thresholds) to the user.
-   [ ] **SVG Export:** Add support for exporting projects as scalable vector graphics.
-   [ ] **Project Save/Load:** Ability to save the entire project state (points, settings) to a local file and load it back later.
-   [ ] **Color Palette Tool:** An eyedropper tool to pick colors directly from the image.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.