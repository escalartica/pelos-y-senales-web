import type { Metadata } from "next";
import { readdirSync } from "fs";
import path from "path";
import { isAdmin, adminConfigured } from "@/lib/admin";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminApp from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel de administración", robots: { index: false, follow: false } };

function fotosSesion() {
  try { return readdirSync(path.join(process.cwd(), "public/img/lasa")).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => `/img/lasa/${f}`); } catch { return []; }
}

export default async function Admin() {
  const ok = await isAdmin();
  return (
    <main className="adm">
      <div className="wrap">
        {ok ? <AdminApp fotos={fotosSesion()} /> : <AdminLogin configurado={adminConfigured()} />}
      </div>
    </main>
  );
}
