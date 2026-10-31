import AdminStudio from "@/components/admin/AdminStudio";

import { passwordlessAdminEnabled } from "@/lib/siteContentStore";

export const metadata = {
  title: "Content Studio · OKNO",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminStudio passwordless={passwordlessAdminEnabled()} />;
}
