import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Car } from "lucide-react";
import { StatCard } from "../stat-card";
import { FuelBreakdownCard } from "../fuel-breakdown-card";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";

describe("Dashboard Components", () => {
  describe("StatCard", () => {
    it("should render label, value, and icon correctly", () => {
      render(<StatCard label="Total de Veículos" value={42} icon={Car} />);

      expect(screen.getByText("Total de Veículos")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should render skeleton when isLoading is true", () => {
      const { container } = render(<StatCard label="Total de Veículos" value={42} icon={Car} isLoading={true} />);

      expect(screen.queryByText("42")).not.toBeInTheDocument();
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("should render tooltip wrapper when tooltipText is provided", () => {
      render(
        <StatCard
          label="Total de Veículos"
          value={42}
          icon={Car}
          tooltipText="Total registrado no sistema"
        />
      );

      expect(screen.getByText("Total de Veículos")).toBeInTheDocument();
    });
  });

  describe("FuelBreakdownCard", () => {
    it("should render loading skeletons when isLoading is true", () => {
      const { container } = render(<FuelBreakdownCard vehicles={undefined} isLoading={true} />);

      expect(screen.getByText("Veículos por combustível")).toBeInTheDocument();
      expect(container.querySelectorAll(".animate-pulse").length).toBe(4);
    });

    it("should render empty message when vehicles list is empty or undefined", () => {
      render(<FuelBreakdownCard vehicles={[]} isLoading={false} />);

      expect(screen.getByText("Nenhum veículo cadastrado ainda.")).toBeInTheDocument();
    });

    it("should render fuel type percentage bars for vehicles in list", () => {
      const mockVehicles: Partial<Vehicle>[] = [
        { id: 1, fuelType: "FLEX" },
        { id: 2, fuelType: "FLEX" },
        { id: 3, fuelType: "GASOLINA" },
      ];

      render(<FuelBreakdownCard vehicles={mockVehicles as Vehicle[]} isLoading={false} />);

      expect(screen.getByText("Flex")).toBeInTheDocument();
      expect(screen.getByText("Gasolina")).toBeInTheDocument();
      expect(screen.getByText("2 (67%)")).toBeInTheDocument();
      expect(screen.getByText("1 (33%)")).toBeInTheDocument();
    });
  });
});
