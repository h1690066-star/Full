import AdminClient from "./AdminClient";

export const metadata = {
  title: "XON BOZOR PRO — Admin Boshqaruv Paneli",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
