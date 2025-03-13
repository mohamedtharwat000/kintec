import { App } from "@/components/App";
import Dashboard from "@/components/dashboard/Dashboard";

export default function Page() {
  return <App dashboard={<Dashboard />} />;
}
