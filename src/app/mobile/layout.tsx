export default function MobileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div style={{ maxWidth: "430px", margin: "0 auto" }}>{children}</div>;
}
