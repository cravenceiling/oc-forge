import { Header } from "@/components/common/header";

export default function ConfigEditorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
