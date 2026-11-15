import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { branchData } from "@/data/demo";

export default function BranchChart({
  showAxis = false,
}: {
  showAxis?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={branchData}>
        <CartesianGrid strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis hide={!showAxis} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#159274" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
