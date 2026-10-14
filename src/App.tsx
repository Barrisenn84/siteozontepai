/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import do componente Dashboard de vidro líquido
import GlassDashboard from "./components/GlassDashboard";

export default function App() {
  return (
    <div className="glass-morphism max-w-full max-h-full flex items-center justify-center bg-black">
      <GlassDashboard />
    </div>
  );
}