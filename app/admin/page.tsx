import { chatGPTSignInPath, chatGPTSignOutPath } from "../chatgpt-auth";
import { ownerIdentity } from "./authorization";
import AdminPanel from "./panel";
import SecondFactor from "./second-factor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const owner = await ownerIdentity();
  if (!owner.user) return <main className="admin-gate"><div><span className="admin-cherry">●</span><p className="eyebrow">ETAPA 1 DE 2</p><h1>Painel Mimo Cherry</h1><p>Entre com a conta autorizada para continuar.</p><a className="primary" href={chatGPTSignInPath("/admin")}>Entrar com segurança</a></div></main>;
  if (owner.reason === "forbidden") return <main className="admin-gate"><div><p className="eyebrow">ACESSO RESTRITO</p><h1>Esta conta não tem permissão.</h1><p>Você entrou como {owner.user.email}, mas apenas a proprietária cadastrada pode editar.</p><a className="text-link" href={chatGPTSignOutPath("/admin")}>Sair e usar outra conta</a></div></main>;
  if (owner.reason === "second-factor") return <SecondFactor email={owner.user.email} />;
  return <AdminPanel userName={owner.user.displayName} />;
}
