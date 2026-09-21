import { DashboardHero, GlobalCards, PlayerCards, PunishmentAlert, RecentRuns } from "@/components/dashboard";
import { DemoBanner } from "@/components/ui";
import { getAppData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data=await getAppData();
  const current=data.runs.find(run=>run.status==="active")??data.runs[0]??null;
  const pending=data.punishments.find(item=>item.status==="pending");
  return <>{data.isDemo&&<DemoBanner error={data.error}/>}<DashboardHero current={current} players={data.players} isDemo={data.isDemo}/>{pending&&<PunishmentAlert punishment={pending} runs={data.runs}/>}<PlayerCards players={data.players} runs={data.runs}/><GlobalCards players={data.players} runs={data.runs}/><RecentRuns runs={data.runs}/></>;
}
