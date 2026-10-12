import { verifySession } from "@/lib/auth/dal";
import { getAdminPageData } from "@/lib/auth/admin-actions";
import { MAX_INVITED_ADMINS } from "@/lib/db/schema";
import { AdminsBoard } from "./AdminsBoard";

export const metadata = {
  title: "Administratörer — Adminpanel",
};

export default async function AdministratorerPage() {
  await verifySession();
  const data = await getAdminPageData();

  return <AdminsBoard initialData={data} maxAdmins={MAX_INVITED_ADMINS} />;
}
