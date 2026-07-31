import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DashboardCards from "../components/DashboardCards";
import RecipeInfo from "../components/RecipeInfo";
import IngredientTable from "../components/IngredientTable";
import PricingCalculator from "../components/PricingCalculator";
import BestSeller from "../components/BestSeller";

export default function Dashboard() {
  return (
    <div className="flex bg-[#f8f5f2] min-h-screen">

      <Sidebar />

      <main className="flex-1">

        <Header />

        <div className="p-8">

          <DashboardCards />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

            <div className="space-y-6">
              <RecipeInfo />
              <IngredientTable />
            </div>

            <PricingCalculator />

          </div>

          <div className="mt-6">
            <BestSeller />
          </div>

        </div>

      </main>

    </div>
  );
}